import express from 'express';
import pino from 'pino';
import { charge, CreditCardError } from './charge';
import { ChargeRequest } from './types';

const app = express();
const port = process.env.PORT || 8080;

const logger = pino({
  name: 'paymentservice-ts',
  messageKey: 'message',
  formatters: {
    level (logLevelString, logLevelNum) {
      return { severity: logLevelString }
    }
  }
});

app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'SERVING' });
});

// Charge endpoint
app.post('/charge', (req, res) => {
  const chargeRequest = req.body as ChargeRequest;

  if (!chargeRequest.amount || !chargeRequest.credit_card) {
    logger.error('Invalid charge request: missing amount or credit_card');
    return res.status(400).json({ error: 'Invalid request: missing amount or credit_card' });
  }

  try {
    logger.info(`Charge request received for ${chargeRequest.amount.currency_code} ${chargeRequest.amount.units}`);
    const response = charge(chargeRequest);
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof CreditCardError) {
      logger.warn(`Invalid credit card: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof Error) {
      logger.error(`Error processing charge: ${err.message}`);
    } else {
      logger.error('An unknown error occurred');
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start listening if the file is run directly
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

export default app;
