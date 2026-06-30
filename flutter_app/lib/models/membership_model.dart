class Membership {
  final String id;
  final String planId;
  final String planName;
  final String userId;
  final String status;
  final DateTime startDate;
  final DateTime endDate;
  final double amountPaid;
  final double supportLimit;
  final String? membershipNumber;
  final List<FamilyMember> familyMembers;
  final String? vehicleDetails;
  final String? propertyDetails;
  final DateTime createdAt;

  Membership({
    required this.id,
    required this.planId,
    required this.planName,
    required this.userId,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.amountPaid,
    required this.supportLimit,
    this.membershipNumber,
    this.familyMembers = const [],
    this.vehicleDetails,
    this.propertyDetails,
    required this.createdAt,
  });

  factory Membership.fromJson(Map<String, dynamic> json) {
    return Membership(
      id: json['id']?.toString() ?? '',
      planId: json['planId']?.toString() ?? json['plan_id']?.toString() ?? '',
      planName: json['planName'] ?? json['plan_name'] ?? json['plan']?['name'] ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      status: json['status'] ?? 'pending',
      startDate: DateTime.tryParse(json['startDate'] ?? json['start_date'] ?? '') ?? DateTime.now(),
      endDate: DateTime.tryParse(json['endDate'] ?? json['end_date'] ?? '') ?? DateTime.now().add(const Duration(days: 365)),
      amountPaid: (json['amountPaid'] ?? json['amount_paid'] ?? 0).toDouble(),
      supportLimit: (json['supportLimit'] ?? json['support_limit'] ?? json['coverageAmount'] ?? 0).toDouble(),
      membershipNumber: json['membershipNumber'] ?? json['membership_number'],
      familyMembers: (json['familyMembers'] ?? json['family_members'] ?? [])
          .map<FamilyMember>((m) => FamilyMember.fromJson(m))
          .toList(),
      vehicleDetails: json['vehicleDetails'] ?? json['vehicle_details'],
      propertyDetails: json['propertyDetails'] ?? json['property_details'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isActive => status == 'active' && endDate.isAfter(DateTime.now());
  bool get isExpired => endDate.isBefore(DateTime.now());
  bool get isPending => status == 'pending';
  
  int get daysRemaining => endDate.difference(DateTime.now()).inDays;
  
  String get formattedSupportLimit => '₹${(supportLimit / 100000).toStringAsFixed(1)} Lakh';
}

class FamilyMember {
  final String id;
  final String name;
  final String relationship;
  final DateTime? dateOfBirth;
  final String? gender;

  FamilyMember({
    required this.id,
    required this.name,
    required this.relationship,
    this.dateOfBirth,
    this.gender,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      relationship: json['relationship'] ?? '',
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.tryParse(json['dateOfBirth']) 
          : null,
      gender: json['gender'],
    );
  }
}
