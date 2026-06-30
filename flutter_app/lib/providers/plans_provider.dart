import 'package:flutter/foundation.dart';
import '../models/plan_model.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class PlansProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<Plan> _plans = [];
  bool _isLoading = false;
  String? _error;
  String _selectedCategory = 'all';

  List<Plan> get plans => _plans;
  List<Plan> get filteredPlans {
    if (_selectedCategory == 'all') return _plans;
    return _plans.where((p) => p.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
  }
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get selectedCategory => _selectedCategory;

  List<String> get categories {
    final cats = _plans.map((p) => p.category).toSet().toList();
    cats.sort();
    return ['all', ...cats];
  }

  Map<String, List<Plan>> get plansByCategory {
    final map = <String, List<Plan>>{};
    for (final plan in _plans) {
      if (!map.containsKey(plan.category)) {
        map[plan.category] = [];
      }
      map[plan.category]!.add(plan);
    }
    return map;
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  Future<void> fetchPlans() async {
    if (_plans.isNotEmpty) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _api.get(ApiConfig.plans);
    
    if (response.success && response.data != null) {
      final List<dynamic> data = response.data is List ? response.data : response.data['plans'] ?? [];
      _plans = data.map((json) => Plan.fromJson(json)).toList();
      _plans.sort((a, b) => a.price.compareTo(b.price));
    } else {
      _error = response.error ?? 'Failed to load plans';
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Plan? getPlanById(String id) {
    try {
      return _plans.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<void> refresh() async {
    _plans = [];
    await fetchPlans();
  }
}
