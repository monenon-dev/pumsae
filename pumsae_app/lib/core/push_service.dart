import 'dart:async';
import 'dart:io' show Platform;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import 'api_client.dart';

/// 체험 신청 푸시 알림(FCM).
///
/// 로그인하면 이 폰의 토큰을 서버에 등록하고, 로그아웃하면 해제한다.
/// Firebase 설정 파일(google-services.json)이 없는 빌드에서는 모든 동작이
/// 조용히 아무것도 하지 않는다. 앱의 나머지 기능은 푸시 없이도 그대로 돈다.
class PushService {
  PushService(this._apiClient);

  final ApiClient _apiClient;
  StreamSubscription<String>? _tokenRefreshSub;

  static bool _ready = false;

  /// main()에서 runApp 전에 한 번 부른다.
  static Future<void> initialize() async {
    if (kIsWeb || !(Platform.isAndroid || Platform.isIOS)) return;
    try {
      await Firebase.initializeApp();
      _ready = true;
    } catch (error) {
      debugPrint('Push disabled: Firebase is not configured ($error)');
    }
  }

  /// 알림을 눌러 앱이 열렸을 때(꺼져 있던 앱이 켜진 경우 포함) 그 메시지.
  static Stream<RemoteMessage> get onOpened =>
      _ready ? FirebaseMessaging.onMessageOpenedApp : const Stream.empty();

  static Future<RemoteMessage?> initialMessage() async =>
      _ready ? FirebaseMessaging.instance.getInitialMessage() : null;

  /// 알림 권한을 묻고(Android 13+, iOS) 토큰을 서버에 등록한다.
  Future<void> register() async {
    if (!_ready) return;
    try {
      final messaging = FirebaseMessaging.instance;
      final permission = await messaging.requestPermission();
      if (permission.authorizationStatus == AuthorizationStatus.denied) return;

      final token = await messaging.getToken();
      if (token != null) await _send(token);
      _tokenRefreshSub ??= messaging.onTokenRefresh.listen((token) {
        _send(token).catchError((Object error) {
          debugPrint('Push token refresh upload failed: $error');
        });
      });
    } catch (error) {
      debugPrint('Push register failed: $error');
    }
  }

  /// 로그아웃 전에 부른다(액세스 토큰이 아직 살아 있어야 서버에 요청할 수 있다).
  Future<void> unregister() async {
    if (!_ready) return;
    await _tokenRefreshSub?.cancel();
    _tokenRefreshSub = null;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        await _apiClient.dio.post<void>(
          '/dashboard/devices/unregister',
          data: {'token': token},
        );
      }
    } catch (error) {
      // 실패해도 로그아웃은 진행한다. 남은 토큰은 다음 로그인 계정으로 옮겨지거나,
      // 앱을 지우면 서버가 푸시 실패를 보고 지운다.
      debugPrint('Push unregister failed: $error');
    }
  }

  Future<void> _send(String token) {
    return _apiClient.dio.put<void>(
      '/dashboard/devices',
      data: {'token': token, 'platform': Platform.isIOS ? 'ios' : 'android'},
    );
  }
}
