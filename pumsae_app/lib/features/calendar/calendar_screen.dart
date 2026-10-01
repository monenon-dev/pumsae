import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../intro/pumsae_loader.dart';
import 'calendar_event.dart';
import 'calendar_repository.dart';

enum _Filter { all, public, private }

/// 웹 대시보드 캘린더와 같은 월간 달력 + 아래 다이어리(그날 일정·메모).
class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  late DateTime _month;
  late String _selected;
  List<CalendarEvent> _events = const [];
  bool _loading = true;
  // 한 번이라도 불러왔는지. 처음 불러올 때만 화면 전체 로더를 띄우고, 달을 옮기거나
  // 새로고침할 때는 기존 달력을 흐리게 둔 채 다시 불러온다.
  bool _loadedOnce = false;
  bool _loadFailed = false;
  _Filter _filter = _Filter.all;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
    _selected = dateKey(now);
    _load();
  }

  Future<void> _load() async {
    final days = monthGrid(_month);
    setState(() => _loading = true);
    try {
      final events = await ref
          .read(calendarRepositoryProvider)
          .fetchEvents(dateKey(days.first), dateKey(days.last));
      if (!mounted) return;
      setState(() {
        _events = events;
        _loading = false;
        _loadedOnce = true;
        _loadFailed = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _loadFailed = true;
        });
      }
    }
  }

  void _changeMonth(DateTime month) {
    final now = DateTime.now();
    setState(() {
      _month = DateTime(month.year, month.month);
      _selected = month.year == now.year && month.month == now.month
          ? dateKey(now)
          : dateKey(_month);
    });
    _load();
  }

  List<CalendarEvent> get _visible => _events.where((event) {
        switch (_filter) {
          case _Filter.all:
            return true;
          case _Filter.public:
            return event.isPublic;
          case _Filter.private:
            return !event.isPublic;
        }
      }).toList();

  Future<void> _openForm({CalendarEvent? event}) async {
    final saved = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => _EventForm(dateKey: event?.date ?? _selected, event: event),
    );
    if (saved == null || !mounted) return;
    setState(() => _selected = saved);
    final savedDate = parseDateKey(saved);
    if (savedDate.year != _month.year || savedDate.month != _month.month) {
      _changeMonth(savedDate);
      setState(() => _selected = saved);
    } else {
      await _load();
    }
    ref.invalidate(upcomingEventsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visible;
    final byDate = <String, List<CalendarEvent>>{};
    for (final event in visible) {
      byDate.putIfAbsent(event.date, () => []).add(event);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('캘린더')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add),
        label: const Text('일정 추가'),
      ),
      body: Stack(
        children: [
          _buildBody(byDate),
          if (_loading && !_loadedOnce) const Positioned.fill(child: PumsaeLoader.overlay()),
        ],
      ),
    );
  }

  Widget _buildBody(Map<String, List<CalendarEvent>> byDate) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 96),
        children: [
          _MonthHeader(month: _month, onChange: _changeMonth),
          const SizedBox(height: 8),
          SegmentedButton<_Filter>(
            segments: const [
              ButtonSegment(value: _Filter.all, label: Text('전체')),
              ButtonSegment(value: _Filter.public, label: Text('학부모 공개')),
              ButtonSegment(value: _Filter.private, label: Text('관장님만')),
            ],
            selected: {_filter},
            showSelectedIcon: false,
            onSelectionChanged: (value) => setState(() => _filter = value.first),
          ),
          const SizedBox(height: 10),
          if (_loadFailed)
            TextButton(onPressed: _load, child: const Text('일정을 불러오지 못했어요 · 재시도')),
          AnimatedOpacity(
            opacity: _loading ? 0.5 : 1,
            duration: const Duration(milliseconds: 150),
            child: _MonthGrid(
              month: _month,
              byDate: byDate,
              selected: _selected,
              onSelect: (key) => setState(() => _selected = key),
            ),
          ),
          const SizedBox(height: 16),
          _DayAgenda(
            dateKey: _selected,
            events: byDate[_selected] ?? const [],
            onEdit: (event) => _openForm(event: event),
          ),
        ],
      ),
    );
  }
}

class _MonthHeader extends StatelessWidget {
  const _MonthHeader({required this.month, required this.onChange});

  final DateTime month;
  final ValueChanged<DateTime> onChange;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            '${month.year}년 ${month.month}월',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        IconButton(
          onPressed: () => onChange(DateTime(month.year, month.month - 1)),
          icon: const Icon(Icons.chevron_left),
          tooltip: '이전 달',
        ),
        TextButton(
          onPressed: () => onChange(DateTime.now()),
          child: const Text('오늘'),
        ),
        IconButton(
          onPressed: () => onChange(DateTime(month.year, month.month + 1)),
          icon: const Icon(Icons.chevron_right),
          tooltip: '다음 달',
        ),
      ],
    );
  }
}

class _MonthGrid extends StatelessWidget {
  const _MonthGrid({
    required this.month,
    required this.byDate,
    required this.selected,
    required this.onSelect,
  });

  final DateTime month;
  final Map<String, List<CalendarEvent>> byDate;
  final String selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final days = monthGrid(month);
    final todayKey = dateKey(DateTime.now());
    final border = BorderSide(color: Colors.grey.shade300);

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Container(
            color: Colors.grey.shade50,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                for (var i = 0; i < 7; i++)
                  Expanded(
                    child: Text(
                      weekdayLabels[i],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: i == 5
                            ? Colors.blue.shade600
                            : i == 6
                                ? Colors.red.shade600
                                : Colors.grey.shade600,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          for (var week = 0; week < days.length ~/ 7; week++)
            Row(
              children: [
                for (var i = 0; i < 7; i++)
                  Expanded(
                    child: Builder(builder: (context) {
                      final day = days[week * 7 + i];
                      final key = dateKey(day);
                      final inMonth = day.month == month.month;
                      final events = byDate[key] ?? const <CalendarEvent>[];
                      final isToday = key == todayKey;
                      final isSelected = key == selected;
                      return InkWell(
                        onTap: () => onSelect(key),
                        child: Container(
                          height: 62,
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? colorScheme.primaryContainer.withValues(alpha: 0.5)
                                : inMonth
                                    ? Colors.white
                                    : Colors.grey.shade50,
                            border: Border(
                              top: border,
                              right: i < 6 ? border : BorderSide.none,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: isToday
                                    ? BoxDecoration(
                                        color: Colors.black87,
                                        borderRadius: BorderRadius.circular(999),
                                      )
                                    : null,
                                child: Text(
                                  '${day.day}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isToday
                                        ? Colors.white
                                        : inMonth
                                            ? Colors.black87
                                            : Colors.grey.shade400,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              Wrap(
                                spacing: 2,
                                runSpacing: 2,
                                children: [
                                  for (final event in events.take(4))
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: event.category.color,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _DayAgenda extends StatelessWidget {
  const _DayAgenda({required this.dateKey, required this.events, required this.onEdit});

  final String dateKey;
  final List<CalendarEvent> events;
  final ValueChanged<CalendarEvent> onEdit;

  @override
  Widget build(BuildContext context) {
    final hint = Theme.of(context).hintColor;
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              formatDayTitle(dateKey),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            if (events.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Text('이 날은 일정이 없어요.', style: TextStyle(color: hint)),
              )
            else
              for (final event in events)
                InkWell(
                  onTap: () => onEdit(event),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(top: 5),
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: event.category.color,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                children: [
                                  Text(
                                    event.title,
                                    style: const TextStyle(fontWeight: FontWeight.w700),
                                  ),
                                  _Tag(
                                    label: event.category.label,
                                    color: event.category.softColor,
                                  ),
                                  if (!event.isPublic)
                                    _Tag(label: '관장님만', color: Colors.grey.shade200),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(event.timeLabel, style: TextStyle(fontSize: 12, color: hint)),
                              if (event.memo != null) ...[
                                const SizedBox(height: 6),
                                Text(event.memo!),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

/// 일정 추가·수정 시트. 저장하면 그 일정의 날짜(YYYY-MM-DD)를 돌려준다.
class _EventForm extends ConsumerStatefulWidget {
  const _EventForm({required this.dateKey, required this.event});

  final String dateKey;
  final CalendarEvent? event;

  @override
  ConsumerState<_EventForm> createState() => _EventFormState();
}

class _EventFormState extends ConsumerState<_EventForm> {
  late final TextEditingController _title =
      TextEditingController(text: widget.event?.title ?? '');
  late final TextEditingController _memo =
      TextEditingController(text: widget.event?.memo ?? '');
  late DateTime _date = parseDateKey(widget.event?.date ?? widget.dateKey);
  late EventCategory _category = widget.event?.category ?? EventCategory.classSession;
  late bool _allDay = widget.event != null && widget.event!.startTime == null;
  late TimeOfDay _start =
      parseTimeKey(widget.event?.startTime) ?? const TimeOfDay(hour: 16, minute: 0);
  late TimeOfDay _end =
      parseTimeKey(widget.event?.endTime) ?? const TimeOfDay(hour: 17, minute: 0);
  late bool _isPublic = widget.event?.isPublic ?? true;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _memo.dispose();
    super.dispose();
  }

  String _messageOf(Object error, String fallback) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['detail'] is String) return data['detail'] as String;
    }
    return fallback;
  }

  Future<void> _save() async {
    final title = _title.text.trim();
    if (title.isEmpty) {
      setState(() => _error = '일정 제목을 입력해 주세요.');
      return;
    }
    if (!_allDay && timeKey(_end).compareTo(timeKey(_start)) < 0) {
      setState(() => _error = '끝나는 시간이 시작 시간보다 빨라요.');
      return;
    }
    final input = CalendarEventInput(
      date: dateKey(_date),
      title: title,
      startTime: _allDay ? null : timeKey(_start),
      endTime: _allDay ? null : timeKey(_end),
      memo: _memo.text.trim().isEmpty ? null : _memo.text.trim(),
      category: _category,
      isPublic: _isPublic,
    );
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final repo = ref.read(calendarRepositoryProvider);
      if (widget.event == null) {
        await repo.createEvent(input);
      } else {
        await repo.updateEvent(widget.event!.id, input);
      }
      if (mounted) Navigator.of(context).pop(input.date);
    } catch (error) {
      if (mounted) {
        setState(() {
          _busy = false;
          _error = _messageOf(error, '저장하지 못했어요.');
        });
      }
    }
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: const Text('이 일정을 삭제할까요?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('취소')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('삭제')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(calendarRepositoryProvider).deleteEvent(widget.event!.id);
      if (mounted) Navigator.of(context).pop(widget.event!.date);
    } catch (error) {
      if (mounted) {
        setState(() {
          _busy = false;
          _error = _messageOf(error, '삭제하지 못했어요.');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.event == null ? '일정 추가' : '일정 수정',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _title,
              autofocus: widget.event == null,
              maxLength: 80,
              decoration: const InputDecoration(
                labelText: '제목',
                hintText: '예: 유치부 수업, 승급 심사',
              ),
            ),
            Wrap(
              spacing: 8,
              children: [
                for (final category in EventCategory.values)
                  ChoiceChip(
                    label: Text(category.label),
                    selected: _category == category,
                    selectedColor: category.softColor,
                    avatar: CircleAvatar(backgroundColor: category.color, radius: 5),
                    onSelected: (_) => setState(() => _category = category),
                  ),
              ],
            ),
            if (_category == EventCategory.notice)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  '학부모에게 공개하면 홈페이지 캘린더 위 "이번 달 안내"에 메모까지 바로 보여요. '
                  '날짜가 딱히 없는 안내는 적용 시작일에 넣어 주세요.',
                  style: TextStyle(fontSize: 12, color: EventCategory.notice.color),
                ),
              ),
            const SizedBox(height: 8),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.event),
              title: Text(formatDayTitle(dateKey(_date))),
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(DateTime.now().year + 3, 12, 31),
                );
                if (picked != null) setState(() => _date = picked);
              },
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _allDay,
              onChanged: (value) => setState(() => _allDay = value),
              title: const Text('하루 종일'),
            ),
            if (!_allDay)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _start);
                        if (picked != null) setState(() => _start = picked);
                      },
                      child: Text('시작 ${timeKey(_start)}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _end);
                        if (picked != null) setState(() => _end = picked);
                      },
                      child: Text('끝 ${timeKey(_end)}'),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 12),
            TextField(
              controller: _memo,
              maxLines: 4,
              maxLength: 1000,
              decoration: const InputDecoration(
                labelText: '메모',
                hintText: '수업 내용, 준비물, 안내 사항',
                border: OutlineInputBorder(),
              ),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _isPublic,
              onChanged: (value) => setState(() => _isPublic = value),
              title: const Text('학부모에게 공개'),
              subtitle: const Text('끄면 관장님·사범님만 볼 수 있어요.'),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                if (widget.event != null)
                  TextButton(
                    onPressed: _busy ? null : _delete,
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text('삭제'),
                  ),
                const Spacer(),
                TextButton(
                  onPressed: _busy ? null : () => Navigator.of(context).pop(),
                  child: const Text('취소'),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _busy ? null : _save,
                  child: Text(_busy ? '저장 중...' : '저장'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
