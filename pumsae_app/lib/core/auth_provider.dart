import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import 'api_client.dart';
import 'auth_repository.dart';
import 'push_service.dart';

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  const AuthState({required this.status, this.user});

  final AuthStatus status;
  final User? user;

  static const loading = AuthState(status: AuthStatus.loading);
  static const unauthenticated = AuthState(status: AuthStatus.unauthenticated);

  factory AuthState.authenticated(User user) =>
      AuthState(status: AuthStatus.authenticated, user: user);

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._push) : super(AuthState.loading) {
    _sessionExpiredSub = _repository.onSessionExpired.listen((_) {
      state = AuthState.unauthenticated;
    });
    _restore();
  }

  final AuthRepository _repository;
  final PushService _push;
  late final StreamSubscription<void> _sessionExpiredSub;

  Future<void> _restore() async {
    final user = await _repository.tryRestoreSession();
    state = user != null
        ? AuthState.authenticated(user)
        : AuthState.unauthenticated;
  }

  // Deliberately does not flip `state` to AuthState.loading while the
  // request is in flight: AuthStatus.loading is what the router uses to
  // show the startup splash screen, so reusing it here would bounce the
  // user off the login screen mid-submit. Callers track their own
  // screen-local submitting flag instead.
  Future<void> login({required String email, required String password}) async {
    final user = await _repository.login(email: email, password: password);
    state = AuthState.authenticated(user);
  }

  Future<void> register({
    required String dojangName,
    required String name,
    required String email,
    required String password,
  }) async {
    final user = await _repository.register(
      dojangName: dojangName,
      name: name,
      email: email,
      password: password,
    );
    state = AuthState.authenticated(user);
  }

  Future<void> logout() async {
    // 로그아웃한 폰으로 체험 신청 알림이 계속 가지 않게, 세션이 살아 있을 때 먼저 해제한다.
    await _push.unregister();
    await _repository.logout();
    state = AuthState.unauthenticated;
  }

  @override
  void dispose() {
    _sessionExpiredSub.cancel();
    super.dispose();
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient();
  ref.onDispose(client.dispose);
  return client;
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(apiClientProvider));
});

final pushServiceProvider = Provider<PushService>((ref) {
  return PushService(ref.watch(apiClientProvider));
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(pushServiceProvider),
  );
});
