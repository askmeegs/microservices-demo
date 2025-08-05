// Type definitions based on openapi.yaml

export interface Money {
    currency_code: string;
    units: number;
    nanos: number;
  }
  
  export interface CreditCardInfo {
    credit_card_number: string;
    credit_card_cvv: number;
    credit_card_expiration_year: number;
    credit_card_expiration_month: number;
  }
  
  export interface ChargeRequest {
    amount: Money;
    credit_card: CreditCardInfo;
  }
  
  export interface ChargeResponse {
    transaction_id: string;
  }
  