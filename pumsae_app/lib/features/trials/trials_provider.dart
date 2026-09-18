import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import '../../core/auth_provider.dart';
import 'trial_request.dart';
import 'trials_repository.dart';
import 'trials_socket.dart';

// autoDispose everywhere in this chain so the socket connects only while
// something (the trials screen) is actually watching trialsProvider, and
// disconnects again once that watcher goes away.

final trialsRepositoryProvider = Provider.autoDispose<TrialsRepository>((ref) {
  return TrialsRepository(ref.watch(apiClientProvider));
});

final trialsSocketProvider = Provider.autoDispose<TrialsSocket>((ref) {
  final socket = TrialsSocket(ref.watch(apiClientProvider));
  ref.onDispose(socket.dispose);
  return socket;
});

class TrialsNotifier extends StateNotifier<AsyncValue<List<TrialRequest>>> {
  TrialsNotifier(this._repository, this._socket)
      : super(const AsyncValue.loading()) {
    _init();
  }

  final TrialsRepository _repository;
  final TrialsSocket _socket;
  StreamSubscription<TrialRequest>? _socketSub;

  Future<void> _init() async {
    try {
      final trials = await _repository.fetchTrialRequests();
      state = AsyncValue.data(trials);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
    _socketSub = _socket.connect().listen(_onCreated);
  }

  void _onCreated(TrialRequest trial) {
    final current = state.value ?? const <TrialRequest>[];
    state = AsyncValue.data([trial, ...current]);
  }

  /// Applies a status change (from [TrialsRepository.updateStatus]) to the
  /// already-loaded list, without refetching.
  void applyUpdated(TrialRequest updated) {
    final current = state.value;
    if (current == null) {
      return;
    }
    state = AsyncValue.data([
      for (final trial in current)
        if (trial.id == updated.id) updated else trial,
    ]);
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    super.dispose();
  }
}

final trialsProvider = StateNotifierProvider.autoDispose<TrialsNotifier,
    AsyncValue<List<TrialRequest>>>((ref) {
  return TrialsNotifier(
    ref.watch(trialsRepositoryProvider),
    ref.watch(trialsSocketProvider),
  );
});

final pendingTrialsCountProvider = Provider.autoDispose<int>((ref) {
  final trials = ref.watch(trialsProvider).value ?? const <TrialRequest>[];
  return trials.where((trial) => trial.status == 'PENDING').length;
});
