import 'dart:typed_data';

import 'package:dio/dio.dart';

import '../../core/api_client.dart';
import 'promo_template.dart';

class TemplatesRepository {
  TemplatesRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<PromoTemplate>> fetchTemplates() async {
    final response = await _apiClient.dio.get<List<dynamic>>(
      '/dashboard/templates',
    );
    final rows = response.data ?? const [];
    return rows
        .cast<Map<String, dynamic>>()
        .map(PromoTemplate.fromJson)
        .toList();
  }

  Future<Uint8List> exportTemplatePng(String id) async {
    final response = await _apiClient.dio.get<List<int>>(
      '/dashboard/templates/$id/export',
      options: Options(responseType: ResponseType.bytes),
    );
    return Uint8List.fromList(response.data!);
  }
}
