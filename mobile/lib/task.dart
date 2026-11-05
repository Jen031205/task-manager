/// Converts a JSON object into a task value.
class Task {
  /// Creates a task.
  const Task({
    required this.id,
    required this.title,
    this.isCompleted = false,
  });

  /// Unique server identifier.
  final String id;

  /// User-visible task title.
  final String title;

  /// Completion status.
  final bool isCompleted;

  /// Parses a task from JSON.
  ///
  /// Throws [FormatException] when required fields are missing or invalid.
  factory Task.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final title = json['title'];
    final isCompleted = json['isCompleted'] ?? false;

    if (id is! String || title is! String || title.trim().isEmpty) {
      throw const FormatException('Invalid task data.');
    }

    return Task(
      id: id,
      title: title,
      isCompleted: isCompleted is bool ? isCompleted : false,
    );
  }

  /// Converts task instance to JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'isCompleted': isCompleted,
    };
  }
}

