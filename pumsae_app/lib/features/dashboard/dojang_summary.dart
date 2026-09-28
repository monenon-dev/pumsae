class DojangSummary {
  const DojangSummary({
    required this.name,
    required this.slug,
    required this.updatedAt,
  });

  final String name;
  final String slug;

  /// null until the owner saves the landing page for the first time.
  final DateTime? updatedAt;

  bool get published => updatedAt != null;

  factory DojangSummary.fromJson(Map<String, dynamic> json) {
    final updatedAt = json['updatedAt'] as String?;
    return DojangSummary(
      name: json['name'] as String,
      slug: json['slug'] as String,
      updatedAt: updatedAt == null ? null : DateTime.parse(updatedAt),
    );
  }
}

class MeInfo {
  const MeInfo({
    required this.name,
    required this.role,
    required this.dojangName,
  });

  final String name;

  /// "OWNER" | "INSTRUCTOR", as sent by the backend.
  final String role;
  final String? dojangName;

  factory MeInfo.fromJson(Map<String, dynamic> json) {
    return MeInfo(
      name: json['name'] as String,
      role: json['role'] as String,
      dojangName: json['dojangName'] as String?,
    );
  }
}
