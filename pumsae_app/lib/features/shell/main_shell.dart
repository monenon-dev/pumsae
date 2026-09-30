import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_provider.dart';
import '../../core/push_service.dart';
import '../albums/albums_provider.dart';
import '../calendar/calendar_repository.dart';
import '../dashboard/dashboard_provider.dart';
import '../templates/templates_provider.dart';
import '../trials/trials_provider.dart';

const _homeTab = 0;
const _trialsTab = 3;

/// 로그인 후 화면의 뼈대: 아래 탭바와, 지금 고른 탭의 화면.
class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  StreamSubscription<RemoteMessage>? _openedSub;

  StatefulNavigationShell get navigationShell => widget.navigationShell;

  @override
  void initState() {
    super.initState();
    // 이 화면은 로그인한 뒤에만 보이므로, 여기서 푸시 토큰을 등록한다.
    ref.read(pushServiceProvider).register();
    _openedSub = PushService.onOpened.listen(_openFromPush);
    PushService.initialMessage().then((message) {
      if (message != null && mounted) _openFromPush(message);
    });
  }

  @override
  void dispose() {
    _openedSub?.cancel();
    super.dispose();
  }

  /// 체험 신청 알림을 누르고 들어오면 체험 신청 탭을 연다.
  void _openFromPush(RemoteMessage message) {
    if (message.data['type'] != 'trial.created') return;
    // 앱이 뒤에 있는 동안 소켓이 끊겼을 수 있어서 목록을 새로 받는다.
    ref.invalidate(trialsProvider);
    navigationShell.goBranch(_trialsTab);
  }

  void _onSelect(int index) {
    if (index == _homeTab && navigationShell.currentIndex != _homeTab) {
      // 탭 화면은 떠나도 살아 있어서, 다른 탭에서 바꾼 앨범·일정 등이 홈 요약에
      // 늦게 반영된다. 홈으로 돌아올 때 한 번 새로 받는다.
      ref.invalidate(dojangProvider);
      ref.invalidate(upcomingEventsProvider);
      ref.invalidate(albumsProvider);
      ref.invalidate(templatesProvider);
    }
    navigationShell.goBranch(
      index,
      // 지금 탭을 다시 누르면 그 탭의 첫 화면으로 돌아간다.
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    // 셸이 체험 신청을 지켜보고 있어서, 어느 탭에 있든 소켓이 연결되어
    // 새 신청이 들어오면 탭 배지 숫자가 바로 오른다.
    final pending = ref.watch(pendingTrialsCountProvider);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _onSelect,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '홈',
          ),
          const NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: '일정',
          ),
          const NavigationDestination(
            icon: Icon(Icons.photo_library_outlined),
            selectedIcon: Icon(Icons.photo_library),
            label: '사진첩',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: pending > 0,
              label: Text('$pending'),
              child: const Icon(Icons.event_available_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: pending > 0,
              label: Text('$pending'),
              child: const Icon(Icons.event_available),
            ),
            label: '체험 신청',
          ),
          const NavigationDestination(
            icon: Icon(Icons.menu),
            label: '더보기',
          ),
        ],
      ),
    );
  }
}
