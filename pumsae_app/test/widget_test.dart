import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pumsae_app/features/auth/login_screen.dart';
import 'package:pumsae_app/features/auth/register_screen.dart';
import 'package:pumsae_app/features/auth/welcome_screen.dart';

void main() {
  testWidgets('login screen shows email/password fields and a submit button',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: LoginScreen()),
      ),
    );

    expect(find.text('이메일'), findsOneWidget);
    expect(find.text('비밀번호'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, '로그인'), findsOneWidget);
    expect(find.text('계정이 없으신가요? 회원가입'), findsOneWidget);
  });

  testWidgets('register screen shows all four fields and a submit button',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: RegisterScreen()),
      ),
    );

    expect(find.text('도장 이름'), findsOneWidget);
    expect(find.text('이름'), findsOneWidget);
    expect(find.text('이메일'), findsOneWidget);
    expect(find.text('비밀번호'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, '가입하기'), findsOneWidget);
    expect(find.text('이미 계정이 있으신가요? 로그인'), findsOneWidget);
  });

  testWidgets('welcome screen shows the flying-kick character, wordmark and both entry buttons',
      (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: WelcomeScreen()));

    expect(find.bySemanticsLabel('날아차기를 하는 태권도 캐릭터'), findsOneWidget);
    expect(find.text('PUMSAE'), findsOneWidget);
    expect(find.text('태권도장 운영을 한 곳에서'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, '로그인'), findsOneWidget);
    expect(find.widgetWithText(OutlinedButton, '회원가입'), findsOneWidget);
  });
}
