import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/auth_provider.dart';
import 'calendar_event.dart';

class CalendarRepository {
  CalendarRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<CalendarEvent>> fetchEvents(String from, String to) async {
    final response = await _apiClient.dio.get<List<dynamic>>(
      '/dashboard/events',
      queryParameters: {'from': from, 'to': to},
    );
    return (response.data ?? const [])
        .cast<Map<String, dynamic>>()
        .map(CalendarEvent.fromJson)
        .toList();
  }

  Future<CalendarEvent> createEvent(CalendarEventInput input) async {
    final response = await _apiClient.dio.post<Map<String, dynamic>>(
      '/dashboard/events',
      data: input.toJson(),
    );
    return CalendarEvent.fromJson(response.data!);
  }

  Future<CalendarEvent> updateEvent(String id, CalendarEventInput input) async {
    final response = await _apiClient.dio.put<Map<String, dynamic>>(
      '/dashboard/events/$id',
      data: input.toJson(),
    );
    return CalendarEvent.fromJson(response.data!);
  }

  Future<void> deleteEvent(String id) {
    return _apiClient.dio.delete<void>('/dashboard/events/$id');
  }
}

final calendarRepositoryProvider = Provider.autoDispose<CalendarRepository>((ref) {
  return CalendarRepository(ref.watch(apiClientProvider));
});

/// 홈 화면용: 오늘부터 2주간 일정.
final upcomingEventsProvider = FutureProvider.autoDispose<List<CalendarEvent>>((ref) {
  final today = DateTime.now();
  return ref.watch(calendarRepositoryProvider).fetchEvents(
        dateKey(today),
        dateKey(today.add(const Duration(days: 14))),
      );
});
