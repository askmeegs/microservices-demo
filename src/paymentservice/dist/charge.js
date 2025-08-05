"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiredCreditCard = exports.UnacceptedCreditCard = exports.InvalidCreditCard = exports.CreditCardError = void 0;
exports.charge = charge;
const simple_card_validator_1 = __importDefault(require("simple-card-validator"));
const uuid_1 = require("uuid");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({
    name: 'paymentservice-charge',
    messageKey: 'message',
    formatters: {
        level(logLevelString, logLevelNum) {
            return { severity: logLevelString };
        }
    }
});
/**
 * Custom error classes for credit card processing.
 */
class CreditCardError extends Error {
    code;
    constructor(message) {
        super(message);
        this.code = 400; // Invalid argument error
    }
}
exports.CreditCardError = CreditCardError;
/**
 * Error for invalid credit card information.
 */
class InvalidCreditCard extends CreditCardError {
    constructor() {
        super(`Credit card info is invalid`);
    }
}
exports.InvalidCreditCard = InvalidCreditCard;
/**
 * Error for unaccepted credit card types.
 */
class UnacceptedCreditCard extends CreditCardError {
    constructor(cardType) {
        super(`Sorry, we cannot process ${cardType} credit cards. Only VISA or MasterCard is accepted.`);
    }
}
exports.UnacceptedCreditCard = UnacceptedCreditCard;
/**
 * Error for expired credit cards.
 */
class ExpiredCreditCard extends CreditCardError {
    constructor(number, month, year) {
        super(`Your credit card (ending ${number.substr(-4)}) expired on ${month}/${year}`);
    }
}
exports.ExpiredCreditCard = ExpiredCreditCard;
/**
 * Verifies the credit card number and (pretend) charges the card.
 */
function charge(request) {
    const { amount, credit_card: creditCard } = request;
    const cardNumber = creditCard.credit_card_number;
    const cardInfo = (0, simple_card_validator_1.default)(cardNumber);
    const { card_type: cardType, valid } = cardInfo.getCardDetails();
    if (!valid) {
        throw new InvalidCreditCard();
    }
    // Only VISA and mastercard is accepted, other card types (AMEX, dinersclub) will
    // throw UnacceptedCreditCard error.
    if (!(cardType === 'visa' || cardType === 'mastercard')) {
        throw new UnacceptedCreditCard(cardType);
    }
    // Also validate expiration is > today.
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { credit_card_expiration_year: year, credit_card_expiration_month: month } = creditCard;
    if ((currentYear * 12 + currentMonth) > (year * 12 + month)) {
        throw new ExpiredCreditCard(cardNumber.replace(/[- ]/g, ''), month, year);
    }
    logger.info(`Transaction processed: ${cardType} ending ${cardNumber.substr(-4)} \
    Amount: ${amount.currency_code}${amount.units}.${amount.nanos}`);
    // Return a random transaction ID.
    return { transaction_id: (0, uuid_1.v4)() };
}
;
