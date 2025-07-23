# Migration Plan: AdService from Java/gRPC to TypeScript/HTTP

This document outlines the plan to migrate the `adservice` from a Java/gRPC implementation to a TypeScript/HTTP (Express.js) implementation.

## 1. Project Setup

- **Create `package.json`:** Initialize a new Node.js project with a `package.json` file. This file will define all dependencies with pinned versions, including:
    - `express`: 4.19.2
    - `typescript`: 5.8.3
    - `ts-node`: 10.9.2
    - `jest`: 29.7.0
    - `ts-jest`: 29.1.2
    - `@types/express`: 4.17.21
    - `@types/jest`: 29.5.12
    - `@types/node`: 20.12.12
    - `axios`: 1.7.2
- **Create `tsconfig.json`:** Configure TypeScript with a `tsconfig.json` file. This will define the compiler options, such as the target version of JavaScript, module system, and output directory.
- **Create `.dockerignore`:** Create a `.dockerignore` file to exclude `node_modules` and other unnecessary files from the Docker build context.

## 2. API Definition

- **Create `openapi.yaml`:** Define the new HTTP API using the OpenAPI 3.0 specification. This will be based on the existing gRPC service definition in `protos/demo.proto`. The API will have a single endpoint:
    - `GET /ads`: This endpoint will accept an optional `context_keys` query parameter and return a list of ads.

## 3. Testing

- **Write API Server Tests:** Using Jest and `ts-jest`, create a test suite for the API server. The tests will cover the following scenarios:
    - Requesting ads with `context_keys` and verifying that the correct ads are returned.
    - Requesting ads without `context_keys` and verifying that a random selection of ads is returned.
    - Requesting ads with an unknown `context_key` and verifying that a random selection of ads is returned.

## 4. Implementation

- **Implement the Ad Service Logic:** Create a new `src/AdService.ts` file to contain the core logic of the ad service. This will include the in-memory ad data and the functions for selecting ads.
- **Implement the Express Server:** Create a new `src/index.ts` file to implement the Express.js server. This server will handle requests to the `/ads` endpoint and use the `AdService` to generate the ad response.

## 5. Containerization and Deployment

- **Update `Dockerfile`:** Modify the existing `Dockerfile` to build the new TypeScript application. This will involve:
    - Using a Node.js 22 base image.
    - Installing dependencies using `npm install`.
    - Compiling the TypeScript code using `tsc`.
    - Setting the entry point to `node dist/index.js`.
- **Update `kubernetes-manifests/adservice.yaml`:** Update the Kubernetes manifest to reflect the changes in the service:
    - Change the container image to the new image name.
    - Update the container port from 9555 (gRPC) to 8080 (HTTP).
    - Update the readiness and liveness probes to use an HTTP `GET` request to the `/ads` endpoint.
    - Update the `Service` definition to expose port 8080.

## 6. Cleanup

- **Remove old files:** Remove the old Java source files, `build.gradle`, `gradlew`, and other files related to the Java implementation.