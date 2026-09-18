import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../../core/api_client.dart';
import 'trial_request.dart';

/// Keeps a live connection to wss://.../ws/dashboard/trial-requests and
/// surfaces each `{ type: "trial.created", trial: {...} }` message as a
/// [TrialRequest] on a broadcast stream.
///
/// Reconnects a fixed 3 seconds after any disconnect (error or clean close)
/// for as long as the socket hasn't been [dispose]d, re-reading the current
/// access token from [ApiClient] on every attempt.
class TrialsSocket {
  TrialsSocket(this._apiClient);

  final ApiClient _apiClient;

  final StreamController<TrialRequest> _controller =
      StreamController<TrialRequest>.broadcast();

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _subscription;
  Timer? _reconnectTimer;
  bool _disposed = false;

  Stream<TrialRequest> connect() {
    _open();
    return _controller.stream;
  }

  void _open() {
    if (_disposed) {
      return;
    }

    final channel = WebSocketChannel.connect(_buildUri());
    _channel = channel;

    channel.ready.catchError((Object _) {
      _scheduleReconnect();
    });

    _subscription = channel.stream.listen(
      _handleMessage,
      onError: (Object _) => _scheduleReconnect(),
      onDone: _scheduleReconnect,
      cancelOnError: true,
    );
  }

  Uri _buildUri() {
    final base = Uri.parse(ApiConfig.baseUrl);
    final scheme = base.scheme == 'https' ? 'wss' : 'ws';
    final token = _apiClient.accessToken;
    return base.replace(
      scheme: scheme,
      path: '/ws/dashboard/trial-requests',
      queryParameters: token != null ? {'token': token} : null,
    );
  }

  void _handleMessage(dynamic raw) {
    if (raw is! String) {
      return;
    }
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map || decoded['type'] != 'trial.created') {
        return;
      }
      final trialJson = decoded['trial'];
      if (trialJson is! Map) {
        return;
      }
      _controller.add(TrialRequest.fromJson(trialJson.cast<String, dynamic>()));
    } catch (_) {
      // Ignore malformed frames.
    }
  }

  void _scheduleReconnect() {
    _subscription?.cancel();
    _subscription = null;
    _channel = null;

    if (_disposed) {
      return;
    }

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), _open);
  }

  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _subscription?.cancel();
    _channel?.sink.close();
    _controller.close();
  }
}
