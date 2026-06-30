import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../auth/login_screen.dart';
import '../documents/policy_documents_screen.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          final user = authProvider.user;
          
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildProfileHeader(context, user),
                const SizedBox(height: 24),
                _buildProfileOptions(context, authProvider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, dynamic user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.secondaryGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                user?.displayName.substring(0, 1).toUpperCase() ?? 'U',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.displayName ?? 'User',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                if (user?.phone != null)
                  Text(
                    '+91 ${user.phone}',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                if (user?.email != null)
                  Text(
                    user.email,
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildProfileOptions(BuildContext context, AuthProvider authProvider) {
    return Column(
      children: [
        _OptionSection(
          title: 'Account',
          options: [
            _OptionItem(
              icon: Icons.person_outline,
              title: 'Edit Profile',
              onTap: () {},
            ),
            _OptionItem(
              icon: Icons.lock_outline,
              title: 'Change Password',
              onTap: () {},
            ),
            _OptionItem(
              icon: Icons.notifications_outlined,
              title: 'Notifications',
              onTap: () {},
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        _OptionSection(
          title: 'Support',
          options: [
            _OptionItem(
              icon: Icons.phone_outlined,
              title: 'Call Support',
              subtitle: AppStrings.supportPhone,
              onTap: () => launchUrl(Uri.parse('tel:${AppStrings.supportPhone}')),
            ),
            _OptionItem(
              icon: Icons.email_outlined,
              title: 'Email Support',
              subtitle: AppStrings.supportEmail,
              onTap: () => launchUrl(Uri.parse('mailto:${AppStrings.supportEmail}')),
            ),
            _OptionItem(
              icon: Icons.help_outline,
              title: 'FAQs',
              onTap: () {},
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        _OptionSection(
          title: 'Legal & Documents',
          options: [
            _OptionItem(
              icon: Icons.folder_open,
              title: 'All Documents',
              subtitle: 'View & download all membership documents',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PolicyDocumentsScreen()),
                );
              },
            ),
            _OptionItem(
              icon: Icons.description_outlined,
              title: 'Plan Terms & Conditions',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PolicyDocumentsScreen(initialType: 'plan_terms')),
                );
              },
            ),
            _OptionItem(
              icon: Icons.handshake_outlined,
              title: 'Membership Agreement',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PolicyDocumentsScreen(initialType: 'membership_agreement')),
                );
              },
            ),
            _OptionItem(
              icon: Icons.currency_rupee,
              title: 'Refund & Cancellation',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PolicyDocumentsScreen(initialType: 'refund_policy')),
                );
              },
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.logout, color: AppColors.error),
            label: const Text('Logout', style: TextStyle(color: AppColors.error)),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: AppColors.error),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: 24),
        
        Text(
          'Version 1.0.0',
          style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
        ),
        
        const SizedBox(height: 8),
        
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.warning.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            AppStrings.disclaimer,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              color: AppColors.warning.withOpacity(0.8),
            ),
          ),
        ),
      ],
    );
  }
}

class _OptionSection extends StatelessWidget {
  final String title;
  final List<_OptionItem> options;

  const _OptionSection({required this.title, required this.options});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textLight,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: options.map((option) {
              final isLast = option == options.last;
              return Column(
                children: [
                  ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(option.icon, color: AppColors.primary, size: 20),
                    ),
                    title: Text(option.title),
                    subtitle: option.subtitle != null ? Text(option.subtitle!, style: const TextStyle(fontSize: 12)) : null,
                    trailing: const Icon(Icons.chevron_right, color: AppColors.textLight),
                    onTap: option.onTap,
                  ),
                  if (!isLast)
                    Divider(height: 1, indent: 70, color: Colors.grey.shade100),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _OptionItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _OptionItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
