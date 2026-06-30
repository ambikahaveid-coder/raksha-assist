import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFE85D04);
  static const Color secondary = Color(0xFF1E3A5F);
  static const Color accent = Color(0xFF2563EB);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color textDark = Color(0xFF1F2937);
  static const Color textLight = Color(0xFF6B7280);
  static const Color background = Color(0xFFF9FAFB);
  static const Color cardBg = Colors.white;
  
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFE85D04), Color(0xFFF97316)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [Color(0xFF1E3A5F), Color(0xFF2563EB)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class ApiConfig {
  static const String baseUrl = 'https://rakshaassist.com';
  static const Duration timeout = Duration(seconds: 30);
  
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';
  static const String sendOtp = '/api/auth/send-otp';
  static const String verifyOtp = '/api/auth/verify-otp';
  static const String plans = '/api/plans';
  static const String memberships = '/api/memberships';
  static const String payments = '/api/payments';
  static const String sos = '/api/sos';
  static const String hospitals = '/api/hospitals';
  static const String profile = '/api/user/profile';
  static const String policiesAvailable = '/api/policies/available';
  static String policyContent(String type) => '/api/policies/$type';
  static String policyPdf(String type) => '/api/policies/$type/pdf';
}

class AppStrings {
  static const String appName = 'Raksha Assist';
  static const String tagline = 'Emergency Medical Assistance';
  static const String disclaimer = 'This is a membership-based assistance program, NOT insurance.';
  
  static const String loginTitle = 'Welcome Back';
  static const String registerTitle = 'Create Account';
  static const String otpTitle = 'Verify OTP';
  
  static const String phone = 'Phone Number';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String name = 'Full Name';
  
  static const String login = 'Login';
  static const String register = 'Register';
  static const String submit = 'Submit';
  static const String verify = 'Verify';
  static const String resendOtp = 'Resend OTP';
  
  static const String sos = 'SOS Emergency';
  static const String sosMessage = 'Tap to request immediate assistance';
  
  static const String supportPhone = '+91 81437 52025';
  static const String supportEmail = 'support@rakshaassist.com';
}

class AppAssets {
  static const String logo = 'assets/images/logo.png';
  static const String logoWhite = 'assets/images/logo_white.png';
  static const String placeholder = 'assets/images/placeholder.png';
  static const String emergency = 'assets/images/emergency.png';
  static const String ambulance = 'assets/images/ambulance.png';
}
