class Plan {
  final String id;
  final String name;
  final String category;
  final String description;
  final double price;
  final double supportLimit;
  final int durationMonths;
  final List<String> features;
  final List<String> addOns;
  final bool isActive;
  final String? imageUrl;
  final int? maxAge;
  final int? minAge;

  Plan({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.price,
    required this.supportLimit,
    required this.durationMonths,
    required this.features,
    this.addOns = const [],
    this.isActive = true,
    this.imageUrl,
    this.maxAge,
    this.minAge,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    List<String> parseFeatures(dynamic features) {
      if (features == null) return [];
      if (features is List) return features.map((e) => e.toString()).toList();
      if (features is String) {
        try {
          final parsed = features;
          if (parsed.startsWith('[')) {
            return (parsed as List).map((e) => e.toString()).toList();
          }
        } catch (_) {}
        return [features];
      }
      return [];
    }

    return Plan(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'general',
      description: json['description'] ?? '',
      price: (json['price'] ?? json['yearlyPrice'] ?? 0).toDouble(),
      supportLimit: (json['supportLimit'] ?? json['support_limit'] ?? json['coverageAmount'] ?? 0).toDouble(),
      durationMonths: json['durationMonths'] ?? json['duration_months'] ?? 12,
      features: parseFeatures(json['features']),
      addOns: parseFeatures(json['addOns'] ?? json['add_ons']),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      imageUrl: json['imageUrl'] ?? json['image_url'],
      maxAge: json['maxAge'] ?? json['max_age'],
      minAge: json['minAge'] ?? json['min_age'],
    );
  }

  String get formattedPrice => '₹${price.toStringAsFixed(0)}';
  String get formattedSupportLimit => '₹${(supportLimit / 100000).toStringAsFixed(1)} Lakh';
  String get duration => '$durationMonths months';
  
  String get categoryDisplay {
    switch (category.toLowerCase()) {
      case 'individual':
        return 'Individual Plans';
      case 'family':
        return 'Family Plans';
      case 'senior':
        return 'Senior Citizen Plans';
      case 'maternity':
        return 'Maternity Plans';
      case 'vehicle':
        return 'Vehicle Accident Plans';
      case 'property':
        return 'Property Protection';
      case 'business':
        return 'Business Plans';
      case 'student':
        return 'Student Plans';
      case 'travel':
        return 'Travel Plans';
      case 'group':
        return 'Group Plans';
      default:
        return category;
    }
  }
}
