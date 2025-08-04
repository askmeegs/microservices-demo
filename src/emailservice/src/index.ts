// Initialize OpenTelemetry Tracing
import './tracing';

import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';
import { sendOrderConfirmationEmail } from './email';

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to validate requests against the OpenAPI specification
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../openapi.yaml'),
    validateRequests: true,
  }),
);

/**
 * Health check endpoint for Kubernetes liveness and readiness probes.
 */
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

/**
 * Endpoint to send an order confirmation email.
 * The request body is validated against the OpenAPI spec.
 */
app.post('/send_order_confirmation', (req, res) => {
  try {
    // The actual email sending logic is in the email.ts module
    sendOrderConfirmationEmail(req.body);
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling middleware for OpenAPI validation errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;