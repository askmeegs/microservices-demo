// Based on openapi.yaml

export interface Money {
  currency_code: string;
  units: number;
  nanos: number;
}

export interface Address {
  street_address: string;
  city: string;
  state: string;
  country: string;
  zip_code: number;
}

export interface CreditCardInfo {
  credit_card_number: string;
  credit_card_cvv: number;
  credit_card_expiration_year: number;
  credit_card_expiration_month: number;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface OrderItem {
  item: CartItem;
  cost: Money;
}

export interface OrderResult {
  order_id: string;
  shipping_tracking_id: string;
  shipping_cost: Money;
  shipping_address: Address;
  items: OrderItem[];
}

export interface PlaceOrderRequest {
  user_id: string;
  user_currency: string;
  address: Address;
  email: string;
  credit_card: CreditCardInfo;
}

export interface PlaceOrderResponse {
  order: OrderResult;
}
