import 'package:flutter/material.dart';

import 'intro_mark.dart';

/// 앱 실행 직후 [child](라우터 화면) 위에 인트로를 덮어 보여 주는 위젯.
///
/// 라우터는 그 아래에서 평소처럼 돌아가므로 리다이렉트·로그인 흐름은 그대로다.
/// 애니메이션(약 1.5초)이 끝나고 [ready]가 true가 되면(세션 복원 완료) 인트로가
/// 페이드아웃되며 그 시점의 화면(홈 탭 또는 로그인)이 드러난다. 복원이 더 오래
/// 걸리면 마지막 프레임에서 기다린다. 한 번 사라지면 이 State가 살아 있는 동안
/// (= 앱 실행 한 번) 다시 나타나지 않는다.
class IntroGate extends StatefulWidget {
  const IntroGate({super.key, required this.ready, required this.child});

  final bool ready;
  final Widget child;

  @override
  State<IntroGate> createState() => _IntroGateState();
}

class _IntroGateState extends State<IntroGate> with TickerProviderStateMixin {
  late final AnimationController _intro = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  );
  late final AnimationController _exit = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 400),
  );

  // 0~60%: 마크가 0.6→1.0으로 커지며 나타나고, 50~100%: 글자가 이어서 나타난다.
  late final Animation<double> _markScale = Tween(begin: 0.6, end: 1.0).animate(
    CurvedAnimation(parent: _intro, curve: const Interval(0, 0.6, curve: Curves.easeOutCubic)),
  );
  late final Animation<double> _markOpacity = CurvedAnimation(
    parent: _intro,
    curve: const Interval(0, 0.5, curve: Curves.easeOut),
  );
  late final Animation<double> _textOpacity = CurvedAnimation(
    parent: _intro,
    curve: const Interval(0.5, 1, curve: Curves.easeOut),
  );
  late final Animation<double> _overlayOpacity =
      ReverseAnimation(CurvedAnimation(parent: _exit, curve: Curves.easeOut));

  bool _done = false;

  @override
  void initState() {
    super.initState();
    _intro.forward().whenComplete(_maybeExit);
  }

  @override
  void didUpdateWidget(IntroGate oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.ready && !oldWidget.ready) _maybeExit();
  }

  void _maybeExit() {
    if (!mounted || _done || !widget.ready || !_intro.isCompleted) return;
    if (_exit.isAnimating) return;
    _exit.forward().whenComplete(() {
      if (mounted) setState(() => _done = true);
    });
  }

  @override
  void dispose() {
    _intro.dispose();
    _exit.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_done) return widget.child;

    return Stack(
      fit: StackFit.expand,
      children: [
        widget.child,
        FadeTransition(
          opacity: _overlayOpacity,
          // 인트로가 떠 있는 동안 아래 화면이 터치를 받지 않게 막는다.
          child: AbsorbPointer(
            // Material이 기본 글자 스타일을 깔아 줘서, 디버그 모드의 노란 밑줄이 안 생긴다.
            child: Material(
              color: Colors.white,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FadeTransition(
                      opacity: _markOpacity,
                      child: ScaleTransition(scale: _markScale, child: const IntroMark()),
                    ),
                    const SizedBox(height: 20),
                    FadeTransition(
                      opacity: _textOpacity,
                      child: const IntroWordmark(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
