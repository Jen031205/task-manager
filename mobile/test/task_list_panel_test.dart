import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/task_list_panel.dart';

void main() {
  testWidgets('shows loading state', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TaskListPanel(loading: true, tasks: []),
      ),
    );
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('shows empty state', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TaskListPanel(loading: false, tasks: []),
      ),
    );
    expect(find.text('No tasks yet.'), findsOneWidget);
  });

  testWidgets('shows error state', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TaskListPanel(
          loading: false,
          tasks: [],
          errorMessage: 'Could not load tasks.',
        ),
      ),
    );
    expect(find.text('Could not load tasks.'), findsOneWidget);
  });

  testWidgets('shows task data', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TaskListPanel(loading: false, tasks: ['Plan tests']),
      ),
    );
    expect(find.text('Plan tests'), findsOneWidget);
  });

  // Practice exercise (Section 5): Add a retry button to the error state and test that tapping it invokes a callback exactly once.
  testWidgets('tapping retry button invokes callback exactly once', (tester) async {
    var retryCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: TaskListPanel(
          loading: false,
          tasks: const [],
          errorMessage: 'Could not load tasks.',
          onRetry: () {
            retryCount++;
          },
        ),
      ),
    );

    expect(find.byKey(const Key('retry-button')), findsOneWidget);

    await tester.tap(find.byKey(const Key('retry-button')));
    await tester.pump();

    expect(retryCount, 1);
  });
}

