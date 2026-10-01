import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/auth_provider.dart';
import 'features/albums/album_detail_screen.dart';
import 'features/albums/albums_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/calendar/calendar_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/dashboard/home_screen.dart';
import 'features/intro/pumsae_loader.dart';
import 'features/shell/main_shell.dart';
import 'features/shell/more_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/templates/templates_screen.dart';
import 'features/trials/trials_screen.dart';

/// Bridges Riverpod's authProvider to go_router's `refreshListenable`, so
/// the router re-runs its redirect logic every time auth state changes
/// (login, logout, session-restore finishing, a background session expiry).
class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Ref ref) {
    _subscription = ref.listen<AuthState>(
      authProvider,
      (previous, next) => notifyListeners(),
    );
  }

  late final ProviderSubscription<AuthState> _subscription;

  @override
  void dispose() {
    _subscription.close();
    super.dispose();
  }
}

const _splashPath = '/splash';
const _loginPath = '/login';
const _registerPath = '/register';
const _homePath = '/home';
const _trialsPath = '/trials';
const _templatesPath = '/templates';
const _profilePath = '/profile';
const _albumsPath = '/albums';
const _calendarPath = '/calendar';
const _morePath = '/more';

final goRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = _AuthRefreshNotifier(ref);
  ref.onDispose(refreshNotifier.dispose);

  return GoRouter(
    initialLocation: _splashPath,
    refreshListenable: refreshNotifier,
    // Reading authProvider here (rather than watching) both decides the
    // redirect and, as a side effect of first touching the provider,
    // kicks off AuthNotifier's one-time startup session restore.
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final location = state.matchedLocation;
      // "Entry" routes: places an authenticated user shouldn't linger on.
      // Splash belongs here too — without it, a session restore that
      // resolves to authenticated while still on /splash has nowhere in
      // this switch to send it, and the app is stuck on the spinner forever.
      final isEntryRoute =
          location == _splashPath || location == _loginPath || location == _registerPath;

      switch (authState.status) {
        case AuthStatus.loading:
          return location == _splashPath ? null : _splashPath;
        case AuthStatus.unauthenticated:
          return location == _loginPath || location == _registerPath ? null : _loginPath;
        case AuthStatus.authenticated:
          return isEntryRoute ? _homePath : null;
      }
    },
    routes: [
      GoRoute(
        path: _splashPath,
        builder: (context, state) => const _SplashScreen(),
      ),
      GoRoute(
        path: _loginPath,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: _registerPath,
        builder: (context, state) => const RegisterScreen(),
      ),
      // 하단 탭 5개. 탭마다 자기 내비게이터를 가져서, 탭을 옮겨 다녀도 각 탭의
      // 스크롤 위치·열어 둔 앨범 같은 상태가 그대로 남는다.
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: _homePath,
              builder: (context, state) => const HomeScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: _calendarPath,
              builder: (context, state) => const CalendarScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: _albumsPath,
              builder: (context, state) => const AlbumsScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) =>
                      AlbumDetailScreen(albumId: state.pathParameters['id']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: _trialsPath,
              builder: (context, state) => const TrialsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: _morePath,
              builder: (context, state) => const MoreScreen(),
            ),
          ]),
        ],
      ),
      // 탭 밖 화면: 탭바 없이 전체 화면으로 위에 쌓인다.
      GoRoute(
        path: _templatesPath,
        builder: (context, state) => const TemplatesScreen(),
      ),
      GoRoute(
        path: _profilePath,
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: PumsaeLoader.overlay());
  }
}
