import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user can sign in and create a task', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('email-field')),
      'tester@example.test',
    );
    await tester.enterText(
      find.byKey(const Key('password-field')),
      'local-test-password',
    );
    await tester.tap(find.byKey(const Key('login-button')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('add-task-button')));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('task-title-field')),
      'Check release flow',
    );
    await tester.tap(find.byKey(const Key('save-task-button')));
    await tester.pumpAndSettle();

    expect(find.text('Check release flow'), findsOneWidget);

    // Practice exercise (Section 7): Extend the journey to mark the task complete, log out, and verify that the login screen appears.
    // 1. Mark task complete by tapping it
    await tester.tap(find.text('Check release flow'));
    await tester.pumpAndSettle();
    expect(find.text('Check release flow (Completed)'), findsOneWidget);

    // 2. Log out
    await tester.tap(find.byKey(const Key('logout-button')));
    await tester.pumpAndSettle();

    // 3. Verify that the login screen appears
    expect(find.byKey(const Key('login-button')), findsOneWidget);
    expect(find.byKey(const Key('email-field')), findsOneWidget);
  });
}

