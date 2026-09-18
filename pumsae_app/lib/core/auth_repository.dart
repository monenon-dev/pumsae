import 'package:dio/dio.dart';

import 'api_client.dart';

class User {
  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.dojangId,
  });

  final String id;
  final String email;
  final String name;

  /// "OWNER" | "INSTRUCTOR", as sent by the backend.
  final String role;
  final String? dojangId;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      dojangId: json['dojangId'] as String?,
    );
  }
}

/// Thrown by [AuthRepository] on a failed login/register/logout call, with
/// a message suitable for showing directly to the user (mirrors the
/// backend's HTTPException `detail` field where available).
class AuthException implements Exception {
  AuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

class AuthRepository {
  AuthRepository(this._apiClient);

  final ApiClient _apiClient;

  /// Fires when a session ends outside of an explicit [logout] call (e.g. a
  /// background token refresh discovers the refresh_token has expired).
  Stream<void> get onSessionExpired => _apiClient.onSessionExpired;

  Future<User> login({required String email, required String password}) {
    return _authenticate(
      () => _apiClient.dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email, 'password': password},
      ),
    );
  }

  Future<User> register({
    required String dojangName,
    required String name,
    required String email,
    required String password,
  }) {
    return _authenticate(
      () => _apiClient.dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'dojangName': dojangName,
          'name': name,
          'email': email,
          'password': password,
        },
      ),
    );
  }

  /// Called once at app startup to silently resume a session from the
  /// persisted refresh_token cookie, if one is still valid. Returns null
  /// (rather than throwing) when there is no session to restore.
  Future<User?> tryRestoreSession() async {
    final data = await _apiClient.refreshAccessToken();
    if (data == null) {
      return null;
    }
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    try {
      await _apiClient.dio.post<void>('/auth/logout');
    } on DioException {
      // Best-effort: the local session is dropped below regardless.
    } finally {
      await _apiClient.clearSession();
    }
  }

  Future<User> _authenticate(
    Future<Response<Map<String, dynamic>>> Function() request,
  ) async {
    try {
      final response = await request();
      final data = response.data;
      if (data == null) {
        throw AuthException('서버 응답을 확인할 수 없습니다.');
      }
      _apiClient.setAccessToken(data['accessToken'] as String?);
      return User.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw AuthException(_messageFromDioError(error));
    }
  }

  String _messageFromDioError(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['detail'] is String) {
      return data['detail'] as String;
    }
    return '요청을 처리하지 못했습니다.';
  }
}
