import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';
import 'intro_mark.dart';

/// [PumsaeLoader.overlay]가 마크를 띄우기 전에 기다리는 시간.
/// 릴리스에서는 300ms라 금방 끝나는 로딩에선 로더가 깜빡이지 않고, 디버그 빌드에서는
/// 0이라 느린 네트워크를 흉내 내지 않아도 모든 로딩 화면을 바로 확인할 수 있다.
const Duration kLoaderDelay = kDebugMode ? Duration.zero : Duration(milliseconds: 300);

/// 로더 크기 체계. [PumsaeLoader]의 `size`에는 이 셋 중 하나를 넘긴다.
/// 화면 전체 로딩([PumsaeLoader.overlay]의 기본값).
const double kLoaderFull = 96;

/// 카드·섹션 안 로딩([PumsaeLoader]의 기본값).
const double kLoaderSection = 64;

/// 버튼·업로드 안의 작은 로딩.
const double kLoaderInline = 24;

/// [AppColors.brandRed] 12% 원 위에서 도복 마크([IntroMark])가 1초 주기로 통통 튀며
/// 살짝 기울고, 그 아래에 "PUMSAE" 글자([IntroWordmark])가 붙는 로딩 표시.
///
/// - `PumsaeLoader()`: 카드·본문 안에 바로 놓는 로더.
/// - `PumsaeLoader.overlay()`: 화면 전체를 덮는 로딩. 시작 후 [kLoaderDelay]가 지나야
///   마크가 나타나서, 금방 끝나는 로딩에서는 로더가 깜빡이지 않는다.
class PumsaeLoader extends StatefulWidget {
  const PumsaeLoader({super.key, this.size = kLoaderSection, this.onDark = false})
      : _overlay = false,
        delay = Duration.zero;

  const PumsaeLoader.overlay({
    super.key,
    this.size = kLoaderFull,
    this.onDark = false,
    this.delay = kLoaderDelay,
  }) : _overlay = true;

  /// 원형 배경의 지름. 마크와 글자 크기도 이 값에 맞춰 정해진다.
  final double size;

  /// 어두운 배경(대시보드 인사 카드) 위에 놓일 때 true. "PUMSAE" 글자가 흰색이 된다.
  final bool onDark;

  /// overlay에서 마크가 나타나기까지 기다리는 시간. 보통은 [kLoaderDelay] 그대로 쓴다.
  final Duration delay;
  final bool _overlay;

  @override
  State<PumsaeLoader> createState() => _PumsaeLoaderState();
}

class _PumsaeLoaderState extends State<PumsaeLoader> with SingleTickerProviderStateMixin {
  static const _tilt = 0.08; // rad, 약 4.5°

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  );
  Timer? _delay;
  late bool _visible = widget.delay == Duration.zero;

  @override
  void initState() {
    super.initState();
    if (_visible) {
      _controller.repeat();
    } else {
      _delay = Timer(widget.delay, () {
        setState(() => _visible = true);
        _controller.repeat();
      });
    }
  }

  @override
  void dispose() {
    _delay?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mark = AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value * 2 * math.pi;
        // 한 주기에 한 번 위로 튀었다가 내려오고, 좌우로 한 번씩 기운다.
        // 튀는 높이는 원 안에 머물도록 크기에 비례한다.
        return Transform.translate(
          offset: Offset(0, -widget.size * 0.06 * math.sin(t / 2).abs()),
          child: Transform.rotate(angle: _tilt * math.sin(t), child: child),
        );
      },
      child: IntroMark(size: widget.size * 0.66),
    );
    // 원과 글자는 제자리에 있고 마크만 움직여서, 로더 전체 크기는 늘 같다.
    final loader = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: widget.size,
          height: widget.size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.brandRed.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: mark,
        ),
        SizedBox(height: widget.size * 0.12),
        // 작은 로더에서도 글자가 읽히도록 9px 밑으로는 줄이지 않는다.
        IntroWordmark(fontSize: math.max(widget.size * 0.22, 9), onDark: widget.onDark),
      ],
    );

    if (!widget._overlay) return loader;

    return AbsorbPointer(
      child: ColoredBox(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Center(
          child: AnimatedOpacity(
            opacity: _visible ? 1 : 0,
            duration: const Duration(milliseconds: 200),
            child: loader,
          ),
        ),
      ),
    );
  }
}
