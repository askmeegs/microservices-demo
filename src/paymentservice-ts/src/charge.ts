import cardValidator from 'simple-card-validator';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { ChargeRequest, ChargeResponse } from './types';

const logger = pino({
  name: 'paymentservice-charge',
  messageKey: 'message',
  formatters: {
    level (logLevelString, logLevelNum) {
      return { severity: logLevelString }
    }
  }
});

/**
 * Custom error classes for credit card processing.
 */
export class CreditCardError extends Error {
    public code: number;
    constructor (message: string) {
      super(message);
      this.code = 400; // Invalid argument error
    }
  }
  
  /**
   * Error for invalid credit card information.
   */
  export class InvalidCreditCard extends CreditCardError {
    constructor () {
      super(`Credit card info is invalid`);
    }
  }
  
  /**
   * Error for unaccepted credit card types.
   */
  export class UnacceptedCreditCard extends CreditCardError {
    constructor (cardType: string) {
      super(`Sorry, we cannot process ${cardType} credit cards. Only VISA or MasterCard is accepted.`);
    }
  }
  
  /**
   * Error for expired credit cards.
   */
  export class ExpiredCreditCard extends CreditCardError {
    constructor (number: string, month: number, year: number) {
      super(`Your credit card (ending ${number.substr(-4)}) expired on ${month}/${year}`);
    }
  }

/**
 * Verifies the credit card number and (pretend) charges the card.
 */
export function charge(request: ChargeRequest): ChargeResponse {
  const { amount, credit_card: creditCard } = request;
  const cardNumber = creditCard.credit_card_number;
  const cardInfo = cardValidator(cardNumber);
  const {
    card_type: cardType,
    valid
  } = cardInfo.getCardDetails();

  if (!valid) { throw new InvalidCreditCard(); }

  // Only VISA and mastercard is accepted, other card types (AMEX, dinersclub) will
  // throw UnacceptedCreditCard error.
  if (!(cardType === 'visa' || cardType === 'mastercard')) { throw new UnacceptedCreditCard(cardType); }

  // Also validate expiration is > today.
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { credit_card_expiration_year: year, credit_card_expiration_month: month } = creditCard;
  if ((currentYear * 12 + currentMonth) > (year * 12 + month)) { throw new ExpiredCreditCard(cardNumber.replace(/[- ]/g, ''), month, year); }

  logger.info(`Transaction processed: ${cardType} ending ${cardNumber.substr(-4)} \
    Amount: ${amount.currency_code}${amount.units}.${amount.nanos}`);

  // Return a random transaction ID.
  return { transaction_id: uuidv4() };
};
