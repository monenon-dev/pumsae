import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_router.dart';
import 'core/auth_provider.dart';
import 'core/push_service.dart';
import 'features/intro/intro_gate.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PushService.initialize();
  runApp(const ProviderScope(child: PumsaeApp()));
}

class PumsaeApp extends ConsumerWidget {
  const PumsaeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Reading goRouterProvider here builds the router (and, through its
    // redirect/refreshListenable wiring, touches authProvider) as soon as
    // the app starts, which is what kicks off the one-time
    // authRepository.tryRestoreSession() call inside AuthNotifier.
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'PUMSAE',
      theme: AppTheme.light(),
      routerConfig: router,
      // 날짜·시간 선택기와 기본 문구를 한국어로.
      locale: const Locale('ko', 'KR'),
      supportedLocales: const [Locale('ko', 'KR'), Locale('en')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      // 라우터 화면 전체를 인트로로 한 번 덮는다. builder 안의 위젯은 앱이 사는
      // 동안 유지되므로 인트로는 실행당 한 번만 나온다. authProvider는 여기서만
      // watch해서, 상태가 바뀌어도 MaterialApp 전체가 다시 빌드되지 않게 한다.
      builder: (context, child) => Consumer(
        builder: (context, ref, _) => IntroGate(
          ready: !ref.watch(authProvider).isLoading,
          child: child ?? const SizedBox.shrink(),
        ),
      ),
    );
  }
}
