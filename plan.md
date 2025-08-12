# Migration Plan: Go/gRPC to TypeScript/HTTP

This document outlines the plan to migrate the `checkoutservice` from a Go/gRPC implementation to a TypeScript/HTTP implementation.

## 1. Project Setup

*   **DONE** Create a new `checkoutservice-ts` directory in `src`.
*   **DONE** Initialize a new Node.js project with `npm init`.
*   **DONE** Install dependencies:
    *   `typescript`
    *   `ts-node`
    *   `express`
    *   `axios`
    *   `jest`
    *   `ts-jest`
    *   `@types/express`
    *   `@types/jest`
    *   `@types/node`
    *   `openapi-types`
    *   `uuid`
*   **DONE** Configure `tsconfig.json` for the project.
*   **DONE** Configure `jest.config.js` for the project.

## 2. OpenAPI Specification

*   **DONE** Create an `openapi.yaml` file for the `checkoutservice`.
*   **DONE** Define the `/charge` endpoint and its request and response schemas.
*   **DONE** Define the `/healthz` endpoint.

## 3. Test-Driven Development

*   **DONE** Create a `src/tests` directory.
*   **DONE** Write initial tests for the API server in `src/tests/api.test.ts`.
    *   Test for a successful response from the `/healthz` endpoint.
    *   Test for a successful response from the `/charge` endpoint with valid data.
    *   Test for a 400 error from the `/charge` endpoint with invalid data.

## 4. Implementation

*   **DONE** Create a `src/index.ts` file for the main application logic.
*   **DONE** Implement the Express server.
*   **DONE** Implement the `/healthz` endpoint.
*   **DONE** Implement the `/charge` endpoint, including:
    *   Calling the `productcatalogservice` to get product details.
    *   Calling the `cartservice` to get the user's cart.
    *   Calling the `currencyservice` to convert currencies.
    *   Calling the `shippingservice` to get a shipping quote.
    *   Calling the `paymentservice` to charge the credit card.
    *   Calling the `emailservice` to send an order confirmation.

## 5. Dockerization and Kubernetes

*   **DONE** Create a new `Dockerfile` for the TypeScript service.
*   **DONE** Update the `kubernetes-manifests/checkoutservice.yaml` to use the new Docker image and configure the HTTP server.
*   **DONE** Update the `kustomize/base/checkoutservice.yaml` to use the new Docker image and configure the HTTP server.

## 6. Refinement and Cleanup

*   **DONE** Remove the old Go `checkoutservice` directory.
*   **DONE** Update any relevant documentation.
*   **DONE** Manually test the new service in the context of the entire application.
