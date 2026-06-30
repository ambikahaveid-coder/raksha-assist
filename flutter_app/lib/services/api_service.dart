import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _sessionCookie;

  Future<void> _loadSession() async {
    _sessionCookie = await _storage.read(key: 'session_cookie');
  }

  Future<void> _saveSession(String cookie) async {
    _sessionCookie = cookie;
    await _storage.write(key: 'session_cookie', value: cookie);
  }

  Future<void> clearSession() async {
    _sessionCookie = null;
    await _storage.delete(key: 'session_cookie');
  }

  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_sessionCookie != null) {
      headers['Cookie'] = _sessionCookie!;
    }
    return headers;
  }

  Future<ApiResponse> get(String endpoint) async {
    await _loadSession();
    try {
      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}$endpoint'),
            headers: _headers,
          )
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      return ApiResponse(success: false, error: 'No internet connection');
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> post(String endpoint, Map<String, dynamic> body) async {
    await _loadSession();
    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}$endpoint'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.timeout);
      
      final setCookie = response.headers['set-cookie'];
      if (setCookie != null) {
        await _saveSession(setCookie);
      }
      
      return _handleResponse(response);
    } on SocketException {
      return ApiResponse(success: false, error: 'No internet connection');
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> put(String endpoint, Map<String, dynamic> body) async {
    await _loadSession();
    try {
      final response = await http
          .put(
            Uri.parse('${ApiConfig.baseUrl}$endpoint'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      return ApiResponse(success: false, error: 'No internet connection');
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> delete(String endpoint) async {
    await _loadSession();
    try {
      final response = await http
          .delete(
            Uri.parse('${ApiConfig.baseUrl}$endpoint'),
            headers: _headers,
          )
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      return ApiResponse(success: false, error: 'No internet connection');
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  ApiResponse _handleResponse(http.Response response) {
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse(success: true, data: body);
    } else if (response.statusCode == 401) {
      return ApiResponse(success: false, error: 'Session expired. Please login again.', statusCode: 401);
    } else {
      final error = body is Map ? body['message'] ?? body['error'] ?? 'Request failed' : 'Request failed';
      return ApiResponse(success: false, error: error, statusCode: response.statusCode);
    }
  }
}

class ApiResponse {
  final bool success;
  final dynamic data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.statusCode,
  });
}
