# Raksha Assist - Flutter Mobile App

Emergency Medical Assistance Platform - Native Android & iOS App

## Features

- **User Authentication**: Login/Register with Phone/Email + OTP
- **31 Membership Plans**: Individual, Family, Senior, Maternity, Vehicle, Property, Business, Student, Travel, Group
- **SOS Emergency**: One-tap emergency assistance with location
- **Membership Dashboard**: View active membership, card, history
- **Payment Integration**: Razorpay payment gateway
- **Push Notifications**: Emergency alerts and reminders
- **Profile Management**: Edit profile, change password

## Tech Stack

- **Framework**: Flutter 3.x
- **State Management**: Provider
- **HTTP Client**: http package
- **Storage**: flutter_secure_storage, shared_preferences
- **Payments**: razorpay_flutter
- **Location**: geolocator
- **Notifications**: firebase_messaging, flutter_local_notifications

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── user_model.dart
│   ├── plan_model.dart
│   └── membership_model.dart
├── providers/                # State management
│   ├── auth_provider.dart
│   ├── plans_provider.dart
│   └── membership_provider.dart
├── screens/                  # UI screens
│   ├── splash_screen.dart
│   ├── auth/
│   ├── home/
│   ├── plans/
│   ├── dashboard/
│   ├── sos/
│   └── profile/
├── services/                 # API services
│   └── api_service.dart
├── utils/                    # Constants & utilities
│   └── constants.dart
└── widgets/                  # Reusable widgets
    ├── custom_button.dart
    └── custom_text_field.dart
```

## Setup Instructions

### Prerequisites

1. **Flutter SDK**: Install Flutter 3.x from [flutter.dev](https://flutter.dev)
2. **Android Studio** or **VS Code** with Flutter extension
3. **Xcode** (for iOS development on Mac)

### Local Development

```bash
# Clone and navigate to flutter_app directory
cd flutter_app

# Get dependencies
flutter pub get

# Run on connected device/emulator
flutter run
```

### Build APK (Android)

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle for Play Store
flutter build appbundle --release
```

### Build IPA (iOS)

```bash
# Debug build
flutter build ios --debug

# Release build
flutter build ios --release

# Archive for App Store
flutter build ipa --release
```

## Cloud Build with Codemagic

For automated builds without local setup, use [Codemagic](https://codemagic.io):

1. Connect your repository to Codemagic
2. Add `codemagic.yaml` configuration
3. Set up signing credentials
4. Build and distribute automatically

### codemagic.yaml

```yaml
workflows:
  android-workflow:
    name: Android Build
    instance_type: mac_mini_m1
    environment:
      flutter: stable
    scripts:
      - flutter packages pub get
      - flutter build apk --release
    artifacts:
      - build/app/outputs/flutter-apk/**/*.apk

  ios-workflow:
    name: iOS Build
    instance_type: mac_mini_m1
    environment:
      flutter: stable
      xcode: latest
    scripts:
      - flutter packages pub get
      - flutter build ios --release --no-codesign
    artifacts:
      - build/ios/ipa/*.ipa
```

## Store Submission

### Google Play Store

1. Create Google Play Console account (₹1,750 one-time)
2. Create new app in Console
3. Upload AAB file from `build/app/outputs/bundle/release/`
4. Fill app details, screenshots, privacy policy
5. Submit for review (3-7 days)

### Apple App Store

1. Create Apple Developer account ($99/year ≈ ₹8,300)
2. Create app in App Store Connect
3. Upload IPA via Xcode or Transporter
4. Fill app details, screenshots, privacy policy
5. Submit for review (1-3 days)

## API Configuration

Update `lib/utils/constants.dart` with your backend URL:

```dart
class ApiConfig {
  static const String baseUrl = 'https://rakshaassist.com';
  // ... other endpoints
}
```

## Environment Variables

For production builds, set these environment variables:

- `RAZORPAY_KEY_ID`: Razorpay API key
- `ANDROID_KEYSTORE_FILE`: Path to release keystore
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password

## Support

- **Phone**: +91 81437 52025
- **Email**: support@rakshaassist.com
- **Website**: https://rakshaassist.com

## Legal Notice

This is a membership-based emergency assistance and coordination platform. This is NOT an insurance product or TPA service.

---

Built with ❤️ for Raksha Assist
