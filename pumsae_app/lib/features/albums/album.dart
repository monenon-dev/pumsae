class AlbumPhoto {
  const AlbumPhoto({
    required this.id,
    required this.url,
    required this.thumbUrl,
    required this.width,
    required this.height,
  });

  final String id;
  final String url;
  final String thumbUrl;
  final int width;
  final int height;

  factory AlbumPhoto.fromJson(Map<String, dynamic> json) {
    return AlbumPhoto(
      id: json['id'] as String,
      url: json['url'] as String,
      thumbUrl: json['thumbUrl'] as String,
      width: json['width'] as int,
      height: json['height'] as int,
    );
  }
}

class AlbumSummary {
  const AlbumSummary({
    required this.id,
    required this.title,
    required this.description,
    required this.takenOn,
    required this.isPublic,
    required this.photoCount,
    required this.coverUrl,
  });

  final String id;
  final String title;
  final String? description;

  /// "YYYY-MM-DD" or null.
  final String? takenOn;
  final bool isPublic;
  final int photoCount;
  final String? coverUrl;

  factory AlbumSummary.fromJson(Map<String, dynamic> json) {
    return AlbumSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      takenOn: json['takenOn'] as String?,
      isPublic: json['isPublic'] as bool,
      photoCount: json['photoCount'] as int,
      coverUrl: json['coverUrl'] as String?,
    );
  }
}

class AlbumDetail extends AlbumSummary {
  const AlbumDetail({
    required super.id,
    required super.title,
    required super.description,
    required super.takenOn,
    required super.isPublic,
    required super.photoCount,
    required super.coverUrl,
    required this.photos,
  });

  final List<AlbumPhoto> photos;

  factory AlbumDetail.fromJson(Map<String, dynamic> json) {
    final summary = AlbumSummary.fromJson(json);
    return AlbumDetail(
      id: summary.id,
      title: summary.title,
      description: summary.description,
      takenOn: summary.takenOn,
      isPublic: summary.isPublic,
      photoCount: summary.photoCount,
      coverUrl: summary.coverUrl,
      photos: (json['photos'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(AlbumPhoto.fromJson)
          .toList(),
    );
  }
}

/// "2026-10-18" → "2026년 10월 18일".
String? formatTakenOn(String? takenOn) {
  if (takenOn == null) return null;
  final parts = takenOn.split('-');
  if (parts.length != 3) return takenOn;
  return '${int.parse(parts[0])}년 ${int.parse(parts[1])}월 ${int.parse(parts[2])}일';
}
