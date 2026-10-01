import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../theme/app_theme.dart';

/// PUMSAE 캐릭터: [AppColors.brandRed] 12% 원 위에 도복(Noto Emoji 🥋 SVG)을 올린 것.
///
/// 로딩 표시는 이 위젯을 쓴다. 캐릭터를 다른 그림이나 Lottie로 바꿀 때는
/// [_figure]만 고치면 된다. 원은 흰 도복이 흰 배경에 묻히지 않게 깔아 둔다.
class TkdCharacter extends StatelessWidget {
  const TkdCharacter({super.key, this.size = 96, this.figureBuilder});

  /// 원형 배경의 지름. 도복은 그 66% 크기로 가운데에 놓인다.
  final double size;

  /// 원은 제자리에 두고 도복에만 움직임(변형)을 줄 때 쓴다.
  final Widget Function(BuildContext context, Widget figure)? figureBuilder;

  static const _asset = 'assets/images/dobok.svg';

  Widget get _figure =>
      SvgPicture.asset(_asset, width: size * 0.66, height: size * 0.66);

  @override
  Widget build(BuildContext context) {
    final figure = _figure;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.brandRed.withValues(alpha: 0.12),
        shape: BoxShape.circle,
      ),
      child: figureBuilder?.call(context, figure) ?? figure,
    );
  }
}

/// 캐릭터 아래에 붙는 "PUMSAE" 글자. 시작 화면과 로딩 표시가 같이 쓴다.
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
