import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'album.dart';
import 'albums_provider.dart';

class AlbumsScreen extends ConsumerWidget {
  const AlbumsScreen({super.key});

  Future<void> _createAlbum(BuildContext context, WidgetRef ref) async {
    final created = await showDialog<String>(
      context: context,
      builder: (context) => const _NewAlbumDialog(),
    );
    if (created == null || !context.mounted) return;
    ref.invalidate(albumsProvider);
    await context.push('/albums/$created');
    ref.invalidate(albumsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final albums = ref.watch(albumsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('사진첩')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createAlbum(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('새 앨범'),
      ),
      body: albums.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('불러오지 못했어요'),
              TextButton(
                onPressed: () => ref.invalidate(albumsProvider),
                child: const Text('재시도'),
              ),
            ],
          ),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  '아직 만든 앨범이 없어요.\n오른쪽 아래 "새 앨범"으로 시작해 보세요.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(albumsProvider),
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 96),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.8,
              ),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final album = items[index];
                return _AlbumCard(
                  album: album,
                  onTap: () async {
                    await context.push('/albums/${album.id}');
                    ref.invalidate(albumsProvider);
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _AlbumCard extends StatelessWidget {
  const _AlbumCard({required this.album, required this.onTap});

  final AlbumSummary album;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final meta = [formatTakenOn(album.takenOn), '사진 ${album.photoCount}장']
        .whereType<String>()
        .join(' · ');
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  album.coverUrl != null
                      ? Image.network(album.coverUrl!, fit: BoxFit.cover)
                      : ColoredBox(
                          color: colorScheme.surfaceContainerHighest,
                          child: const Center(child: Icon(Icons.photo_library_outlined)),
                        ),
                  Positioned(
                    left: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: album.isPublic ? colorScheme.primary : Colors.white.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        album.isPublic ? '공개' : '비공개',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: album.isPublic ? colorScheme.onPrimary : Colors.black87,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            album.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(meta, style: TextStyle(fontSize: 12, color: Theme.of(context).hintColor)),
        ],
      ),
    );
  }
}

class _NewAlbumDialog extends ConsumerStatefulWidget {
  const _NewAlbumDialog();

  @override
  ConsumerState<_NewAlbumDialog> createState() => _NewAlbumDialogState();
}

class _NewAlbumDialogState extends ConsumerState<_NewAlbumDialog> {
  final _titleController = TextEditingController();
  DateTime? _takenOn;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _takenOn ?? now,
      firstDate: DateTime(2000),
      lastDate: DateTime(now.year + 1, 12, 31),
    );
    if (picked != null) setState(() => _takenOn = picked);
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _error = '앨범 이름을 입력해 주세요.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final album = await ref.read(albumsRepositoryProvider).createAlbum(
            title: title,
            takenOn: _takenOn == null ? null : _dateKey(_takenOn!),
          );
      if (mounted) Navigator.of(context).pop(album.id);
    } catch (_) {
      if (mounted) {
        setState(() {
          _busy = false;
          _error = '앨범을 만들지 못했어요.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('새 앨범'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _titleController,
            autofocus: true,
            maxLength: 80,
            decoration: const InputDecoration(
              labelText: '앨범 이름',
              hintText: '예: 10월 승급 심사',
            ),
          ),
          OutlinedButton.icon(
            onPressed: _pickDate,
            icon: const Icon(Icons.event, size: 18),
            label: Text(
              _takenOn == null ? '찍은 날 (선택)' : formatTakenOn(_dateKey(_takenOn!))!,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '새 앨범은 비공개로 시작해요. 사진을 확인한 뒤 공개할 수 있어요.',
            style: TextStyle(fontSize: 12, color: Theme.of(context).hintColor),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: _busy ? null : () => Navigator.of(context).pop(),
          child: const Text('취소'),
        ),
        FilledButton(
          onPressed: _busy ? null : _submit,
          child: Text(_busy ? '만드는 중...' : '만들기'),
        ),
      ],
    );
  }
}

String _dateKey(DateTime date) {
  String two(int n) => n.toString().padLeft(2, '0');
  return '${date.year}-${two(date.month)}-${two(date.day)}';
}
