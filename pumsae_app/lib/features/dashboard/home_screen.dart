import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../templates/promo_template.dart';
import '../templates/templates_provider.dart';
import '../trials/trial_request.dart';
import '../trials/trials_provider.dart';
import 'dashboard_provider.dart';
import 'dojang_summary.dart';

// TODO: point this at pumsae.app once that custom domain is wired up in
// Vercel — it doesn't resolve yet, so the working production host is used
// for both the on-screen label and the actual link for now.
const _publicWebHost = 'pumsae.vercel.app';

const _recentTemplates = 4;
const _recentTrials = 5;

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

String _formatShortDate(DateTime value) {
  final local = value.toLocal();
  return '${local.month}월 ${local.day}일';
}

Future<void> _openWeb(BuildContext context, String path) async {
  final uri = Uri.https(_publicWebHost, path);
  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched && context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('페이지를 열지 못했습니다.')));
  }
}

/// 앱의 첫 화면. 웹 대시보드의 "내 작업물"과 같이 홈페이지·카드뉴스·체험 신청을
/// 한눈에 보여준다.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('내 작업물'),
        actions: [
          IconButton(
            onPressed: () => context.push('/profile'),
            icon: const Icon(Icons.person_outline),
            tooltip: '프로필',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(meProvider);
          ref.invalidate(dojangProvider);
          ref.invalidate(templatesProvider);
          ref.invalidate(trialsProvider);
          try {
            await ref.read(dojangProvider.future);
          } catch (_) {
            // 실패는 각 카드가 "불러오지 못했어요 · 재시도"로 보여준다.
          }
        },
        child: ListView(
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
            const SizedBox(height: 4),
            Text(
              '지금까지 만든 홈페이지와 카드뉴스, 들어온 체험 신청이에요.',
              style: TextStyle(color: Theme.of(context).hintColor),
            ),
            const SizedBox(height: 20),
            const _LandingSection(),
            const SizedBox(height: 12),
            const _TemplatesSection(),
            const SizedBox(height: 12),
            const _TrialsSection(),
          ],
        ),
      ),
    );
  }
}

class _LandingSection extends ConsumerWidget {
  const _LandingSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dojang = ref.watch(dojangProvider);

    return _SectionCard(
      icon: Icons.public,
      title: '내 홈페이지',
      trailing: dojang.value?.published == false ? const _Pill('미완성') : null,
      child: _asyncContent<DojangSummary>(
        dojang,
        (summary) {
          final address = '$_publicWebHost/${summary.slug}';
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                summary.published
                    ? '학부모님께 이 주소를 공유하세요.'
                    : '아직 저장하지 않았어요. 웹에서 편집하고 저장하면 공개돼요.',
                style: TextStyle(color: Theme.of(context).hintColor),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  address,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  OutlinedButton.icon(
                    onPressed: () async {
                      await Clipboard.setData(ClipboardData(text: 'https://$address'));
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('주소를 복사했어요.')),
                        );
                      }
                    },
                    icon: const Icon(Icons.copy, size: 18),
                    label: const Text('주소 복사'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => _openWeb(context, '/${summary.slug}'),
                    icon: const Icon(Icons.open_in_new, size: 18),
                    label: const Text('공개 페이지 보기'),
                  ),
                  FilledButton.icon(
                    // 랜딩페이지 편집기는 웹에만 있어서 브라우저로 연다.
                    onPressed: () => _openWeb(context, '/dashboard/landing'),
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    label: const Text('웹에서 편집'),
                  ),
                ],
              ),
            ],
          );
        },
        () => ref.invalidate(dojangProvider),
      ),
    );
  }
}

class _TemplatesSection extends ConsumerWidget {
  const _TemplatesSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final templates = ref.watch(templatesProvider);

    return _SectionCard(
      icon: Icons.image_outlined,
      title: '카드뉴스',
      onMore: () => context.push('/templates'),
      child: _asyncContent<List<PromoTemplate>>(
        templates,
        (rows) {
          if (rows.isEmpty) {
            return Text(
              '아직 만든 카드뉴스가 없어요.',
              style: TextStyle(color: Theme.of(context).hintColor),
            );
          }
          final recent = [...rows]
            ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('지금까지 ${rows.length}개 만들었어요.'),
              const SizedBox(height: 4),
              for (final template in recent.take(_recentTemplates))
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  leading: template.thumbnailUrl == null
                      ? const Icon(Icons.crop_square)
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: Image.network(
                            template.thumbnailUrl!,
                            width: 40,
                            height: 40,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(Icons.crop_square),
                          ),
                        ),
                  title: Text(template.title, overflow: TextOverflow.ellipsis),
                  subtitle: Text(
                    '${template.typeLabel} · ${_formatShortDate(template.createdAt)}',
                  ),
                  onTap: () => context.push('/templates'),
                ),
            ],
          );
        },
        () => ref.invalidate(templatesProvider),
      ),
    );
  }
}

class _TrialsSection extends ConsumerWidget {
  const _TrialsSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trials = ref.watch(trialsProvider);
    final pending = ref.watch(pendingTrialsCountProvider);

    return _SectionCard(
      icon: Icons.event_available_outlined,
      title: '체험 신청',
      trailing: pending > 0 ? _Pill('대기 $pending') : null,
      onMore: () => context.push('/trials'),
      child: _asyncContent<List<TrialRequest>>(
        trials,
        (rows) {
          if (rows.isEmpty) {
            return Text(
              '아직 들어온 체험 신청이 없어요. 홈페이지 주소를 공유해 보세요.',
              style: TextStyle(color: Theme.of(context).hintColor),
            );
          }
          final recent = [...rows]
            ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                pending > 0
                    ? '확인하지 않은 신청이 $pending건 있어요.'
                    : '지금까지 ${rows.length}건 받았어요.',
              ),
              const SizedBox(height: 4),
              for (final trial in recent.take(_recentTrials))
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text(
                    trial.desiredClass == null
                        ? trial.studentName
                        : '${trial.studentName} · ${trialClassLabels[trial.desiredClass] ?? trial.desiredClass}',
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(_formatShortDate(trial.createdAt)),
                  trailing: Text(
                    trialStatusLabels[trial.status] ?? trial.status,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: trial.status == 'PENDING'
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).hintColor,
                    ),
                  ),
                  onTap: () => context.push('/trials'),
                ),
            ],
          );
        },
        () => ref.invalidate(trialsProvider),
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

class _Pill extends StatelessWidget {
  const _Pill(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: colorScheme.primary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: colorScheme.onPrimary,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.icon,
    required this.title,
    required this.child,
    this.trailing,
    this.onMore,
  });

  final IconData icon;
  final String title;
  final Widget child;
  final Widget? trailing;
  final VoidCallback? onMore;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: colorScheme.primaryContainer,
                  foregroundColor: colorScheme.onPrimaryContainer,
                  child: Icon(icon, size: 20),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                if (trailing != null) ...[
                  const SizedBox(width: 8),
                  trailing!,
                ],
                const Spacer(),
                if (onMore != null)
                  TextButton(onPressed: onMore, child: const Text('전체 보기')),
              ],
            ),
            const SizedBox(height: 10),
            child,
          ],
        ),
      ),
    );
  }
}
