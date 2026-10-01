import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';
import 'intro_mark.dart';

/// 인트로와 같은 마크([IntroMark])가 1초 주기로 통통 튀며 살짝 기울고, 그 아래에
/// "PUMSAE" 글자([IntroWordmark])가 붙는 로딩 표시.
///
/// - `PumsaeLoader()`: 카드·본문 안에 바로 놓는 로더.
/// - `PumsaeLoader.overlay()`: 화면 전체를 덮는 로딩. 시작 후 300ms가 지나야 마크가
///   나타나서, 금방 끝나는 로딩에서는 로더가 깜빡이지 않는다.
class PumsaeLoader extends StatefulWidget {
  const PumsaeLoader({super.key, this.size = 48, this.color = AppColors.ink})
      : _overlay = false;

  const PumsaeLoader.overlay({super.key, this.size = 64, this.color = AppColors.ink})
      : _overlay = true;

  /// 마크 크기. 글자 크기와 간격도 이 값에 맞춰 정해진다.
  final double size;

  /// "PUMSAE" 글자 색. 어두운 카드 위에서는 흰색을 넘긴다.
  final Color color;
  final bool _overlay;

  @override
  State<PumsaeLoader> createState() => _PumsaeLoaderState();
}

class _PumsaeLoaderState extends State<PumsaeLoader> with SingleTickerProviderStateMixin {
  static const _overlayDelay = Duration(milliseconds: 300);
  static const _bounce = 4.0; // px
  static const _tilt = 0.08; // rad, 약 4.5°

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  );
  Timer? _delay;
  late bool _visible = !widget._overlay;

  @override
  void initState() {
    super.initState();
    if (_visible) {
      _controller.repeat();
    } else {
      _delay = Timer(_overlayDelay, () {
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
        return Transform.translate(
          offset: Offset(0, -_bounce * math.sin(t / 2).abs()),
          child: Transform.rotate(angle: _tilt * math.sin(t), child: child),
        );
      },
      child: IntroMark(size: widget.size),
    );
    // 글자는 튀지 않고 제자리에 있어서, 마크만 움직이는 게 또렷이 보인다.
    final loader = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        SizedBox(height: widget.size * 0.2),
        IntroWordmark(fontSize: widget.size * 0.3, color: widget.color),
      ],
    );

    if (!widget._overlay) {
      // 위로 튀는 4px까지 자리를 잡아 둬서 주변 레이아웃이 흔들리지 않게 한다.
      return Padding(padding: const EdgeInsets.only(top: _bounce), child: loader);
    }

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
