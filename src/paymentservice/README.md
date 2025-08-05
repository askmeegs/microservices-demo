# Payment Service

The Payment Service is a Node.js microservice responsible for handling payment transactions. It exposes a gRPC API for charging credit cards.

## Service Description

This service provides a `Charge` RPC method that takes a credit card and an amount as input. It performs validation on the credit card to ensure it is a valid VISA or MasterCard and that it has not expired. If the validation is successful, it returns a transaction ID.

**Note:** This service does not actually process any payments. It is a mock service that simulates the payment process.

## gRPC API

The gRPC API is defined in the `proto/demo.proto` file.

### PaymentService

#### `Charge(ChargeRequest) returns (ChargeResponse)`

-   **ChargeRequest**:
    -   `amount`: The amount to charge (in the customer's currency).
    -   `credit_card`: The credit card information.
-   **ChargeResponse**:
    -   `transaction_id`: A unique identifier for the transaction.

## Dependencies

The service relies on the following key dependencies:

-   **[@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js)**: For creating the gRPC server.
-   **[simple-card-validator](https://www.npmjs.com/package/simple-card-validator)**: For validating credit card numbers.
-   **[@opentelemetry/api](https://www.npmjs.com/package/@opentelemetry/api)**, **[@opentelemetry/exporter-otlp-grpc](https://www.npmjs.com/package/@opentelemetry/exporter-otlp-grpc)**, **[@opentelemetry/instrumentation-grpc](https://www.npmjs.com/package/@opentelemetry/instrumentation-grpc)**, **[@opentelemetry/sdk-trace-base](https://www.npmjs.com/package/@opentelemetry/sdk-trace-base)**, **[@opentelemetry/sdk-node](https://www.npmjs.com/package/@opentelemetry/sdk-node)**: For distributed tracing with OpenTelemetry.
-   **[pino](https://www.npmjs.com/package/pino)**: For logging.
-   **[uuid](https://www.npmjs.com/package/uuid)**: For generating unique transaction IDs.
-   **[@google-cloud/profiler](https://www.npmjs.com/package/@google-cloud/profiler)**: For profiling the application.

## Running the Service

The service is started by running the `index.js` file. It listens on the port specified by the `PORT` environment variable.
