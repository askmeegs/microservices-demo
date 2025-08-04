import axios from 'axios';
import { Address, CartItem, CreditCardInfo, Money, OrderResult } from './types';

const {
  CART_SERVICE_ADDR = 'http://cartservice:7070',
  PRODUCT_CATALOG_SERVICE_ADDR = 'http://productcatalogservice:3550',
  SHIPPING_SERVICE_ADDR = 'http://shippingservice:50051',
  CURRENCY_SERVICE_ADDR = 'http://currencyservice:7000',
  PAYMENT_SERVICE_ADDR = 'http://paymentservice:50051',
  EMAIL_SERVICE_ADDR = 'http://emailservice:5000',
} = process.env;

export const getCart = async (userId: string): Promise<CartItem[]> => {
  const response = await axios.get(`${CART_SERVICE_ADDR}/cart/${userId}`);
  return response.data.items;
};

export const emptyCart = async (userId: string): Promise<void> => {
  await axios.delete(`${CART_SERVICE_ADDR}/cart/${userId}`);
};

export const getProduct = async (
  productId: string
): Promise<{
  id: string;
  name: string;
  description: string;
  picture: string;
  price_usd: Money;
  categories: string[];
} | null> => {
  const response = await axios.get(
    `${PRODUCT_CATALOG_SERVICE_ADDR}/products/${productId}`
  );
  return response.data;
};

export const convertCurrency = async (
  money: Money,
  toCurrency: string
): Promise<Money> => {
  const response = await axios.post(`${CURRENCY_SERVICE_ADDR}/convert`, {
    from: money,
    to_code: toCurrency,
  });
  return response.data;
};

export const getShippingQuote = async (
  address: Address,
  items: CartItem[]
): Promise<{ cost_usd: Money }> => {
  const response = await axios.post(`${SHIPPING_SERVICE_ADDR}/getquote`, {
    address,
    items,
  });
  return response.data;
};

export const shipOrder = async (
  address: Address,
  items: CartItem[]
): Promise<string> => {
  const response = await axios.post(`${SHIPPING_SERVICE_ADDR}/ship`, {
    address,
    items,
  });
  return response.data.tracking_id;
};

export const chargeCard = async (
  amount: Money,
  creditCard: CreditCardInfo
): Promise<string> => {
  const response = await axios.post(`${PAYMENT_SERVICE_ADDR}/charge`, {
    amount,
    credit_card: creditCard,
  });
  return response.data.transaction_id;
};

export const sendOrderConfirmation = async (
  email: string,
  order: OrderResult
): Promise<void> => {
  await axios.post(`${EMAIL_SERVICE_ADDR}/send_order_confirmation`, {
    email,
    order,
  });
};