import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api_client.dart';
import 'album.dart';

class AlbumsRepository {
  AlbumsRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<AlbumSummary>> fetchAlbums() async {
    final response = await _apiClient.dio.get<List<dynamic>>('/dashboard/albums');
    return (response.data ?? const [])
        .cast<Map<String, dynamic>>()
        .map(AlbumSummary.fromJson)
        .toList();
  }

  Future<AlbumDetail> fetchAlbum(String id) async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>(
      '/dashboard/albums/$id',
    );
    return AlbumDetail.fromJson(response.data!);
  }

  /// 새 앨범은 서버에서 비공개로 만들어진다.
  Future<AlbumDetail> createAlbum({
    required String title,
    String? takenOn,
    String? description,
  }) async {
    final response = await _apiClient.dio.post<Map<String, dynamic>>(
      '/dashboard/albums',
      data: {'title': title, 'takenOn': takenOn, 'description': description},
    );
    return AlbumDetail.fromJson(response.data!);
  }

  Future<AlbumDetail> updateAlbum(String id, Map<String, dynamic> changes) async {
    final response = await _apiClient.dio.patch<Map<String, dynamic>>(
      '/dashboard/albums/$id',
      data: changes,
    );
    return AlbumDetail.fromJson(response.data!);
  }

  Future<void> deleteAlbum(String id) {
    return _apiClient.dio.delete<void>('/dashboard/albums/$id');
  }

  Future<void> deletePhoto(String albumId, String photoId) {
    return _apiClient.dio.delete<void>('/dashboard/albums/$albumId/photos/$photoId');
  }

  /// 사진 한 장을 올린다. 서버가 회전을 바로잡고 큰 사진·작은 사진을 만든다.
  Future<AlbumPhoto> uploadPhoto(String albumId, XFile file) async {
    final bytes = await file.readAsBytes();

    Future<Response<Map<String, dynamic>>> send() {
      // FormData는 한 번 보내면 다시 쓸 수 없어서 매번 새로 만든다.
      final form = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: file.name,
          contentType: DioMediaType.parse(_contentType(file.name)),
        ),
      });
      return _apiClient.dio.post<Map<String, dynamic>>(
        '/dashboard/albums/$albumId/photos',
        data: form,
      );
    }

    Response<Map<String, dynamic>> response;
    try {
      response = await send();
    } on DioException catch (error) {
      // 토큰이 만료돼 인터셉터가 새로 받아 재시도하면, 이미 보낸 FormData를
      // 다시 쓸 수 없어 실패한다. 새 토큰으로 한 번만 다시 보낸다.
      final retryable = error.response?.statusCode == 401 || error.error is StateError;
      if (!retryable) rethrow;
      response = await send();
    }
    return AlbumPhoto.fromJson(response.data!);
  }

  static String _contentType(String name) {
    final lower = name.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }
}
