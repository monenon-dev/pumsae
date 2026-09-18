import '../../core/api_client.dart';
import 'trial_request.dart';

class TrialsRepository {
  TrialsRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<TrialRequest>> fetchTrialRequests() async {
    final response = await _apiClient.dio.get<List<dynamic>>(
      '/dashboard/trial-requests',
    );
    final rows = response.data ?? const [];
    return rows
        .cast<Map<String, dynamic>>()
        .map(TrialRequest.fromJson)
        .toList();
  }

  Future<TrialRequest> updateStatus(String id, String status) async {
    final response = await _apiClient.dio.patch<Map<String, dynamic>>(
      '/dashboard/trial-requests/$id',
      data: {'status': status},
    );
    return TrialRequest.fromJson(response.data!);
  }
}
