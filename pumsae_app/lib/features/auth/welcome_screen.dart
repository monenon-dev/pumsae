import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';
import '../intro/pumsae_loader.dart';
import '../intro/tkd_character.dart';

/// 로그인하지 않은 상태로 앱을 열면(인트로 다음) 처음 보이는 시작 화면.
/// 로그인·회원가입 화면은 이 위에 쌓여서, 뒤로 가기를 누르면 여기로 돌아온다.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Center(child: TkdCharacter(size: kLoaderFull)),
              const SizedBox(height: 20),
              const Center(child: IntroWordmark()),
              const SizedBox(height: 28),
              const Text(
                '태권도장 운영을 한 곳에서',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.brandInk,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '체험 신청 · 일정 · 사진첩 · 카드뉴스',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.muted, fontSize: 14),
              ),
              const Spacer(),
              FilledButton(
                onPressed: () => context.push('/login'),
                style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                child: const Text('로그인'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.push('/register'),
                style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                child: const Text('회원가입'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
