import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gal/gal.dart';

import 'promo_template.dart';
import 'templates_provider.dart';

String _formatShortDate(DateTime value) {
  final local = value.toLocal();
  return '${local.month}월 ${local.day}일';
}

String _galErrorMessage(Object error) {
  if (error is GalException) {
    switch (error.type) {
      case GalExceptionType.accessDenied:
        return '갤러리 접근 권한이 없습니다.';
      case GalExceptionType.notEnoughSpace:
        return '저장 공간이 부족합니다.';
      case GalExceptionType.notSupportedFormat:
        return '지원하지 않는 파일 형식입니다.';
      case GalExceptionType.unexpected:
        return '저장하지 못했습니다.';
    }
  }
  return '저장하지 못했습니다.';
}

class TemplatesScreen extends ConsumerWidget {
  const TemplatesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final templates = ref.watch(templatesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('카드뉴스')),
      body: templates.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('불러오지 못했어요'),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(templatesProvider),
                child: const Text('재시도'),
              ),
            ],
          ),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('아직 만든 카드뉴스가 없습니다.'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.72,
            ),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final template = items[index];
              return _TemplateCard(
                template: template,
                onTap: () => showModalBottomSheet<void>(
                  context: context,
                  builder: (context) => _DownloadSheet(template: template),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _TemplateCard extends StatelessWidget {
  const _TemplateCard({required this.template, required this.onTap});

  final PromoTemplate template;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: double.infinity,
                child: template.thumbnailUrl != null
                    ? Image.network(
                        template.thumbnailUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            _Placeholder(label: template.typeLabel),
                      )
                    : _Placeholder(label: template.typeLabel),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            template.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(
            '${template.typeLabel} · ${_formatShortDate(template.createdAt)}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade300,
      alignment: Alignment.center,
      child: Text(
        label,
        style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _DownloadSheet extends ConsumerStatefulWidget {
  const _DownloadSheet({required this.template});

  final PromoTemplate template;

  @override
  ConsumerState<_DownloadSheet> createState() => _DownloadSheetState();
}

class _DownloadSheetState extends ConsumerState<_DownloadSheet> {
  bool _downloading = false;

  Future<void> _download() async {
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _downloading = true);

    try {
      final bytes = await ref
          .read(templatesRepositoryProvider)
          .exportTemplatePng(widget.template.id);
      await Gal.putImageBytes(bytes, name: widget.template.title);
      if (!mounted) {
        return;
      }
      Navigator.of(context).pop();
      messenger.showSnackBar(const SnackBar(content: Text('저장했습니다')));
    } catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(_galErrorMessage(error))));
      if (mounted) {
        setState(() => _downloading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.template.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _downloading ? null : _download,
              child: _downloading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('다운로드'),
            ),
          ],
        ),
      ),
    );
  }
}
