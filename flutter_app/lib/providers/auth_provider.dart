import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  User? _user;
  AuthStatus _status = AuthStatus.initial;
  String? _error;
  bool _otpSent = false;
  String? _pendingPhone;
  String? _pendingEmail;

  User? get user => _user;
  AuthStatus get status => _status;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated && _user != null;
  bool get isLoading => _status == AuthStatus.loading;
  bool get otpSent => _otpSent;

  Future<void> checkAuthStatus() async {
    _status = AuthStatus.loading;
    notifyListeners();

    final response = await _api.get(ApiConfig.me);
    
    if (response.success && response.data != null) {
      _user = User.fromJson(response.data);
      _status = AuthStatus.authenticated;
    } else {
      _user = null;
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login({String? email, String? phone, required String password}) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    final body = <String, dynamic>{'password': password};
    if (email != null && email.isNotEmpty) body['email'] = email;
    if (phone != null && phone.isNotEmpty) body['phone'] = phone;

    final response = await _api.post(ApiConfig.login, body);
    
    if (response.success && response.data != null) {
      _user = User.fromJson(response.data['user'] ?? response.data);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } else {
      _error = response.error ?? 'Login failed';
      _status = AuthStatus.error;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    String? email,
    String? phone,
    required String password,
  }) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    final body = <String, dynamic>{
      'name': name,
      'password': password,
    };
    if (email != null && email.isNotEmpty) body['email'] = email;
    if (phone != null && phone.isNotEmpty) body['phone'] = phone;

    final response = await _api.post(ApiConfig.register, body);
    
    if (response.success && response.data != null) {
      _user = User.fromJson(response.data['user'] ?? response.data);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } else {
      _error = response.error ?? 'Registration failed';
      _status = AuthStatus.error;
      notifyListeners();
      return false;
    }
  }

  Future<bool> sendOtp({String? phone, String? email}) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    final body = <String, dynamic>{};
    if (phone != null && phone.isNotEmpty) {
      body['phone'] = phone;
      _pendingPhone = phone;
    }
    if (email != null && email.isNotEmpty) {
      body['email'] = email;
      _pendingEmail = email;
    }

    final response = await _api.post(ApiConfig.sendOtp, body);
    
    if (response.success) {
      _otpSent = true;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return true;
    } else {
      _error = response.error ?? 'Failed to send OTP';
      _status = AuthStatus.error;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOtp(String otp) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    final body = <String, dynamic>{'otp': otp};
    if (_pendingPhone != null) body['phone'] = _pendingPhone;
    if (_pendingEmail != null) body['email'] = _pendingEmail;

    final response = await _api.post(ApiConfig.verifyOtp, body);
    
    if (response.success && response.data != null) {
      _user = User.fromJson(response.data['user'] ?? response.data);
      _status = AuthStatus.authenticated;
      _otpSent = false;
      _pendingPhone = null;
      _pendingEmail = null;
      notifyListeners();
      return true;
    } else {
      _error = response.error ?? 'Invalid OTP';
      _status = AuthStatus.error;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _api.post(ApiConfig.logout, {});
    await _api.clearSession();
    _user = null;
    _status = AuthStatus.unauthenticated;
    _otpSent = false;
    _pendingPhone = null;
    _pendingEmail = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    if (_status == AuthStatus.error) {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }
}
