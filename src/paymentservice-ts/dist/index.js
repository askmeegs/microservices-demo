"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pino_1 = __importDefault(require("pino"));
const charge_1 = require("./charge");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const logger = (0, pino_1.default)({
    name: 'paymentservice-ts',
    messageKey: 'message',
    formatters: {
        level(logLevelString, logLevelNum) {
            return { severity: logLevelString };
        }
    }
});
app.use(express_1.default.json());
// Health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'SERVING' });
});
// Charge endpoint
app.post('/charge', (req, res) => {
    const chargeRequest = req.body;
    if (!chargeRequest.amount || !chargeRequest.credit_card) {
        logger.error('Invalid charge request: missing amount or credit_card');
        return res.status(400).json({ error: 'Invalid request: missing amount or credit_card' });
    }
    try {
        logger.info(`Charge request received for ${chargeRequest.amount.currency_code} ${chargeRequest.amount.units}`);
        const response = (0, charge_1.charge)(chargeRequest);
        res.status(200).json(response);
    }
    catch (err) {
        if (err instanceof charge_1.CreditCardError) {
            logger.warn(`Invalid credit card: ${err.message}`);
            return res.status(400).json({ error: err.message });
        }
        if (err instanceof Error) {
            logger.error(`Error processing charge: ${err.message}`);
        }
        else {
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
exports.default = app;
