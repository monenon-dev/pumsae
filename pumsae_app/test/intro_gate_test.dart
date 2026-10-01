import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pumsae_app/features/intro/intro_gate.dart';

Widget _app({required bool ready}) => MaterialApp(
      home: const Scaffold(body: Text('HOME')),
      builder: (context, child) => IntroGate(ready: ready, child: child!),
    );

void main() {
  testWidgets('stays at least 1.5s even when auth is already ready', (tester) async {
    await tester.pumpWidget(_app(ready: true));
    await tester.pump(const Duration(milliseconds: 1400));
    expect(find.text('PUMSAE'), findsOneWidget);

    await tester.pumpAndSettle();
    expect(find.text('PUMSAE'), findsNothing);
    expect(find.text('HOME'), findsOneWidget);
  });

  testWidgets('holds the last frame until auth finishes', (tester) async {
    await tester.pumpWidget(_app(ready: false));
    await tester.pump(const Duration(seconds: 5));
    expect(find.text('PUMSAE'), findsOneWidget);

    await tester.pumpWidget(_app(ready: true));
    await tester.pumpAndSettle();
    expect(find.text('PUMSAE'), findsNothing);

    // 한 번 사라진 인트로는 ready가 다시 바뀌어도 돌아오지 않는다.
    await tester.pumpWidget(_app(ready: false));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('PUMSAE'), findsNothing);
  });
}
