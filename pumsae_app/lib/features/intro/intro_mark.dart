import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

/// 인트로와 로딩 표시에 쓰는 로고 마크(도복).
///
/// 흰 도복에 [AppColors.brandLine] 윤곽선, 빨간 띠와 매듭을 [CustomPainter]로 직접 그린다.
/// 나중에 SVG/Lottie로 바꿀 때는 이 위젯의 build만 고치면 된다
/// (크기는 [size] 정사각형 안에 맞춘다).
class IntroMark extends StatelessWidget {
  const IntroMark({super.key, this.size = 96});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(size: Size.square(size), painter: const _DobokPainter());
  }
}

/// 100×100 격자 기준으로 그린 뒤 실제 크기에 맞춰 늘린다.
class _DobokPainter extends CustomPainter {
  const _DobokPainter();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 100, size.height / 100);

    final fill = Paint()..color = AppColors.brandWhite;
    final outline = Paint()
      ..color = AppColors.brandLine
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeJoin = StrokeJoin.round;
    final belt = Paint()..color = AppColors.brandRed;
    final knot = Paint()..color = AppColors.brandRedDark;

    void shape(Path path, Paint paint, {bool stroked = true}) {
      canvas.drawPath(path, paint);
      if (stroked) canvas.drawPath(path, outline);
    }

    // 소매까지 이어진 저고리 몸판.
    shape(
      Path()
        ..moveTo(38, 12)
        ..lineTo(26, 16)
        ..lineTo(9, 38)
        ..lineTo(5, 62)
        ..lineTo(18, 65)
        ..lineTo(23, 46)
        ..lineTo(24, 88)
        ..lineTo(76, 88)
        ..lineTo(77, 46)
        ..lineTo(82, 65)
        ..lineTo(95, 62)
        ..lineTo(91, 38)
        ..lineTo(74, 16)
        ..lineTo(62, 12)
        ..quadraticBezierTo(50, 18, 38, 12)
        ..close(),
      fill,
    );

    // 깃: 왼쪽 깃이 아래, 오른쪽 깃이 위로 겹쳐 V자를 만든다.
    shape(
      Path()
        ..moveTo(56, 12)
        ..lineTo(63, 12)
        ..lineTo(50, 44)
        ..lineTo(45, 38)
        ..close(),
      fill,
    );
    shape(
      Path()
        ..moveTo(37, 12)
        ..lineTo(44, 12)
        ..lineTo(62, 56)
        ..lineTo(55, 57)
        ..close(),
      fill,
    );

    // 띠, 그 앞으로 늘어진 두 가닥, 가운데 매듭 순서로 그린다.
    canvas.drawRRect(
      RRect.fromLTRBR(23, 55, 77, 64, const Radius.circular(2)),
      belt,
    );
    canvas.drawPath(
      Path()
        ..moveTo(47, 62)
        ..lineTo(39, 81)
        ..lineTo(45, 83)
        ..lineTo(51, 64)
        ..close(),
      belt,
    );
    canvas.drawPath(
      Path()
        ..moveTo(49, 64)
        ..lineTo(55, 83)
        ..lineTo(61, 81)
        ..lineTo(53, 62)
        ..close(),
      belt,
    );
    canvas.drawRRect(
      RRect.fromLTRBR(44.5, 53, 55.5, 66, const Radius.circular(3)),
      knot,
    );
  }

  @override
  bool shouldRepaint(_DobokPainter oldDelegate) => false;
}

/// 마크 아래에 붙는 "PUMSAE" 글자. 인트로와 로딩 표시가 같이 쓴다.
/// 어두운 배경 위에서는 [onDark]를 켜서 흰 글자로 쓴다.
class IntroWordmark extends StatelessWidget {
  const IntroWordmark({super.key, this.fontSize = 28, this.onDark = false});

  final double fontSize;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return Text(
      'PUMSAE',
      style: TextStyle(
        color: onDark ? AppColors.brandWhite : AppColors.brandRed,
        fontSize: fontSize,
        fontWeight: FontWeight.w800,
        letterSpacing: fontSize * 0.21,
      ),
    );
  }
}
