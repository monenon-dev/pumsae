class TrialRequest {
  const TrialRequest({
    required this.id,
    required this.dojangId,
    required this.studentName,
    required this.parentName,
    required this.parentPhone,
    required this.desiredClass,
    required this.memo,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String dojangId;
  final String studentName;
  final String parentName;
  final String parentPhone;

  /// "KIDS" | "ELEMENTARY" | "MIDDLE_HIGH" | "ADULT" | null, as sent by the
  /// backend.
  final String? desiredClass;
  final String? memo;

  /// "PENDING" | "CONFIRMED" | "DECLINED".
  final String status;
  final DateTime createdAt;

  factory TrialRequest.fromJson(Map<String, dynamic> json) {
    return TrialRequest(
      id: json['id'] as String,
      dojangId: json['dojangId'] as String,
      studentName: json['studentName'] as String,
      parentName: json['parentName'] as String,
      parentPhone: json['parentPhone'] as String,
      desiredClass: json['desiredClass'] as String?,
      memo: json['memo'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  TrialRequest copyWith({String? status}) {
    return TrialRequest(
      id: id,
      dojangId: dojangId,
      studentName: studentName,
      parentName: parentName,
      parentPhone: parentPhone,
      desiredClass: desiredClass,
      memo: memo,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }
}
