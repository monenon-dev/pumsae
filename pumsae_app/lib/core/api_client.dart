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
class _SecureCookieStorage implements Storage {
  _SecureCookieStorage(this._secureStorage);

  final FlutterSecureStorage _secureStorage;
  String _prefix = '';

  @override
  Future<void> init(bool persistSession, bool ignoreExpires) async {
    _prefix =
        'pumsae_cookie_ie${ignoreExpires ? 1 : 0}_ps${persistSession ? 1 : 0}_';
  }

  String _key(String key) => '$_prefix$key';

  @override
  Future<String?> read(String key) => _secureStorage.read(key: _key(key));

  @override
  Future<void> write(String key, String value) =>
      _secureStorage.write(key: _key(key), value: value);

  @override
  Future<void> delete(String key) => _secureStorage.delete(key: _key(key));

  @override
  Future<void> deleteAll(List<String> keys) async {
    for (final key in keys) {
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
    _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl))
      ..interceptors.add(CookieManager(_cookieJar))
      ..interceptors.add(_AuthInterceptor(this));

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
    _rawDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl))
      ..interceptors.add(CookieManager(_cookieJar));
  }

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

  /// The shared Dio instance every API call (other than /auth/refresh
  /// itself) should be made through.
  Dio get dio => _dio;

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
