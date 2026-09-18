import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'trial_request.dart';
import 'trials_provider.dart';

const _statusLabels = {
  'PENDING': '대기',
  'CONFIRMED': '승인됨',
  'DECLINED': '거절됨',
};

const _classLabels = {
  'KIDS': '유아부',
  'ELEMENTARY': '초등부',
  'MIDDLE_HIGH': '중고등부',
  'ADULT': '성인부',
};

String _formatDateTime(DateTime value) {
  final local = value.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}

class TrialsScreen extends ConsumerStatefulWidget {
  const TrialsScreen({super.key});

  @override
  ConsumerState<TrialsScreen> createState() => _TrialsScreenState();
}

class _TrialsScreenState extends ConsumerState<TrialsScreen> {
  final Set<String> _updatingIds = {};

  Future<void> _updateStatus(TrialRequest trial, String status) async {
    setState(() => _updatingIds.add(trial.id));
    try {
      final updated =
          await ref.read(trialsRepositoryProvider).updateStatus(trial.id, status);
      ref.read(trialsProvider.notifier).applyUpdated(updated);
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('상태를 변경하지 못했습니다.')),
      );
    } finally {
      if (mounted) {
        setState(() => _updatingIds.remove(trial.id));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final trialsState = ref.watch(trialsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('체험 신청')),
      body: trialsState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('목록을 불러오지 못했습니다.\n$error', textAlign: TextAlign.center),
          ),
        ),
        data: (trials) {
          if (trials.isEmpty) {
            return const Center(child: Text('아직 체험 신청이 없습니다.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: trials.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final trial = trials[index];
              return _TrialCard(
                trial: trial,
                busy: _updatingIds.contains(trial.id),
                onConfirm: () => _updateStatus(trial, 'CONFIRMED'),
                onDecline: () => _updateStatus(trial, 'DECLINED'),
              );
            },
          );
        },
      ),
    );
  }
}

class _TrialCard extends StatelessWidget {
  const _TrialCard({
    required this.trial,
    required this.busy,
    required this.onConfirm,
    required this.onDecline,
  });

  final TrialRequest trial;
  final bool busy;
  final VoidCallback onConfirm;
  final VoidCallback onDecline;

  @override
  Widget build(BuildContext context) {
    final classLabel =
        trial.desiredClass != null ? _classLabels[trial.desiredClass] ?? trial.desiredClass : null;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    trial.studentName,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                if (trial.status != 'PENDING') _StatusBadge(status: trial.status),
              ],
            ),
            const SizedBox(height: 4),
            Text('학부모: ${trial.parentName} · ${trial.parentPhone}'),
            if (classLabel != null) ...[
              const SizedBox(height: 2),
              Text('희망반: $classLabel'),
            ],
            if (trial.memo != null && trial.memo!.trim().isNotEmpty) ...[
              const SizedBox(height: 2),
              Text('메모: ${trial.memo}'),
            ],
            const SizedBox(height: 6),
            Text(
              _formatDateTime(trial.createdAt),
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
            if (trial.status == 'PENDING') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: busy ? null : onDecline,
                      child: const Text('거절'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      onPressed: busy ? null : onConfirm,
                      child: busy
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('승인'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final confirmed = status == 'CONFIRMED';
    final color = confirmed ? Colors.green : Colors.red;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        _statusLabels[status] ?? status,
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12),
      ),
    );
  }
}
