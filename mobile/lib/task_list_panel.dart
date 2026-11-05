import 'package:flutter/material.dart';

/// Shows tasks or the current loading, empty, or error state.
class TaskListPanel extends StatelessWidget {
  /// Creates a task list panel.
  const TaskListPanel({
    super.key,
    required this.loading,
    required this.tasks,
    this.errorMessage,
    this.onRetry,
    this.onToggleTask,
  });

  /// Whether tasks are being loaded.
  final bool loading;

  /// Task titles to display.
  final List<String> tasks;

  /// Optional safe error message.
  final String? errorMessage;

  /// Callback when the retry button is tapped.
  final VoidCallback? onRetry;

  /// Optional callback when a task status is toggled.
  final void Function(int index)? onToggleTask;

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(errorMessage!),
              if (onRetry != null) ...[
                const SizedBox(height: 12),
                ElevatedButton(
                  key: const Key('retry-button'),
                  onPressed: onRetry,
                  child: const Text('Retry'),
                ),
              ],
            ],
          ),
        ),
      );
    }

    if (tasks.isEmpty) {
      return const Center(child: Text('No tasks yet.'));
    }

    return Material(
      child: ListView(
        children: [
          for (int i = 0; i < tasks.length; i++)
            ListTile(
              title: Text(tasks[i]),
              onTap: onToggleTask != null ? () => onToggleTask!(i) : null,
            ),
        ],
      ),
    );
  }
}
