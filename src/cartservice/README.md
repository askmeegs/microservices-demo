# Cart Service (TypeScript)

This is a TypeScript-based implementation of the cart service.

## Prerequisites

- Node.js (v22 or higher)
- Docker

## Build

To build the Docker image, run the following command from the root of the `cartservice-ts` directory:

```bash
docker build -t cartservice-ts .
```

## Test

To run the tests, run the following command from the root of the `cartservice-ts` directory:

```bash
npm test
```

## Run

To run the service locally, run the following command:

```bash
npm start
```

The service will be available at `http://localhost:3000`.
