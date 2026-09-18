class PromoTemplate {
  const PromoTemplate({
    required this.id,
    required this.type,
    required this.typeLabel,
    required this.title,
    required this.thumbnailUrl,
    required this.createdAt,
  });

  final String id;
  final String type;
  final String typeLabel;
  final String title;
  final String? thumbnailUrl;
  final DateTime createdAt;

  factory PromoTemplate.fromJson(Map<String, dynamic> json) {
    return PromoTemplate(
      id: json['id'] as String,
      type: json['type'] as String,
      typeLabel: json['typeLabel'] as String,
      title: json['title'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
