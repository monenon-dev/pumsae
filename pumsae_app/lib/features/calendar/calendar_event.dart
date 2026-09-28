import 'package:flutter/material.dart';

/// 웹과 같은 네 가지 일정 종류와 색.
enum EventCategory {
  classSession('CLASS', '수업', Color(0xFF0EA5E9), Color(0xFFE0F2FE)),
  event('EVENT', '행사', Color(0xFFF43F5E), Color(0xFFFFE4E6)),
  closed('CLOSED', '휴관', Color(0xFFA1A1AA), Color(0xFFF4F4F5)),
  notice('NOTICE', '공지', Color(0xFF10B981), Color(0xFFD1FAE5));

  const EventCategory(this.code, this.label, this.color, this.softColor);

  final String code;
  final String label;
  final Color color;
  final Color softColor;

  static EventCategory fromCode(String code) {
    return EventCategory.values.firstWhere(
      (value) => value.code == code,
      orElse: () => EventCategory.classSession,
    );
  }
}

class CalendarEvent {
  const CalendarEvent({
    required this.id,
    required this.date,
    required this.title,
    required this.startTime,
    required this.endTime,
    required this.memo,
    required this.category,
    required this.isPublic,
  });

  final String id;

  /// "YYYY-MM-DD"
  final String date;
  final String title;

  /// "HH:MM", null이면 하루 종일.
  final String? startTime;
  final String? endTime;
  final String? memo;
  final EventCategory category;
  final bool isPublic;

  String get timeLabel {
    if (startTime == null) return '하루 종일';
    return endTime == null ? startTime! : '$startTime – $endTime';
  }

  factory CalendarEvent.fromJson(Map<String, dynamic> json) {
    return CalendarEvent(
      id: json['id'] as String,
      date: json['date'] as String,
      title: json['title'] as String,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      memo: json['memo'] as String?,
      category: EventCategory.fromCode(json['category'] as String),
      isPublic: json['isPublic'] as bool? ?? true,
    );
  }
}

class CalendarEventInput {
  const CalendarEventInput({
    required this.date,
    required this.title,
    required this.startTime,
    required this.endTime,
    required this.memo,
    required this.category,
    required this.isPublic,
  });

  final String date;
  final String title;
  final String? startTime;
  final String? endTime;
  final String? memo;
  final EventCategory category;
  final bool isPublic;

  Map<String, dynamic> toJson() => {
        'date': date,
        'title': title,
        'startTime': startTime,
        'endTime': endTime,
        'memo': memo,
        'category': category.code,
        'isPublic': isPublic,
      };
}

String _two(int n) => n.toString().padLeft(2, '0');

String dateKey(DateTime date) => '${date.year}-${_two(date.month)}-${_two(date.day)}';

DateTime parseDateKey(String key) {
  final parts = key.split('-').map(int.parse).toList();
  return DateTime(parts[0], parts[1], parts[2]);
}

String timeKey(TimeOfDay time) => '${_two(time.hour)}:${_two(time.minute)}';

TimeOfDay? parseTimeKey(String? key) {
  if (key == null) return null;
  final parts = key.split(':').map(int.parse).toList();
  return TimeOfDay(hour: parts[0], minute: parts[1]);
}

const weekdayLabels = ['월', '화', '수', '목', '금', '토', '일'];

String formatDayTitle(String key) {
  final date = parseDateKey(key);
  return '${date.month}월 ${date.day}일 (${weekdayLabels[date.weekday - 1]})';
}

/// 월요일로 시작하는 달력 칸(앞뒤 달 날짜 포함, 그 달이 걸친 주만큼).
List<DateTime> monthGrid(DateTime month) {
  final first = DateTime(month.year, month.month, 1);
  final offset = first.weekday - 1;
  final lastDay = DateTime(month.year, month.month + 1, 0).day;
  final weeks = ((offset + lastDay) / 7).ceil();
  return List.generate(
    weeks * 7,
    (index) => DateTime(month.year, month.month, 1 - offset + index),
  );
}
