import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class PolicyDocumentsScreen extends StatefulWidget {
  final String? initialType;

  const PolicyDocumentsScreen({super.key, this.initialType});

  @override
  State<PolicyDocumentsScreen> createState() => _PolicyDocumentsScreenState();
}

class _PolicyDocumentsScreenState extends State<PolicyDocumentsScreen> {
  List<PolicyDoc> _policies = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchPolicies();
  }

  Future<void> _fetchPolicies() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final api = ApiService();
    final response = await api.get(ApiConfig.policiesAvailable);

    if (response.success && response.data != null) {
      final list = response.data as List;
      setState(() {
        _policies = list.map((p) => PolicyDoc.fromJson(p)).toList();
        _isLoading = false;
      });

      if (widget.initialType != null) {
        final matches = _policies.where((p) => p.type == widget.initialType);
        if (matches.isNotEmpty && mounted) {
          _openDocument(matches.first);
        }
      }
    } else {
      setState(() {
        _isLoading = false;
        _policies = PolicyDoc.defaults();
      });
    }
  }

  void _openDocument(PolicyDoc doc) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PolicyContentScreen(policy: doc),
      ),
    );
  }

  Future<void> _downloadPdf(PolicyDoc doc) async {
    final url = '${ApiConfig.baseUrl}${ApiConfig.policyPdf(doc.type)}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open PDF. Please try again.')),
        );
      }
    }
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'plan_terms':
        return Icons.description;
      case 'addon_terms':
        return Icons.add_circle;
      case 'membership_agreement':
        return Icons.handshake;
      case 'refund_policy':
        return Icons.currency_rupee;
      case 'sla':
        return Icons.speed;
      case 'agent_terms':
        return Icons.person_pin;
      case 'franchise_terms':
        return Icons.store;
      default:
        return Icons.article;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'plan_terms':
        return AppColors.primary;
      case 'addon_terms':
        return AppColors.accent;
      case 'membership_agreement':
        return AppColors.secondary;
      case 'refund_policy':
        return AppColors.success;
      case 'sla':
        return Colors.purple;
      case 'agent_terms':
        return Colors.teal;
      case 'franchise_terms':
        return Colors.indigo;
      default:
        return AppColors.textLight;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Documents'),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text(_error!, style: TextStyle(color: Colors.grey.shade600)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchPolicies,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchPolicies,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.folder_open, color: Colors.white, size: 32),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Membership Documents',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'View or download all documents',
                                    style: TextStyle(color: Colors.white70, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      ..._policies.map((doc) => _buildDocumentCard(doc)),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDocumentCard(PolicyDoc doc) {
    final color = _colorForType(doc.type);
    final icon = _iconForType(doc.type);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _openDocument(doc),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doc.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Version ${doc.version}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.download_rounded, color: color),
                  tooltip: 'Download PDF',
                  onPressed: () => _downloadPdf(doc),
                ),
                Icon(Icons.chevron_right, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class PolicyContentScreen extends StatefulWidget {
  final PolicyDoc policy;

  const PolicyContentScreen({super.key, required this.policy});

  @override
  State<PolicyContentScreen> createState() => _PolicyContentScreenState();
}

class _PolicyContentScreenState extends State<PolicyContentScreen> {
  String? _content;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchContent();
  }

  Future<void> _fetchContent() async {
    final api = ApiService();
    final response = await api.get(ApiConfig.policyContent(widget.policy.type));

    if (response.success && response.data != null) {
      setState(() {
        _content = response.data['content'] ?? 'No content available.';
        _isLoading = false;
      });
    } else {
      setState(() {
        _content = 'Unable to load document. Please try again later.';
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadPdf() async {
    final url = '${ApiConfig.baseUrl}${ApiConfig.policyPdf(widget.policy.type)}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open PDF.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.policy.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            tooltip: 'Download PDF',
            onPressed: _downloadPdf,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            '${widget.policy.title} • Version ${widget.policy.version}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildMarkdownContent(_content ?? ''),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _downloadPdf,
                      icon: const Icon(Icons.download),
                      label: const Text('Download PDF'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
    );
  }

  Widget _buildMarkdownContent(String content) {
    final lines = content.split('\n');
    List<Widget> widgets = [];

    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.isEmpty) {
        widgets.add(const SizedBox(height: 8));
        continue;
      }

      if (trimmed.startsWith('# ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 16, bottom: 8),
          child: Text(
            trimmed.substring(2),
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppColors.secondary,
            ),
          ),
        ));
      } else if (trimmed.startsWith('## ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 14, bottom: 6),
          child: Text(
            trimmed.substring(3),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
        ));
      } else if (trimmed.startsWith('### ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 4),
          child: Text(
            trimmed.substring(4),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textDark,
            ),
          ),
        ));
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        final bulletText = trimmed.substring(2);
        widgets.add(Padding(
          padding: const EdgeInsets.only(left: 12, top: 2, bottom: 2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('•  ', style: TextStyle(fontSize: 14, color: AppColors.primary)),
              Expanded(child: _buildRichText(bulletText)),
            ],
          ),
        ));
      } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        widgets.add(_buildTableRow(trimmed));
      } else {
        widgets.add(Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: _buildRichText(trimmed),
        ));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: widgets,
    );
  }

  Widget _buildRichText(String text) {
    final parts = <InlineSpan>[];
    final regex = RegExp(r'\*\*(.+?)\*\*');
    int lastEnd = 0;

    for (final match in regex.allMatches(text)) {
      if (match.start > lastEnd) {
        parts.add(TextSpan(
          text: text.substring(lastEnd, match.start),
          style: const TextStyle(fontSize: 14, color: AppColors.textDark, height: 1.5),
        ));
      }
      parts.add(TextSpan(
        text: match.group(1),
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textDark, height: 1.5),
      ));
      lastEnd = match.end;
    }

    if (lastEnd < text.length) {
      parts.add(TextSpan(
        text: text.substring(lastEnd),
        style: const TextStyle(fontSize: 14, color: AppColors.textDark, height: 1.5),
      ));
    }

    return RichText(text: TextSpan(children: parts));
  }

  Widget _buildTableRow(String row) {
    final cells = row.split('|').where((c) => c.trim().isNotEmpty).toList();
    final isSeparator = cells.every((c) => c.trim().startsWith('-'));

    if (isSeparator) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: cells.map((cell) {
          return Expanded(
            child: Text(
              cell.trim(),
              style: const TextStyle(fontSize: 12, height: 1.4),
              textAlign: TextAlign.left,
            ),
          );
        }).toList(),
      ),
    );
  }
}

class PolicyDoc {
  final String type;
  final String title;
  final String version;
  final String downloadUrl;

  PolicyDoc({
    required this.type,
    required this.title,
    required this.version,
    required this.downloadUrl,
  });

  factory PolicyDoc.fromJson(Map<String, dynamic> json) {
    return PolicyDoc(
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      version: json['version'] ?? '1.0',
      downloadUrl: json['downloadUrl'] ?? '',
    );
  }

  static List<PolicyDoc> defaults() {
    return [
      PolicyDoc(type: 'plan_terms', title: 'Plan Terms & Conditions', version: '2.0', downloadUrl: ''),
      PolicyDoc(type: 'addon_terms', title: 'Add-On Benefits Terms', version: '3.0', downloadUrl: ''),
      PolicyDoc(type: 'membership_agreement', title: 'Membership Agreement', version: '2.0', downloadUrl: ''),
      PolicyDoc(type: 'refund_policy', title: 'Refund & Cancellation Policy', version: '3.0', downloadUrl: ''),
    ];
  }
}
