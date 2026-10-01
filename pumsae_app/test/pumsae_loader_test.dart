import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pumsae_app/features/intro/tkd_character.dart';
import 'package:pumsae_app/features/intro/pumsae_loader.dart';
import 'package:pumsae_app/theme/app_theme.dart';

const _release = Duration(milliseconds: 300);

double _markOpacity(WidgetTester tester) =>
    tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity)).opacity;

void main() {
  testWidgets('inline loader shows the mark right away and keeps animating', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Center(child: PumsaeLoader())));
    expect(find.byType(TkdCharacter), findsOneWidget);
    expect(find.text('PUMSAE'), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 250));
    expect(tester.hasRunningAnimations, isTrue);

    // 화면에서 빠질 때 컨트롤러가 정리되지 않으면 여기서 실패한다.
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('sizes default to section/full and the wordmark follows onDark', (tester) async {
    expect(const PumsaeLoader().size, kLoaderSection);
    expect(const PumsaeLoader.overlay().size, kLoaderFull);

    Color? wordmarkColor() =>
        tester.widget<Text>(find.text('PUMSAE')).style?.color;

    await tester.pumpWidget(const MaterialApp(home: Center(child: PumsaeLoader())));
    expect(wordmarkColor(), AppColors.brandRed);

    await tester.pumpWidget(const MaterialApp(home: Center(child: PumsaeLoader(onDark: true))));
    expect(wordmarkColor(), AppColors.brandWhite);
    await tester.pumpWidget(const SizedBox());
  });

  test('kLoaderDelay is zero in debug builds (tests run in debug)', () {
    expect(kLoaderDelay, Duration.zero);
  });

  testWidgets('overlay shows the mark immediately with kLoaderDelay in debug', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: PumsaeLoader.overlay()));
    expect(_markOpacity(tester), 1);
    await tester.pumpWidget(const SizedBox());
  });

  // 아래 두 테스트는 릴리스 값(300ms)을 직접 넘겨 지연 로직을 확인한다.
  testWidgets('overlay hides the mark for the first 300ms', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: PumsaeLoader.overlay(delay: _release)));
    await tester.pump(const Duration(milliseconds: 250));
    expect(_markOpacity(tester), 0);

    await tester.pump(const Duration(milliseconds: 100));
    expect(_markOpacity(tester), 1);
  });

  testWidgets('overlay that finishes within 300ms never shows the mark', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: PumsaeLoader.overlay(delay: _release)));
    await tester.pump(const Duration(milliseconds: 200));
    expect(_markOpacity(tester), 0);

    // 지연 타이머가 남아 있으면 테스트 종료 시 pending timer로 실패한다.
    await tester.pumpWidget(const MaterialApp(home: Text('DONE')));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.byType(TkdCharacter), findsNothing);
  });

  testWidgets('TkdCharacter draws the dobok SVG on a 12% brandRed circle', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Center(child: TkdCharacter(size: kLoaderFull))));
    final svg = tester.widget<SvgPicture>(find.byType(SvgPicture));
    expect((svg.bytesLoader as SvgAssetLoader).assetName, 'assets/images/dobok.svg');

    final circle = tester.widget<Container>(find.byType(Container).first);
    final decoration = circle.decoration! as BoxDecoration;
    expect(decoration.shape, BoxShape.circle);
    expect(decoration.color, AppColors.brandRed.withValues(alpha: 0.12));
    expect(tester.getSize(find.byType(TkdCharacter)), const Size.square(kLoaderFull));
  });
}
