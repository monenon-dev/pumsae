import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_router.dart';
import 'theme/app_theme.dart';

void main() {
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
    );
  }
}
