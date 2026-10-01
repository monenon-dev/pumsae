import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pumsae_app/features/intro/intro_mark.dart';
import 'package:pumsae_app/features/intro/pumsae_loader.dart';

double _markOpacity(WidgetTester tester) =>
    tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity)).opacity;

void main() {
  testWidgets('inline loader shows the mark right away and keeps animating', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Center(child: PumsaeLoader())));
    expect(find.byType(IntroMark), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 250));
    expect(tester.hasRunningAnimations, isTrue);

    // 화면에서 빠질 때 컨트롤러가 정리되지 않으면 여기서 실패한다.
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('overlay hides the mark for the first 300ms', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: PumsaeLoader.overlay()));
    await tester.pump(const Duration(milliseconds: 250));
    expect(_markOpacity(tester), 0);

    await tester.pump(const Duration(milliseconds: 100));
    expect(_markOpacity(tester), 1);
  });

  testWidgets('overlay that finishes within 300ms never shows the mark', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: PumsaeLoader.overlay()));
    await tester.pump(const Duration(milliseconds: 200));
    expect(_markOpacity(tester), 0);

    // 지연 타이머가 남아 있으면 테스트 종료 시 pending timer로 실패한다.
    await tester.pumpWidget(const MaterialApp(home: Text('DONE')));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.byType(IntroMark), findsNothing);
  });
}
