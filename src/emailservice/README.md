# Email Service (TypeScript)

This document provides an overview of the Email Service, its dependencies, and how to use it. This service is written in TypeScript and uses Express to provide an HTTP API.

## Table of Contents

- [Email Service (TypeScript)](#email-service-typescript)
  - [Table of Contents](#table-of-contents)
  - [Service Definition](#service-definition)
  - [Dependencies](#dependencies)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Running the development server](#running-the-development-server)
    - [Running tests](#running-tests)
    - [Building for production](#building-for-production)
    - [Running in production](#running-in-production)
  - [API Endpoints](#api-endpoints)
    - [`POST /send_order_confirmation`](#post-send_order_confirmation)
    - [`GET /healthz`](#get-healthz)

## Service Definition

The Email Service is an HTTP service that provides functionality for sending emails. The service is defined in the `openapi.yaml` file.

In its current implementation, it does not send real emails but logs the rendered email content to the console. This is for demonstration and testing purposes.

## Dependencies

The Email Service relies on several external libraries and modules. The main dependencies are listed in the `package.json` file and include:

-   **Express**: A minimal and flexible Node.js web application framework.
-   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
-   **Jest**: A delightful JavaScript Testing Framework with a focus on simplicity.
-   **Nunjucks**: A rich and powerful templating language for JavaScript.
-   **OpenTelemetry**: For distributed tracing.

For a complete list of dependencies, please refer to the `package.json` file.

## Usage

### Installation

To install the necessary dependencies, run the following command from the `src/emailservice` directory:

```shell
npm install
```

### Running the development server

To start the service with hot-reloading for development, run:

```shell
npm run dev
```

The server will be available at `http://localhost:8080`.

### Running tests

To run the test suite, use the following command:

```shell
npm test
```

### Building for production

To compile the TypeScript code into JavaScript for production, run:

```shell
npm run build
```

This will create a `dist` directory with the compiled code.

### Running in production

After building the project, you can start the production server with:

```shell
npm start
```

## API Endpoints

### `POST /send_order_confirmation`

Sends an order confirmation email. The request body should be a JSON object that conforms to the `SendOrderConfirmationRequest` schema in the `openapi.yaml` file.

### `GET /healthz`

A health check endpoint that returns a `200 OK` response if the service is running. This is used by Kubernetes for liveness and readiness probes.
