## Migration Plan: emailservice (Python/gRPC to TypeScript/HTTP)

This document outlines the plan to migrate the `emailservice` from a Python-based gRPC service to a TypeScript-based HTTP service.

### Milestone 1: Project Setup and Initial HTTP Server

1.  **Create a new directory structure:** Create a new `ts` directory inside `src/emailservice` to house the new TypeScript code.
2.  **Initialize a Node.js project:** Run `npm init -y` in the new directory.
3.  **Install dependencies:** Install `typescript`, `express`, `@types/express`, `@types/node`, `jest`, `ts-jest`, `@types/jest`.
4.  **Create `tsconfig.json`:** Configure the TypeScript compiler options.
5.  **Create a basic Express server:** Create a `src/index.ts` file with a minimal Express server.
6.  **Create a simple test:** Create a `src/index.test.ts` to ensure the test setup is working.
7.  **Update `.gitignore`:** Add `node_modules` and `dist` to the `.gitignore` file in the `src/emailservice` directory.

### Milestone 2: OpenAPI Spec and API Layer

1.  **Create OpenAPI Spec:** Convert the gRPC `EmailService` definition from `demo.proto` to an `openapi.yaml` file. This will define the HTTP API.
2.  **API Request Validation:** Implement middleware in Express to validate incoming requests against the `openapi.yaml` spec.
3.  **Implement API routes:** Create the `/send_order_confirmation` endpoint in the Express server.
4.  **Write API tests:** Write integration tests to verify the new endpoint, including validation and basic success/error responses.

### Milestone 3: Business Logic and Templating

1.  **Implement the email sending logic:**
    *   Create a `dummy` email provider that logs the email content, mimicking the original Python service's dummy mode.
    *   The logic will take the request body, render the HTML template, and use the dummy provider to "send" the email.
2.  **Port the Jinja2 template:** Convert the `confirmation.html` template to a compatible format if necessary (or use a Node.js-based Jinja2-like library).
3.  **Write unit tests:** Write unit tests for the email sending logic and templating.

### Milestone 4: Docker and Kubernetes

1.  **Update Dockerfile:** Create a new `Dockerfile` in the `src/emailservice` directory that builds the TypeScript application.
2.  **Update Kubernetes manifests:**
    *   Update the `emailservice.yaml` in `kubernetes-manifests` to use the new Docker image.
    *   Change the port from gRPC to HTTP (8080).
    *   Update the readiness and liveness probes to use HTTP endpoints.
    *   Update any other relevant Kubernetes configurations.

### Milestone 5: Final Touches and Cleanup

1.  **Add tracing and profiling:** Implement OpenTelemetry for tracing HTTP requests.
2.  **Remove old Python files:** Delete the Python-related files from the `src/emailservice` directory.
3.  **Review and refactor:** Clean up the code and ensure it follows project conventions.
