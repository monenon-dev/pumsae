import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../albums/album.dart';
import '../albums/albums_provider.dart';
import '../calendar/calendar_event.dart';
import '../calendar/calendar_repository.dart';
import '../intro/pumsae_loader.dart';
import '../../theme/app_theme.dart';
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

const _recentTrials = 3;

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

Future<void> openWeb(BuildContext context, String path) async {
  final uri = Uri.https(_publicWebHost, path);
  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched && context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('페이지를 열지 못했습니다.')));
  }
}

/// 홈 탭. 할 일을 숫자 타일로 한눈에 보여주고, 자세한 건 각 탭에서 본다.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('홈')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(meProvider);
          ref.invalidate(dojangProvider);
          ref.invalidate(templatesProvider);
          ref.invalidate(albumsProvider);
          ref.invalidate(upcomingEventsProvider);
          ref.invalidate(trialsProvider);
          try {
            await ref.read(dojangProvider.future);
          } catch (_) {
            // 실패는 각 타일·카드가 따로 보여준다.
          }
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            _GreetingCard(me: me, onRetry: () => ref.invalidate(meProvider)),
            const SizedBox(height: 16),
            const _StatGrid(),
            const SizedBox(height: 16),
            const _LandingCard(),
            const SizedBox(height: 20),
            const _RecentTrials(),
          ],
        ),
      ),
    );
  }
}

/// 홈 맨 위의 차콜 카드. 아래 타일의 기능 색과 빨강 포인트가 또렷하게 대비된다.
class _GreetingCard extends StatelessWidget {
  const _GreetingCard({required this.me, required this.onRetry});

  final AsyncValue<MeInfo> me;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    const faded = Color(0xCCFFFFFF);
    final today = formatDayTitle(dateKey(DateTime.now()));

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(16),
      ),
      child: me.when(
        data: (info) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(today, style: const TextStyle(color: faded, fontSize: 13)),
            const SizedBox(height: 6),
            Text(
              '안녕하세요, ${info.name}님',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              [
                if (info.dojangName != null) info.dojangName!,
                _roleLabel(info.role),
              ].join(' · '),
              style: const TextStyle(color: faded, fontSize: 14),
            ),
          ],
        ),
        loading: () => const SizedBox(
          height: 70,
          child: Center(child: PumsaeLoader(size: 40)),
        ),
        error: (error, stackTrace) => Row(
          children: [
            const Text('불러오지 못했어요', style: TextStyle(color: Colors.white)),
            TextButton(
              onPressed: onRetry,
              child: const Text('재시도', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatGrid extends ConsumerWidget {
  const _StatGrid();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trials = ref.watch(trialsProvider);
    final pending = ref.watch(pendingTrialsCountProvider);
    final events = ref.watch(upcomingEventsProvider);
    final albums = ref.watch(albumsProvider);
    final templates = ref.watch(templatesProvider);

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.45,
      children: [
        _StatTile.fromAsync<List<TrialRequest>>(
          value: trials,
          icon: Icons.event_available_outlined,
          label: '체험 대기',
          tint: AppColors.trials,
          highlight: pending > 0,
          number: (_) => '$pending건',
          caption: (rows) => '지금까지 ${rows.length}건 받음',
          onTap: () => context.go('/trials'),
        ),
        _StatTile.fromAsync<List<CalendarEvent>>(
          value: events,
          icon: Icons.calendar_month_outlined,
          label: '2주 내 일정',
          tint: AppColors.calendar,
          number: (rows) => '${rows.length}개',
          caption: (rows) => rows.isEmpty
              ? '등록된 일정 없음'
              : '${formatDayTitle(rows.first.date)} ${rows.first.title}',
          onTap: () => context.go('/calendar'),
        ),
        _StatTile.fromAsync<List<AlbumSummary>>(
          value: albums,
          icon: Icons.photo_library_outlined,
          label: '사진첩',
          tint: AppColors.albums,
          number: (rows) => '앨범 ${rows.length}개',
          caption: (rows) =>
              '사진 ${rows.fold<int>(0, (sum, album) => sum + album.photoCount)}장',
          onTap: () => context.go('/albums'),
        ),
        _StatTile.fromAsync<List<PromoTemplate>>(
          value: templates,
          icon: Icons.image_outlined,
          label: '카드뉴스',
          tint: AppColors.templates,
          number: (rows) => '${rows.length}개',
          caption: (_) => '보기 · 갤러리 저장',
          onTap: () => context.push('/templates'),
        ),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.label,
    required this.number,
    required this.caption,
    required this.onTap,
    required this.tint,
    this.highlight = false,
  });

  /// [value]가 불러오는 중이면 '–', 실패하면 '!'를 숫자 자리에 보여준다.
  static _StatTile fromAsync<T>({
    required AsyncValue<T> value,
    required IconData icon,
    required String label,
    required String Function(T data) number,
    required String Function(T data) caption,
    required VoidCallback onTap,
    required Color tint,
    bool highlight = false,
  }) {
    return value.when(
      data: (data) => _StatTile(
        icon: icon,
        label: label,
        number: number(data),
        caption: caption(data),
        onTap: onTap,
        tint: tint,
        highlight: highlight,
      ),
      loading: () => _StatTile(
        icon: icon,
        label: label,
        number: '–',
        caption: '불러오는 중',
        onTap: onTap,
        tint: tint,
      ),
      error: (error, stackTrace) => _StatTile(
        icon: icon,
        label: label,
        number: '!',
        caption: '당겨서 새로고침',
        onTap: onTap,
        tint: tint,
      ),
    );
  }

  final IconData icon;
  final String label;
  final String number;
  final String caption;
  final VoidCallback onTap;

  /// 기능 구분 색. 아이콘과 그 뒤 옅은 원에만 쓴다.
  final Color tint;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final muted = colorScheme.onSurfaceVariant;

    return Material(
      color: colorScheme.surfaceContainerLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: colorScheme.outlineVariant),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: tint.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 17, color: tint),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    label,
                    style: TextStyle(
                      color: colorScheme.onSurface,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  // 처리할 게 있을 때만 빨간 점으로 눈에 띄게.
                  if (highlight)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const Spacer(),
              Text(
                number,
                style: TextStyle(
                  color: highlight ? colorScheme.primary : colorScheme.onSurface,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                caption,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: muted, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LandingCard extends ConsumerWidget {
  const _LandingCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dojang = ref.watch(dojangProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Material(
      color: colorScheme.surfaceContainerLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: colorScheme.outlineVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
        child: _asyncContent<DojangSummary>(
          dojang,
          (summary) {
            final address = '$_publicWebHost/${summary.slug}';
            return Row(
              children: [
                Icon(Icons.public, size: 20, color: colorScheme.onSurfaceVariant),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            '내 홈페이지',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          if (!summary.published) ...[
                            const SizedBox(width: 6),
                            const _Pill('미완성'),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        summary.published ? address : '웹에서 편집하고 저장하면 공개돼요',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 12, color: colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: '주소 복사',
                  icon: const Icon(Icons.copy, size: 20),
                  onPressed: () async {
                    await Clipboard.setData(ClipboardData(text: 'https://$address'));
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('주소를 복사했어요.')),
                      );
                    }
                  },
                ),
                IconButton(
                  tooltip: '공개 페이지 보기',
                  icon: const Icon(Icons.open_in_new, size: 20),
                  onPressed: () => openWeb(context, '/${summary.slug}'),
                ),
              ],
            );
          },
          () => ref.invalidate(dojangProvider),
        ),
      ),
    );
  }
}

class _RecentTrials extends ConsumerWidget {
  const _RecentTrials();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trials = ref.watch(trialsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              '최근 체험 신청',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go('/trials'),
              child: const Text('전체 보기'),
            ),
          ],
        ),
        _asyncContent<List<TrialRequest>>(
          trials,
          (rows) {
            if (rows.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  '아직 들어온 신청이 없어요. 홈페이지 주소를 공유해 보세요.',
                  style: TextStyle(color: Theme.of(context).hintColor),
                ),
              );
            }
            final recent = [...rows]
              ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
            return Column(
              children: [
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
                    onTap: () => context.go('/trials'),
                  ),
              ],
            );
          },
          () => ref.invalidate(trialsProvider),
        ),
      ],
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
