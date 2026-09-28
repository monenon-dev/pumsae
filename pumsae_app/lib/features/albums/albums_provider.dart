import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_provider.dart';
import 'album.dart';
import 'albums_repository.dart';

final albumsRepositoryProvider = Provider.autoDispose<AlbumsRepository>((ref) {
  return AlbumsRepository(ref.watch(apiClientProvider));
});

final albumsProvider = FutureProvider.autoDispose<List<AlbumSummary>>((ref) {
  return ref.watch(albumsRepositoryProvider).fetchAlbums();
});
