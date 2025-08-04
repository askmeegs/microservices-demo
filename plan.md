# Migration Plan: Go gRPC Checkout Service to TypeScript HTTP

This document outlines the plan to migrate the `checkoutservice` from a Go gRPC implementation to a TypeScript HTTP/JSON service.

## 1. Project Setup

*   **Create a new directory:** `src/checkoutservice-ts`.
*   **Initialize a new Node.js project:** `npm init -y`.
*   **Create `package.json` with pinned dependencies:**
    *   `"node": "22.x"` in `engines`
    *   `"typescript": "5.8.3"`
    *   `"jest": "29.7.0"`
    *   `"@types/jest": "29.5.12"`
    *   `"ts-jest": "29.2.3"`
    *   `"express": "4.19.2"`
    *   `"@types/express": "4.17.21"`
    *   `"axios": "1.7.2"`
    *   `"@types/node": "22.0.0"`
    *   `"openapi-types": "12.1.3"`
    *   `"swagger-ui-express": "4.6.3"`
    *   `"@types/swagger-ui-express": "4.1.6"`
    *   `"yamljs": "0.3.0"`
    *   `"@types/yamljs": "0.2.34"`
*   **Create `tsconfig.json`:** Configure the TypeScript compiler.
*   **Create `jest.config.js`:** Configure the Jest testing framework.

**Approval gate:** I will stop here and ask for approval before proceeding.

## 2. API Definition and Testing

*   **Convert Proto to OpenAPI:** Create an `openapi.yaml` file that defines the HTTP API for the checkout service. This will be based on the existing gRPC definition in `demo.proto`.
*   **Write API Server Tests:** Create `src/checkoutservice-ts/src/index.test.ts` with tests for the API endpoints defined in `openapi.yaml`. These tests will initially fail.

**Approval gate:** I will stop here and ask for approval before proceeding.

## 3. HTTP Server and Business Logic Implementation

*   **Implement Express Server:** Create `src/checkoutservice-ts/src/index.ts` with a basic Express server.
*   **Implement Business Logic:** Implement the `placeOrder` logic from the Go service in TypeScript. This will involve making HTTP requests to the other services using `axios`.
*   **Make Tests Pass:** Implement the code required to make the tests in `index.test.ts` pass.

**Approval gate:** I will stop here and ask for approval before proceeding.

## 4. Docker and Kubernetes Configuration

*   **Update Dockerfile:** Create a new `Dockerfile` in `src/checkoutservice-ts` to build the TypeScript application.
*   **Update Kubernetes Manifests:**
    *   Update the `checkoutservice.yaml` in `kubernetes-manifests` to use the new Docker image and port.
    *   Update the `readinessProbe` and `livenessProbe` to use HTTP endpoints.
    *   Update the `Service` to expose the new HTTP port.
    *   Repeat for `kustomize` and `helm-chart` directories.

**Approval gate:** I will stop here and ask for approval before proceeding.

## 5. Finalization

*   **Remove old service:** Delete the `src/checkoutservice` directory.
*   **Rename new service:** Rename `src/checkoutservice-ts` to `src/checkoutservice`.
*   **Run all tests:** Ensure all tests for the entire application still pass.

**Approval gate:** I will stop here and ask for approval before proceeding.
