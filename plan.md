# Migration Plan: Payment Service (JavaScript/gRPC to TypeScript/HTTP)

This document outlines the plan to migrate the `paymentservice` from a JavaScript-based gRPC service to a TypeScript-based HTTP/Express service.

## Milestone 1: Project Setup & API Definition

1.  **Create New Directory:** Create a new directory `src/paymentservice-ts` to house the new TypeScript service, keeping the original service intact during development.
2.  **Initialize `package.json`:**
    *   Create a `package.json` file.
    *   Set the node engine to `22.x`.
    *   Add and pin the following dependencies:
        *   `express`, `axios`, `pino`, `uuid`, `simple-card-validator`
        *   `typescript`, `ts-node`, `jest`, `ts-jest`, `supertest`
        *   `@types/node`, `@types/express`, `@types/jest`, etc.
3.  **Create `tsconfig.json`:** Configure TypeScript with modern settings (`target: "ES2022"`, `module: "NodeNext"`, `strict: true`, etc.) and an output directory (e.g., `dist`).
4.  **Define API with OpenAPI:**
    *   Create an `openapi.yaml` file inside `src/paymentservice-ts`.
    *   Define a `/charge` endpoint (POST) based on the gRPC `Charge` method.
    *   Define a `/healthz` endpoint (GET) for health checks.
5.  **Create Directory Structure:** Set up the basic source and test directories:
    *   `src/paymentservice-ts/src/`
    *   `src/paymentservice-ts/tests/`

## Milestone 2: TDD - API Server & Tests

1.  **Write API Server Tests (`tests/api.test.ts`):**
    *   Write a test to ensure the Express server starts.
    *   Write a test for the `/healthz` endpoint to ensure it returns a `200 OK` status.
    *   Write tests for the `/charge` endpoint:
        *   A test for a successful request (valid payload) that should return `200 OK`.
        *   A test for a request with a missing/invalid payload that should return `400 Bad Request`.
2.  **Implement Basic API Server (`src/index.ts`):**
    *   Create a basic Express server.
    *   Implement the `/healthz` endpoint.
    *   Implement a placeholder `/charge` endpoint that returns the expected success/error codes to make the tests pass.

## Milestone 3: TDD - Business Logic & Tests

1.  **Write Business Logic Tests (`tests/charge.test.ts`):**
    *   Replicate the business logic tests based on the original `charge.js` functionality.
    *   Test for a successful payment charge.
    *   Test for an invalid credit card number, throwing a specific error.
    *   Test for an unaccepted credit card type (e.g., not VISA or MasterCard), throwing a specific error.
    *   Test for an expired credit card, throwing a specific error.
2.  **Implement Business Logic (`src/charge.ts`):**
    *   Migrate the payment processing logic from `src/paymentservice/charge.js` to TypeScript.
    *   Define TypeScript types/interfaces for the `ChargeRequest` and `ChargeResponse`.
    *   Implement the validation and charge logic to make the tests pass.

## Milestone 4: Final Implementation & Integration

1.  **Integrate Logic with API:**
    *   In `src/index.ts`, replace the placeholder `/charge` handler with the actual business logic from `src/charge.ts`.
    *   Add proper error handling to catch errors from the business logic and return appropriate HTTP status codes (e.g., 400 for card errors).
2.  **Add Logging:**
    *   Integrate `pino` for structured logging, mimicking the format of the original service.
3.  **Manual Verification:**
    *   Run the server locally.
    *   Use `curl` to send test requests to the `/charge` and `/healthz` endpoints to confirm functionality.

## Milestone 5: Containerization & Deployment Artifacts

1.  **Create `Dockerfile`:**
    *   Create a new, multi-stage `Dockerfile` in `src/paymentservice-ts`.
    *   The `builder` stage will install dependencies and compile the TypeScript code.
    *   The final stage will be a lean image (e.g., `node:22-alpine`) containing only the compiled JavaScript and production `node_modules`.
2.  **Update Kubernetes Manifests:**
    *   Copy `kubernetes-manifests/paymentservice.yaml` to `kubernetes-manifests/paymentservice-ts.yaml`.
    *   In the new file, update the following:
        *   `metadata.name` and `spec.selector.matchLabels.app` to `paymentservice-ts`.
        *   `spec.template.spec.containers[0].image` to the new image name (e.g., `paymentservice-ts`).
        *   Change `containerPort` to the new HTTP port (e.g., 8080).
        *   Replace `readinessProbe` and `livenessProbe` from `grpc` to `httpGet`, pointing to the `/healthz` path on the new port.
    *   In the `Service` definition, update the port to expose the new HTTP port.
3.  **Update Kustomize:**
    *   Add `paymentservice-ts.yaml` to the appropriate `kustomization.yaml` file(s), replacing the old `paymentservice.yaml`.
4.  **Update Skaffold:**
    *   In `skaffold.yaml`, add a new build artifact for `paymentservice-ts` pointing to the new `Dockerfile`.
    *   Update the `manifests` section to deploy the new `paymentservice-ts.yaml`.
