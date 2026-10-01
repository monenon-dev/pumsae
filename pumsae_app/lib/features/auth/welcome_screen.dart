import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';
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
              const Center(child: _FlyingKick()),
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

/// 웹 홈 첫 화면과 같은 날아차기 캐릭터(투명 배경 움직이는 WebP).
/// 기기에서 애니메이션을 줄이도록 설정했으면 멈춘 한 장면을 보여 준다.
class _FlyingKick extends StatelessWidget {
  const _FlyingKick();

  static const _height = 220.0;

  @override
  Widget build(BuildContext context) {
    final still = MediaQuery.of(context).disableAnimations;
    return Image.asset(
      still ? 'assets/images/flying_kick_still.webp' : 'assets/images/flying_kick.webp',
      height: _height,
      fit: BoxFit.contain,
      semanticLabel: '날아차기를 하는 태권도 캐릭터',
    );
  }
}
