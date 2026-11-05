import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/task.dart';

void main() {
  test('parses a valid task', () {
    final task = Task.fromJson({'id': 'task-1', 'title': 'Plan tests'});
    expect(task.id, 'task-1');
    expect(task.title, 'Plan tests');
  });

  test('rejects an empty title', () {
    expect(
      () => Task.fromJson({'id': 'task-1', 'title': ' '}),
      throwsFormatException,
    );
  });

  // Practice exercise (Section 4): Add a unit test for a missing ID and one for a valid title at the maximum allowed length.
  test('rejects a missing ID', () {
    expect(
      () => Task.fromJson({'title': 'Plan tests'}),
      throwsFormatException,
    );
  });

  test('accepts a valid title at the maximum allowed length', () {
    final maxTitle = 'a' * 120;
    final task = Task.fromJson({'id': 'task-1', 'title': maxTitle});
    expect(task.title, maxTitle);
  });
}

