**Migration Plan: `shippingservice` (Go/gRPC to TypeScript/HTTP)**

**1. Milestone: Scaffolding and Initial Setup**

*   Create a new directory `src/shippingservice-ts`.
*   Initialize a new Node.js project with `npm init -y`.
*   Create a `tsconfig.json` file for TypeScript configuration.
*   Install dependencies: `express`, `axios`, `typescript`, `@types/express`, `@types/node`, `jest`, `ts-jest`, `@types/jest`.
*   Create an `openapi.yaml` file to define the HTTP API, based on the proto definition.
*   Create a basic Express server in `src/shippingservice-ts/server.ts`.
*   Create a placeholder test file `src/shippingservice-ts/server.test.ts`.

**2. Milestone: API Implementation (TDD)**

*   **Write Tests:**
    *   Write a test for the `POST /quote` endpoint in `server.test.ts`.
    *   Write a test for the `POST /shiporder` endpoint in `server.test.ts`.
*   **Implement API:**
    *   Implement the `POST /quote` endpoint in `server.ts` to return a hardcoded shipping quote, similar to the Go implementation.
    *   Implement the `POST /shiporder` endpoint in `server.ts` to generate a tracking ID, similar to the Go implementation.
*   **Run Tests:** Run the tests to ensure the API is working as expected.

**3. Milestone: Docker and Kubernetes Integration**

*   **Update Dockerfile:**
    *   Create a new `Dockerfile` in `src/shippingservice-ts` to build the TypeScript application.
*   **Update Kubernetes Manifests:**
    *   Update the `shippingservice.yaml` in `kubernetes-manifests` to use the new Docker image and configure the HTTP port and probes.
    *   Update the `shippingservice.yaml` in `helm-chart/templates` to use the new Docker image and configure the HTTP port and probes.
    *   Update the `shippingservice.yaml` in `kustomize/base` to use the new Docker image and configure the HTTP port and probes.

**4. Milestone: Finalization and Cleanup**

*   Remove the old `src/shippingservice` directory.
*   Rename `src/shippingservice-ts` to `src/shippingservice`.
*   Update any other references to the old service in the repository.
*   Run all tests one last time to ensure everything is working correctly.