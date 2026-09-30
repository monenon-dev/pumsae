import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../dashboard/dashboard_provider.dart';
import '../dashboard/home_screen.dart' show openWeb;

/// 탭에 두기엔 덜 자주 쓰는 것들: 카드뉴스, 홈페이지 편집, 계정.
class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider).value;

    return Scaffold(
      appBar: AppBar(title: const Text('더보기')),
      body: ListView(
        children: [
          if (me != null)
            ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person_outline)),
              title: Text(me.name, style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: me.dojangName == null ? null : Text(me.dojangName!),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/profile'),
            ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.image_outlined),
            title: const Text('카드뉴스'),
            subtitle: const Text('만든 카드뉴스를 보고 갤러리에 저장'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/templates'),
          ),
          ListTile(
            leading: const Icon(Icons.edit_outlined),
            title: const Text('홈페이지 편집'),
            subtitle: const Text('편집기는 웹에서 열려요'),
            trailing: const Icon(Icons.open_in_new, size: 20),
            onTap: () => openWeb(context, '/dashboard/landing'),
          ),
          ListTile(
            leading: const Icon(Icons.manage_accounts_outlined),
            title: const Text('계정 설정'),
            subtitle: const Text('이름·비밀번호 변경, 로그아웃'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/profile'),
          ),
        ],
      ),
    );
  }
}
