class DojangSummary {
  const DojangSummary({required this.name, required this.slug});

  final String name;
  final String slug;

  factory DojangSummary.fromJson(Map<String, dynamic> json) {
    return DojangSummary(
      name: json['name'] as String,
      slug: json['slug'] as String,
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
