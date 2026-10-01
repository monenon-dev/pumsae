import 'dart:async';
import 'dart:io' show Platform;

import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Resolves the PUMSAE backend base URL.
///
/// In release builds this is injected at build time via
/// `--dart-define=API_BASE_URL=https://...`. Without that define, we fall
/// back to whichever loopback address actually reaches a machine-local
/// backend from the dev target: the Android emulator maps its host's
/// localhost to 10.0.2.2, while the iOS simulator shares localhost directly.
class ApiConfig {
  ApiConfig._();

  static const String _envBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://localhost:8000';
  }
}

/// Persists cookie_jar's cookie data (the httpOnly refresh_token cookie set
/// by /auth/*) through flutter_secure_storage instead of plaintext files, so
/// it stays encrypted at rest between app launches.
///
/// Secure storage reads are slow (each one decrypts through the platform
/// keystore), and the cookie jar reads several keys per request. So [init]
/// loads every cookie key once with a single readAll() and later reads are
/// served from memory; writes and deletes still go straight to disk.
class _SecureCookieStorage implements Storage {
  _SecureCookieStorage(this._secureStorage);

  final FlutterSecureStorage _secureStorage;
  String _prefix = '';
  final Map<String, String> _cache = {};

  @override
  Future<void> init(bool persistSession, bool ignoreExpires) async {
    _prefix =
        'pumsae_cookie_ie${ignoreExpires ? 1 : 0}_ps${persistSession ? 1 : 0}_';
    final all = await _secureStorage.readAll();
    _cache
      ..clear()
      ..addEntries(
        all.entries
            .where((entry) => entry.key.startsWith(_prefix))
            .map((entry) => MapEntry(entry.key.substring(_prefix.length), entry.value)),
      );
  }

  String _key(String key) => '$_prefix$key';

  @override
  Future<String?> read(String key) async => _cache[key];

  @override
  Future<void> write(String key, String value) {
    _cache[key] = value;
    return _secureStorage.write(key: _key(key), value: value);
  }

  @override
  Future<void> delete(String key) {
    _cache.remove(key);
    return _secureStorage.delete(key: _key(key));
  }

  @override
  Future<void> deleteAll(List<String> keys) async {
    for (final key in keys) {
      _cache.remove(key);
      await _secureStorage.delete(key: _key(key));
    }
  }
}

/// Owns the Dio instance(s), the persisted cookie jar, and the in-memory
/// access token for talking to the PUMSAE backend.
///
/// The access token lives only in a private instance field — it is never
/// written to disk or secure storage, matching the web client's policy.
/// Only the refresh_token cookie (already httpOnly on the backend) is
/// persisted, via [_SecureCookieStorage].
class ApiClient {
  ApiClient()
      : _cookieJar = PersistCookieJar(
          storage: _SecureCookieStorage(const FlutterSecureStorage()),
        ) {
    // 일반 API는 Bearer 액세스 토큰만 쓰고 쿠키가 필요 없어서 CookieManager를 달지
    // 않는다(요청마다 쿠키 저장소를 거치느라 홈 화면 요청들이 늦게 출발했다).
    // 쿠키(refresh_token)를 주고받는 /auth/* 요청은 [authDio]로 보낸다.
    _dio = Dio(_options)..interceptors.add(_AuthInterceptor(this));

    // A second, plain Dio used for /auth/refresh and for replaying a
    // request after a 401. It shares the same cookie jar but deliberately
    // skips _AuthInterceptor: that interceptor is a QueuedInterceptor,
    // which serializes all interceptor processing on _dio to one request
    // at a time. Refreshing or retrying through _dio itself would try to
    // run a second request's onRequest/onError while the first request's
    // onError (the one doing the refresh/retry) is still on the queue
    // waiting for it — a self-deadlock. This only surfaces once a retried
    // request fails again (e.g. a business-logic 401 like a wrong current
    // password), since a retry that succeeds never re-enters onError.
    _rawDio = Dio(_options)
      ..interceptors.add(CookieManager(_cookieJar))
      // 두 Dio가 같은 연결 풀을 쓰게 해서, 앱 시작 때 세션 복원(/auth/refresh)으로
      // 열어 둔 연결을 바로 뒤 홈 화면 요청들이 이어 쓴다(TLS 연결을 새로 맺지 않음).
      ..httpClientAdapter = _dio.httpClientAdapter;
  }

  /// 연결이 안 되거나 서버가 응답하지 않을 때 끝없이 기다리지 않게 한다.
  /// 보내는 시간(sendTimeout)은 사진 업로드 때문에 따로 제한하지 않는다.
  static final BaseOptions _options = BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
  );

  late final Dio _dio;
  late final Dio _rawDio;
  final PersistCookieJar _cookieJar;

  String? _accessToken;
  Future<Map<String, dynamic>?>? _refreshInFlight;

  final StreamController<void> _sessionExpiredController =
      StreamController<void>.broadcast();

  /// Fires when a token refresh fails outside of an explicit login/register
  /// call (i.e. the refresh_token itself is gone or expired), so the app can
  /// drop back to an unauthenticated state even without a direct call chain
  /// back to whoever triggered the failing request.
  Stream<void> get onSessionExpired => _sessionExpiredController.stream;

  /// The shared Dio instance every API call (other than /auth/*) should be
  /// made through.
  Dio get dio => _dio;

  /// Dio for /auth/login, /auth/register and /auth/logout: the only calls
  /// that set or clear the refresh_token cookie, so the only ones (besides
  /// the internal refresh) that go through the cookie jar.
  Dio get authDio => _rawDio;

  String? get accessToken => _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Future<void> clearSession() async {
    _accessToken = null;
    await _cookieJar.deleteAll();
  }

  /// Calls POST /auth/refresh using the persisted refresh_token cookie.
  /// On success, updates the in-memory access token and returns the raw
  /// response body (so callers can also pull `user` out of it). On failure,
  /// clears the access token, emits [onSessionExpired], and returns null.
  ///
  /// Concurrent callers share a single in-flight request.
  Future<Map<String, dynamic>?> refreshAccessToken() {
    return _refreshInFlight ??= _performRefresh().whenComplete(() {
      _refreshInFlight = null;
    });
  }

  /// Replays [options] (a request that just failed with a 401) on the
  /// interceptor-free Dio instance, after the caller has refreshed the
  /// access token and updated `options.headers`. See the constructor
  /// comment on `_rawDio` for why this can't go through [dio] itself.
  Future<Response<dynamic>> retry(RequestOptions options) {
    return _rawDio.fetch(options);
  }

  Future<Map<String, dynamic>?> _performRefresh() async {
    try {
      final response = await _rawDio.post<Map<String, dynamic>>(
        '/auth/refresh',
      );
      final data = response.data;
      if (data == null) {
        _accessToken = null;
        _sessionExpiredController.add(null);
        return null;
      }
      _accessToken = data['accessToken'] as String?;
      return data;
    } on DioException {
      _accessToken = null;
      _sessionExpiredController.add(null);
      return null;
    }
  }

  void dispose() {
    _sessionExpiredController.close();
  }
}

class _AuthInterceptor extends QueuedInterceptor {
  _AuthInterceptor(this._client);

  final ApiClient _client;

  static const _retriedKey = 'pumsaeRetried';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _client.accessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final options = err.requestOptions;
    final isAuthEndpoint = options.path.startsWith('/auth/');
    final alreadyRetried = options.extra[_retriedKey] == true;

    if (err.response?.statusCode != 401 || isAuthEndpoint || alreadyRetried) {
      handler.next(err);
      return;
    }

    final refreshed = await _client.refreshAccessToken();
    if (refreshed == null) {
      handler.next(err);
      return;
    }

    try {
      options.extra[_retriedKey] = true;
      final token = _client.accessToken;
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      final response = await _client.retry(options);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }
}
