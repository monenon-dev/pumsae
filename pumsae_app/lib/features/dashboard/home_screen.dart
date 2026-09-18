import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../trials/trials_provider.dart';
import 'dashboard_provider.dart';
import 'dojang_summary.dart';

// TODO: point this at pumsae.app once that custom domain is wired up in
// Vercel — it doesn't resolve yet, so the working production host is used
// for both the on-screen label and the actual link for now.
const _publicWebHost = 'pumsae.vercel.app';

String _roleLabel(String role) {
  switch (role) {
    case 'OWNER':
      return '관장';
    case 'INSTRUCTOR':
      return '사범';
    default:
      return role;
  }
}

Future<void> _openPublicPage(BuildContext context, String slug) async {
  final uri = Uri.https(_publicWebHost, '/$slug');
  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched && context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('페이지를 열지 못했습니다.')));
  }
}

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);
    final dojang = ref.watch(dojangProvider);
    final templateCount = ref.watch(templateCountProvider);
    final pendingCount = ref.watch(pendingTrialsCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('홈'),
        actions: [
          IconButton(
            onPressed: () => context.push('/profile'),
            icon: const Icon(Icons.person_outline),
            tooltip: '프로필',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _asyncContent<MeInfo>(
            me,
            (info) => Text(
              '안녕하세요, ${info.name}님 (${_roleLabel(info.role)})',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            () => ref.invalidate(meProvider),
          ),
          const SizedBox(height: 20),
          _DashboardCard(
            title: '체험 신청',
            onTap: () => context.push('/trials'),
            child: Text('대기 중 $pendingCount건'),
          ),
          const SizedBox(height: 12),
          _DashboardCard(
            title: '카드뉴스',
            onTap: () => context.push('/templates'),
            child: _asyncContent<int>(
              templateCount,
              (count) => Text('제작한 카드 $count개'),
              () => ref.invalidate(templateCountProvider),
            ),
          ),
          const SizedBox(height: 12),
          _DashboardCard(
            title: '홍보 페이지',
            onTap: dojang.value == null
                ? null
                : () => _openPublicPage(context, dojang.value!.slug),
            child: _asyncContent<DojangSummary>(
              dojang,
              (summary) => Text('$_publicWebHost/${summary.slug}'),
              () => ref.invalidate(dojangProvider),
            ),
          ),
        ],
      ),
    );
  }
}

/// Renders [value]'s data via [dataBuilder], a thin loading indicator while
/// pending, or an error message with a retry button.
Widget _asyncContent<T>(
  AsyncValue<T> value,
  Widget Function(T data) dataBuilder,
  VoidCallback onRetry,
) {
  return value.when(
    data: dataBuilder,
    loading: () => const SizedBox(
      height: 16,
      width: 120,
      child: LinearProgressIndicator(),
    ),
    error: (error, stackTrace) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('불러오지 못했어요', style: TextStyle(color: Colors.red)),
        TextButton(onPressed: onRetry, child: const Text('재시도')),
      ],
    ),
  );
}

class _DashboardCard extends StatelessWidget {
  const _DashboardCard({
    required this.title,
    required this.child,
    required this.onTap,
  });

  final String title;
  final Widget child;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    child,
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
