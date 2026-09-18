import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth_provider.dart';
import 'promo_template.dart';
import 'templates_repository.dart';

final templatesRepositoryProvider = Provider.autoDispose<TemplatesRepository>(
  (ref) {
    return TemplatesRepository(ref.watch(apiClientProvider));
  },
);

final templatesProvider = FutureProvider.autoDispose<List<PromoTemplate>>((
  ref,
) {
  return ref.watch(templatesRepositoryProvider).fetchTemplates();
});
