import '../../core/api_client.dart';
import 'dojang_summary.dart';

class DashboardRepository {
  DashboardRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<MeInfo> fetchMe() async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>(
      '/dashboard/me',
    );
    return MeInfo.fromJson(response.data!);
  }

  Future<DojangSummary> fetchDojang() async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>(
      '/dashboard/dojang',
    );
    return DojangSummary.fromJson(response.data!);
  }

  Future<int> fetchTemplateCount() async {
    final response = await _apiClient.dio.get<List<dynamic>>(
      '/dashboard/templates',
    );
    return (response.data ?? const []).length;
  }

  Future<MeInfo> updateName(String name) async {
    final response = await _apiClient.dio.patch<Map<String, dynamic>>(
      '/dashboard/me',
      data: {'name': name},
    );
    return MeInfo.fromJson(response.data!);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return _apiClient.dio.post<Map<String, dynamic>>(
      '/dashboard/me/password',
      data: {'currentPassword': currentPassword, 'newPassword': newPassword},
    );
  }
}
