import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import 'album.dart';
import 'albums_provider.dart';

/// 앨범 한 개: 공개 설정, 사진 올리기(갤러리 여러 장 / 카메라), 사진 보기·지우기.
class AlbumDetailScreen extends ConsumerStatefulWidget {
  const AlbumDetailScreen({super.key, required this.albumId});

  final String albumId;

  @override
  ConsumerState<AlbumDetailScreen> createState() => _AlbumDetailScreenState();
}

class _AlbumDetailScreenState extends ConsumerState<AlbumDetailScreen> {
  final _picker = ImagePicker();
  AlbumDetail? _album;
  Object? _loadError;
  bool _savingPublic = false;
  int _uploadDone = 0;
  int _uploadTotal = 0;
  int _uploadFailed = 0;

  bool get _uploading => _uploadTotal > 0 && _uploadDone < _uploadTotal;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final album = await ref.read(albumsRepositoryProvider).fetchAlbum(widget.albumId);
      if (mounted) setState(() => _album = album);
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  String _errorMessage(Object error, String fallback) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['detail'] is String) return data['detail'] as String;
    }
    return fallback;
  }

  Future<void> _togglePublic(bool value) async {
    final album = _album!;
    setState(() => _savingPublic = true);
    try {
      final updated = await ref.read(albumsRepositoryProvider).updateAlbum(album.id, {'isPublic': value});
      if (mounted) setState(() => _album = updated);
    } catch (error) {
      if (mounted) _toast(_errorMessage(error, '공개 설정을 바꾸지 못했어요.'));
    } finally {
      if (mounted) setState(() => _savingPublic = false);
    }
  }

  Future<void> _addPhotos(ImageSource source) async {
    // 휴대폰 원본은 매우 크므로 기기에서 한 번 줄여서 보낸다(서버도 2048px로 줄인다).
    const maxSide = 2560.0;
    final List<XFile> files;
    if (source == ImageSource.gallery) {
      files = await _picker.pickMultiImage(maxWidth: maxSide, maxHeight: maxSide, imageQuality: 88);
    } else {
      final shot = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: maxSide,
        maxHeight: maxSide,
        imageQuality: 88,
      );
      files = shot == null ? const [] : [shot];
    }
    if (files.isEmpty || !mounted) return;

    setState(() {
      _uploadDone = 0;
      _uploadTotal = files.length;
      _uploadFailed = 0;
    });
    final repo = ref.read(albumsRepositoryProvider);
    for (final file in files) {
      try {
        final photo = await repo.uploadPhoto(widget.albumId, file);
        if (!mounted) return;
        setState(() {
          final album = _album!;
          final photos = [...album.photos, photo];
          _album = AlbumDetail(
            id: album.id,
            title: album.title,
            description: album.description,
            takenOn: album.takenOn,
            isPublic: album.isPublic,
            photoCount: photos.length,
            coverUrl: album.coverUrl ?? photo.thumbUrl,
            photos: photos,
          );
        });
      } catch (_) {
        _uploadFailed += 1;
      }
      if (mounted) setState(() => _uploadDone += 1);
    }
    if (!mounted) return;
    _toast(_uploadFailed == 0
        ? '사진 ${files.length}장을 올렸어요.'
        : '${files.length - _uploadFailed}장 올리고, $_uploadFailed장은 실패했어요.');
    setState(() => _uploadTotal = 0);
  }

  Future<void> _deletePhoto(AlbumPhoto photo) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: const Text('이 사진을 앨범에서 지울까요?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('취소')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('지우기')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await ref.read(albumsRepositoryProvider).deletePhoto(widget.albumId, photo.id);
      if (!mounted) return;
      await _load();
      if (mounted) Navigator.of(context).pop();
    } catch (error) {
      if (mounted) _toast(_errorMessage(error, '사진을 지우지 못했어요.'));
    }
  }

  Future<void> _deleteAlbum() async {
    final album = _album!;
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('앨범 삭제'),
        content: Text('"${album.title}" 앨범과 사진 ${album.photoCount}장을 모두 지울까요?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('취소')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('삭제')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await ref.read(albumsRepositoryProvider).deleteAlbum(album.id);
      ref.invalidate(albumsProvider);
      if (mounted) Navigator.of(context).pop();
    } catch (error) {
      if (mounted) _toast(_errorMessage(error, '앨범을 지우지 못했어요.'));
    }
  }

  void _openViewer(int index) {
    final album = _album!;
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (context) => _PhotoViewer(
          photos: album.photos,
          initialIndex: index,
          title: album.title,
          onDelete: _deletePhoto,
        ),
      ),
    );
  }

  void _showAddSheet() {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('앨범에서 여러 장 고르기'),
              onTap: () {
                Navigator.pop(context);
                _addPhotos(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('카메라로 찍기'),
              onTap: () {
                Navigator.pop(context);
                _addPhotos(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final album = _album;

    if (album == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: _loadError == null
              ? const CircularProgressIndicator()
              : TextButton(
                  onPressed: () {
                    setState(() => _loadError = null);
                    _load();
                  },
                  child: const Text('불러오지 못했어요 · 재시도'),
                ),
        ),
      );
    }

    final meta = [formatTakenOn(album.takenOn), '사진 ${album.photoCount}장']
        .whereType<String>()
        .join(' · ');

    return Scaffold(
      appBar: AppBar(
        title: Text(album.title, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            onPressed: _deleteAlbum,
            icon: const Icon(Icons.delete_outline),
            tooltip: '앨범 삭제',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _uploading ? null : _showAddSheet,
        icon: const Icon(Icons.add_photo_alternate_outlined),
        label: Text(_uploading ? '올리는 중 $_uploadDone/$_uploadTotal' : '사진 올리기'),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(meta, style: TextStyle(color: Theme.of(context).hintColor)),
                  if (album.description != null) ...[
                    const SizedBox(height: 6),
                    Text(album.description!),
                  ],
                  const SizedBox(height: 8),
                  Card(
                    margin: EdgeInsets.zero,
                    child: SwitchListTile(
                      value: album.isPublic,
                      onChanged: _savingPublic ? null : _togglePublic,
                      title: const Text('학부모에게 공개'),
                      subtitle: Text(
                        album.isPublic
                            ? '홈페이지 사진첩에 보이고 있어요.'
                            : '아이들 얼굴이 나온 사진은 보호자 동의를 확인한 뒤 공개해 주세요.',
                      ),
                    ),
                  ),
                  if (_uploading) ...[
                    const SizedBox(height: 12),
                    LinearProgressIndicator(value: _uploadDone / _uploadTotal),
                  ],
                ],
              ),
            ),
          ),
          if (album.photos.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Text('아직 사진이 없어요.\n"사진 올리기"로 여러 장을 한 번에 올릴 수 있어요.',
                    textAlign: TextAlign.center),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(4, 4, 4, 96),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 4,
                  crossAxisSpacing: 4,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final photo = album.photos[index];
                    return GestureDetector(
                      onTap: () => _openViewer(index),
                      child: Image.network(photo.thumbUrl, fit: BoxFit.cover),
                    );
                  },
                  childCount: album.photos.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _PhotoViewer extends StatefulWidget {
  const _PhotoViewer({
    required this.photos,
    required this.initialIndex,
    required this.title,
    required this.onDelete,
  });

  final List<AlbumPhoto> photos;
  final int initialIndex;
  final String title;
  final Future<void> Function(AlbumPhoto photo) onDelete;

  @override
  State<_PhotoViewer> createState() => _PhotoViewerState();
}

class _PhotoViewerState extends State<_PhotoViewer> {
  late final PageController _controller = PageController(initialPage: widget.initialIndex);
  late int _index = widget.initialIndex;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('${_index + 1} / ${widget.photos.length}'),
        actions: [
          IconButton(
            onPressed: () => widget.onDelete(widget.photos[_index]),
            icon: const Icon(Icons.delete_outline),
            tooltip: '이 사진 지우기',
          ),
        ],
      ),
      body: PageView.builder(
        controller: _controller,
        itemCount: widget.photos.length,
        onPageChanged: (index) => setState(() => _index = index),
        itemBuilder: (context, index) => InteractiveViewer(
          child: Center(
            child: Image.network(widget.photos[index].url, fit: BoxFit.contain),
          ),
        ),
      ),
    );
  }
}
