import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_provider.dart';
import '../../core/auth_repository.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _dojangNameController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _dojangNameController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _submitting) {
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(authProvider.notifier).register(
            dojangName: _dojangNameController.text.trim(),
            name: _nameController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
      // On success the router watches authProvider and switches to /home
      // on its own; no navigation call needed here.
    } catch (error) {
      if (!mounted) {
        return;
      }
      final message = error is AuthException
          ? error.message
          : '요청을 처리하지 못했습니다.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회원가입')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _dojangNameController,
                  decoration: const InputDecoration(labelText: '도장 이름'),
                  validator: (value) => (value == null || value.trim().isEmpty)
                      ? '도장 이름을 입력해 주세요'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: '이름'),
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? '이름을 입력해 주세요' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(labelText: '이메일'),
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? '이메일을 입력해 주세요' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: '비밀번호'),
                  validator: (value) => (value == null || value.length < 6)
                      ? '비밀번호는 6자 이상이어야 합니다'
                      : null,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('가입하기'),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: _submitting ? null : () => context.go('/login'),
                  child: const Text('이미 계정이 있으신가요? 로그인'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
