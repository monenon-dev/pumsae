import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_provider.dart';
import 'dashboard_repository.dart';
import 'dojang_summary.dart';

final dashboardRepositoryProvider = Provider.autoDispose<DashboardRepository>((
  ref,
) {
  return DashboardRepository(ref.watch(apiClientProvider));
});

final meProvider = FutureProvider.autoDispose<MeInfo>((ref) {
  return ref.watch(dashboardRepositoryProvider).fetchMe();
});

final dojangProvider = FutureProvider.autoDispose<DojangSummary>((ref) {
  return ref.watch(dashboardRepositoryProvider).fetchDojang();
});

final templateCountProvider = FutureProvider.autoDispose<int>((ref) {
  return ref.watch(dashboardRepositoryProvider).fetchTemplateCount();
});
