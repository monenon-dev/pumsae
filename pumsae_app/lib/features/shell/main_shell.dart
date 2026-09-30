import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../albums/albums_provider.dart';
import '../calendar/calendar_repository.dart';
import '../dashboard/dashboard_provider.dart';
import '../templates/templates_provider.dart';
import '../trials/trials_provider.dart';

const _homeTab = 0;

/// 로그인 후 화면의 뼈대: 아래 탭바와, 지금 고른 탭의 화면.
class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _onSelect(WidgetRef ref, int index) {
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
  Widget build(BuildContext context, WidgetRef ref) {
    // 셸이 체험 신청을 지켜보고 있어서, 어느 탭에 있든 소켓이 연결되어
    // 새 신청이 들어오면 탭 배지 숫자가 바로 오른다.
    final pending = ref.watch(pendingTrialsCountProvider);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => _onSelect(ref, index),
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
