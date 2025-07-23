import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

/**
 * Initializes the OpenTelemetry SDK for Node.js.
 * This will automatically instrument popular libraries like Express and gRPC
 * to create and propagate traces.
 */
const sdk = new NodeSDK({
  // The exporter sends trace data to an OpenTelemetry Collector.
  traceExporter: new OTLPTraceExporter(),
  // Automatically instrument supported libraries.
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK and begin collecting traces.
sdk.start();