import 'package:flutter/material.dart';

/// 인트로 가운데에 놓이는 로고 마크.
/// 지금은 도복 이모지지만, PNG/SVG/Lottie로 바꿀 때는 이 위젯의 build만 고치면 된다
/// (크기는 [size] 정사각형 안에 맞춘다).
class IntroMark extends StatelessWidget {
  const IntroMark({super.key, this.size = 96});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: FittedBox(
        child: Text('🥋', style: TextStyle(fontSize: size * 0.8, height: 1)),
      ),
    );
  }
}
