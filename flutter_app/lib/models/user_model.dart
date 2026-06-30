class User {
  final String id;
  final String? name;
  final String? email;
  final String? phone;
  final String role;
  final bool isVerified;
  final String? avatarUrl;
  final String? address;
  final String? city;
  final String? state;
  final String? pincode;
  final DateTime? dateOfBirth;
  final String? gender;
  final DateTime createdAt;

  User({
    required this.id,
    this.name,
    this.email,
    this.phone,
    required this.role,
    this.isVerified = false,
    this.avatarUrl,
    this.address,
    this.city,
    this.state,
    this.pincode,
    this.dateOfBirth,
    this.gender,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'] ?? 'user',
      isVerified: json['isVerified'] ?? json['is_verified'] ?? false,
      avatarUrl: json['avatarUrl'] ?? json['avatar_url'],
      address: json['address'],
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.tryParse(json['dateOfBirth']) 
          : null,
      gender: json['gender'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'isVerified': isVerified,
      'avatarUrl': avatarUrl,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String get displayName => name ?? email ?? phone ?? 'User';
  
  bool get isAdmin => role == 'admin' || role == 'super_admin';
  bool get isAgent => role == 'agent';
  bool get isFranchise => role.contains('franchise');
}
