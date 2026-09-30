import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_router.dart';
import 'core/push_service.dart';
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
    );
  }
}
