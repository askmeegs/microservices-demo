# Migration Plan: Frontend (Go/gRPC to TypeScript/HTTP)

This document outlines the plan to migrate the `frontend` service from a Go/gRPC implementation to a TypeScript/HTTP (Express) implementation. The new service will be developed in the `src/frontend-ts` directory.

## Milestone 1: Project Setup & API Definition

1.  **Create New Project Structure:**
    *   Create a new directory `src/frontend-ts`.
    *   Inside `src/frontend-ts`, create a new directory structure: `src/`, `tests/`.
    *   Create `src/frontend-ts/src/index.ts` as the main entry point.

2.  **Initialize Node.js Project:**
    *   Create a `package.json` file in `src/frontend-ts` with the following pinned dependencies:
        *   `"express": "4.19.2"`
        *   `"axios": "1.7.2"`
        *   `"@types/express": "4.17.21"`
        *   `"@types/jest": "29.5.12"`
        *   `"@types/node": "22.15.0"`
        *   `"jest": "29.7.0"`
        *   `"ts-jest": "29.1.2"`
        *   `"typescript": "5.8.3"`
        *   `"supertest": "7.0.0"`
        *   `"nodemon": "3.1.10"`
        *   `"ts-node": "10.9.2"`
    *   Set the `engines` field to `"node": "22.x"`.
    *   Add `start`, `build`, `test`, and `dev` scripts.

3.  **Configure TypeScript & Jest:**
    *   Create a `tsconfig.json` file in `src/frontend-ts`.
    *   Create a `jest.config.js` file in `src/frontend-ts`.

4.  **Define the HTTP API with OpenAPI:**
    *   Create an `openapi.yaml` file in `src/frontend-ts`.
    *   Translate the gRPC services used by the frontend (from `protos/demo.proto`) into HTTP RESTful endpoints. The frontend service acts as a client to many backend services, but it also has its own server that serves the web pages. The OpenAPI spec will define the API that the frontend *exposes* to the outside world (e.g., for health checks, and potentially for the shopping assistant). The primary function of the frontend is to serve HTML pages, which will be the main routes.

5.  **Write Initial API Tests:**
    *   Create `src/frontend-ts/tests/api.test.ts`.
    *   Write initial Jest/Supertest tests for the core API endpoints defined in `openapi.yaml` (e.g., `GET /`, `GET /product/{id}`, `POST /cart`). These tests will fail initially.

**Approval Checkpoint:** Once the project is set up, the API is defined, and initial tests are written, I will ask for approval before proceeding.

## Milestone 2: Implement the Web Server & Core Logic

1.  **Create Express Server:**
    *   In `src/frontend-ts/src/index.ts`, create the Express application.
    *   Set up routes based on the `openapi.yaml` and the original Go handlers.
    *   Set up middleware for logging and session management (similar to the Go implementation).

2.  **Implement Backend Service Clients:**
    *   Create client modules (e.g., `src/frontend-ts/src/productService.ts`, `src/frontend-ts/src/cartService.ts`) that use `axios` to communicate with the backend microservices.
    *   The service addresses will be read from environment variables, just like in the Go version.

3.  **Implement Route Handlers:**
    *   Implement the logic for each route handler.
    *   Fetch data from backend services using the new clients.
    *   Render the existing HTML templates. I will use a simple template rendering approach, likely by reading the files and doing string replacement, to avoid adding a new templating engine dependency.

4.  **Pass All Tests:**
    *   Run the tests written in Milestone 1 and ensure they all pass.
    *   Add more tests as needed to cover the core application logic.

**Approval Checkpoint:** After implementing the server and passing all tests, I will ask for approval.

## Milestone 3: Update Docker & Kubernetes Configuration

1.  **Update Dockerfile:**
    *   Create a new `Dockerfile` for the TypeScript application in `src/frontend-ts/Dockerfile`. It will be a multi-stage build, first compiling the TypeScript to JavaScript, and then creating a small production image with only the necessary files.

2.  **Update Kubernetes Manifests:**
    *   Update `kubernetes-manifests/frontend.yaml` and `helm-chart/templates/frontend.yaml`.
    *   Change the container image to point to the new image (`frontend-ts`).
    *   Update the container port to `8080`.
    *   Change the `readinessProbe` and `livenessProbe` to use an HTTP `GET` request to the `/_healthz` endpoint.
    *   Update the `Service` definition to expose the HTTP port.

**Approval Checkpoint:** After updating the infrastructure configuration, I will ask for approval.

## Milestone 4: Finalization

1.  **Code Review & Refactor:**
    *   Review the entire TypeScript codebase for clarity, consistency, and correctness.
    *   Refactor as needed.

2.  **Final Verification:**
    *   Run all tests one last time.
    *   Build the Docker image.
    *   If possible, run the application locally with the other services to ensure everything works together.
    *   Once everything is verified, delete the old `src/frontend` directory and rename `src/frontend-ts` to `src/frontend`.
