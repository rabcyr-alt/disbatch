# DisbatchUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27.

## NOTE

This Angular redesign of the Disbatch Command Interface was designed and directed by me, and implemented with Claude
Code. For out-of-the-box features, it is complete and improved. The `web_extensions` feature works with no changes
for basic JSON routes and has been tested. However, `template`, `parse_accept`, and `want_json` have been removed from `Disbatch::Web`.
If your code requires them, see `Disbatch::Web::ExtensionTest` to copy, and it should work but has not yet been tested.
More consideration is needed on this before this redesign is released.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
