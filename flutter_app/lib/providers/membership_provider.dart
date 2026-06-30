import 'package:flutter/foundation.dart';
import '../models/membership_model.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class MembershipProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<Membership> _memberships = [];
  Membership? _activeMembership;
  bool _isLoading = false;
  String? _error;

  List<Membership> get memberships => _memberships;
  Membership? get activeMembership => _activeMembership;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMembership => _activeMembership != null;

  Future<void> fetchMemberships() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _api.get(ApiConfig.memberships);
    
    if (response.success && response.data != null) {
      final List<dynamic> data = response.data is List ? response.data : response.data['memberships'] ?? [];
      _memberships = data.map((json) => Membership.fromJson(json)).toList();
      
      _activeMembership = _memberships.where((m) => m.isActive).firstOrNull;
    } else {
      _error = response.error ?? 'Failed to load memberships';
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createMembership({
    required String planId,
    List<Map<String, dynamic>>? familyMembers,
    Map<String, dynamic>? vehicleDetails,
    Map<String, dynamic>? propertyDetails,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final body = <String, dynamic>{'planId': planId};
    if (familyMembers != null) body['familyMembers'] = familyMembers;
    if (vehicleDetails != null) body['vehicleDetails'] = vehicleDetails;
    if (propertyDetails != null) body['propertyDetails'] = propertyDetails;

    final response = await _api.post(ApiConfig.memberships, body);
    
    _isLoading = false;
    
    if (response.success) {
      await fetchMemberships();
      notifyListeners();
      return true;
    } else {
      _error = response.error ?? 'Failed to create membership';
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> initiatePayment(String membershipId) async {
    final response = await _api.post('${ApiConfig.payments}/initiate', {
      'membershipId': membershipId,
    });
    
    if (response.success && response.data != null) {
      return response.data as Map<String, dynamic>;
    }
    return null;
  }

  Future<bool> verifyPayment({
    required String paymentId,
    required String orderId,
    required String signature,
  }) async {
    final response = await _api.post('${ApiConfig.payments}/verify', {
      'razorpay_payment_id': paymentId,
      'razorpay_order_id': orderId,
      'razorpay_signature': signature,
    });
    
    if (response.success) {
      await fetchMemberships();
      return true;
    }
    return false;
  }

  void clear() {
    _memberships = [];
    _activeMembership = null;
    _error = null;
    notifyListeners();
  }

  Future<void> refresh() async {
    _memberships = [];
    _activeMembership = null;
    await fetchMemberships();
  }
}
