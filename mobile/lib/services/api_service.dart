import 'dart:convert';
import 'package:http/http.dart' as http;
import '../task.dart';

class ApiService {
  ApiService({
    String? baseUrl,
    http.Client? httpClient,
  })  : baseUrl = baseUrl ?? 'http://127.0.0.1:3000',
        _client = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  String? accessToken;
  String? refreshToken;

  bool get isAuthenticated => accessToken != null;

  Future<bool> login(String email, String password) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/api/v1/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      accessToken = data['accessToken'] as String?;
      refreshToken = data['refreshToken'] as String?;
      return true;
    }
    return false;
  }

  Future<bool> register(String email, String password) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/api/v1/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      accessToken = data['accessToken'] as String?;
      refreshToken = data['refreshToken'] as String?;
      return true;
    }
    return false;
  }

  Future<List<Task>> fetchTasks() async {
    final response = await _client.get(
      Uri.parse('$baseUrl/api/v1/tasks'),
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> list = jsonDecode(response.body) as List<dynamic>;
      return list
          .map((item) => Task.fromJson(item as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load tasks: ${response.statusCode}');
    }
  }

  Future<Task> createTask(String title) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/api/v1/tasks'),
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode({'title': title}),
    );

    if (response.statusCode == 201) {
      return Task.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    } else {
      throw Exception('Failed to create task');
    }
  }

  Future<Task> updateTask(String id, {String? title, bool? isCompleted}) async {
    final body = <String, dynamic>{};
    if (title != null) body['title'] = title;
    if (isCompleted != null) body['isCompleted'] = isCompleted;

    final response = await _client.put(
      Uri.parse('$baseUrl/api/v1/tasks/$id'),
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return Task.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    } else {
      throw Exception('Failed to update task');
    }
  }

  Future<void> logout() async {
    if (refreshToken != null) {
      try {
        await _client.post(
          Uri.parse('$baseUrl/api/v1/auth/logout'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'refreshToken': refreshToken}),
        );
      } catch (_) {}
    }
    accessToken = null;
    refreshToken = null;
  }
}

