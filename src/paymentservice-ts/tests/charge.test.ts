import { charge, CreditCardError, InvalidCreditCard, UnacceptedCreditCard, ExpiredCreditCard } from '../src/charge';
import { ChargeRequest } from '../src/types';

describe('Charge Logic', () => {
  const validRequest: ChargeRequest = {
    amount: {
      currency_code: 'USD',
      units: 120,
      nanos: 500000000, // $120.50
    },
    credit_card: {
      credit_card_number: '4111111111111111', // Visa
      credit_card_cvv: 123,
      credit_card_expiration_year: new Date().getFullYear() + 1,
      credit_card_expiration_month: 12,
    },
  };

  it('should return a transaction_id for a valid charge', () => {
    const result = charge(validRequest);
    expect(result).toHaveProperty('transaction_id');
    expect(typeof result.transaction_id).toBe('string');
  });

  it('should throw InvalidCreditCard for an invalid card number', () => {
    const invalidRequest = {
      ...validRequest,
      credit_card: {
        ...validRequest.credit_card,
        credit_card_number: '1234 5678',
      },
    };
    expect(() => charge(invalidRequest)).toThrow(InvalidCreditCard);
  });

  it('should throw UnacceptedCreditCard for a non-VISA/MasterCard type', () => {
    const amexRequest = {
        ...validRequest,
        credit_card: {
          ...validRequest.credit_card,
          credit_card_number: '378282246310005', // Amex
        },
      };
    expect(() => charge(amexRequest)).toThrow(UnacceptedCreditCard);
  });

  it('should throw ExpiredCreditCard for an expired card', () => {
    const expiredRequest = {
      ...validRequest,
      credit_card: {
        ...validRequest.credit_card,
        credit_card_expiration_year: 2020,
        credit_card_expiration_month: 1,
      },
    };
    expect(() => charge(expiredRequest)).toThrow(ExpiredCreditCard);
  });

  it('should successfully process a MasterCard', () => {
    const mastercardRequest = {
        ...validRequest,
        credit_card: {
          ...validRequest.credit_card,
          credit_card_number: '5555555555554444', // MasterCard
        },
      };
    const result = charge(mastercardRequest);
    expect(result).toHaveProperty('transaction_id');
  });
});
