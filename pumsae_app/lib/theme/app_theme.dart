import 'package:flutter/material.dart';

/// 웹(tailwind.config.ts의 pumsae 색)과 같은 팔레트.
/// 바탕·카드·탭바는 무채색이고, 빨강은 선택된 탭·배지·주요 버튼에만 쓴다.
class AppColors {
  AppColors._();

  static const bg = Color(0xFFFAFAF8);
  static const card = Color(0xFFFFFFFF);
  static const ink = Color(0xFF1C1C1C);
  static const muted = Color(0xFF6B6B65);
  static const line = Color(0xFFECEBE6);
  static const fill = Color(0xFFF0EFEA);
  static const accent = Color(0xFFB4222E);
  static const accentDark = Color(0xFF8F1B24);
  static const accentSoft = Color(0xFFF9E8E9);

  // 홈 타일에서 기능을 색으로 구분하는 용도. 아이콘과 그 뒤 옅은 원에만 쓴다.
  static const trials = accent;
  static const calendar = Color(0xFF2563EB);
  static const albums = Color(0xFF16A34A);
  static const templates = Color(0xFFEA580C);
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    // fromSeed는 바탕·카드까지 빨간 기운으로 물들이므로, 역할별 색을 직접 덮어쓴다.
    final colorScheme = ColorScheme.fromSeed(seedColor: AppColors.accent).copyWith(
      primary: AppColors.accent,
      onPrimary: Colors.white,
      primaryContainer: AppColors.fill,
      onPrimaryContainer: AppColors.ink,
      secondary: AppColors.muted,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.fill,
      onSecondaryContainer: AppColors.ink,
      tertiary: AppColors.muted,
      tertiaryContainer: AppColors.fill,
      onTertiaryContainer: AppColors.ink,
      surface: AppColors.bg,
      onSurface: AppColors.ink,
      onSurfaceVariant: AppColors.muted,
      surfaceTint: Colors.transparent,
      surfaceContainerLowest: AppColors.card,
      surfaceContainerLow: AppColors.card,
      surfaceContainer: AppColors.card,
      surfaceContainerHigh: AppColors.card,
      surfaceContainerHighest: AppColors.fill,
      outline: const Color(0xFFD6D5CF),
      outlineVariant: AppColors.line,
    );

    final cardShape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(14),
      side: const BorderSide(color: AppColors.line),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.bg,
      dividerColor: AppColors.line,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bg,
        foregroundColor: AppColors.ink,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shadowColor: Colors.transparent,
        shape: cardShape,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        indicatorColor: AppColors.accentSoft,
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected)
                ? AppColors.accent
                : AppColors.muted,
          ),
        ),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 12,
            fontWeight: states.contains(WidgetState.selected)
                ? FontWeight.w700
                : FontWeight.w500,
            color: states.contains(WidgetState.selected)
                ? AppColors.accent
                : AppColors.muted,
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.ink,
        foregroundColor: Colors.white,
        elevation: 2,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.ink,
          side: const BorderSide(color: AppColors.line),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.accent),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.card,
        border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.ink, width: 1.5),
        ),
      ),
      dialogTheme: const DialogThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: AppColors.ink,
        behavior: SnackBarBehavior.floating,
      ),
      switchTheme: SwitchThemeData(
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected) ? AppColors.accent : AppColors.fill,
        ),
      ),
    );
  }
}
