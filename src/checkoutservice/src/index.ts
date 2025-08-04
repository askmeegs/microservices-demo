import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  Address,
  CartItem,
  CreditCardInfo,
  Money,
  OrderItem,
  PlaceOrderRequest,
  PlaceOrderResponse,
} from './types';
import {
  chargeCard,
  convertCurrency,
  emptyCart,
  getCart,
  getProduct,
  getShippingQuote,
  sendOrderConfirmation,
  shipOrder,
} from './dependencies';
import { sum, multiply } from './money';

export const app = express();
app.use(express.json());

app.post('/placeorder', async (req, res) => {
  console.log(`[PlaceOrder] user_id=${req.body.user_id} user_currency=${req.body.user_currency}`);
  try {
    const request = req.body as PlaceOrderRequest;

    if (
      !request.user_id ||
      !request.user_currency ||
      !request.address ||
      !request.email ||
      !request.credit_card
    ) {
      return res.status(400).send('Bad request');
    }

    const orderId = uuidv4();

    const cartItems = await getCart(request.user_id);
    if (cartItems.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    const orderItems: OrderItem[] = await Promise.all(
      cartItems.map(async (item) => {
        const product = await getProduct(item.product_id);
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        const price = await convertCurrency(
          product.price_usd,
          request.user_currency
        );
        return {
          item,
          cost: price,
        };
      })
    );

    const shippingCost = await getShippingQuote(request.address, cartItems);
    const shippingPrice = await convertCurrency(
      shippingCost.cost_usd,
      request.user_currency
    );

    let total: Money = {
      currency_code: request.user_currency,
      units: 0,
      nanos: 0,
    };
    total = sum(total, shippingPrice);
    for (const item of orderItems) {
      total = sum(total, multiply(item.cost, item.item.quantity));
    }

    const transactionId = await chargeCard(total, request.credit_card);
    console.log(`payment went through (transaction_id: ${transactionId})`);


    const trackingId = await shipOrder(request.address, cartItems);

    await emptyCart(request.user_id);

    const orderResult = {
      order_id: orderId,
      shipping_tracking_id: trackingId,
      shipping_cost: shippingPrice,
      shipping_address: request.address,
      items: orderItems,
    };

    await sendOrderConfirmation(request.email, orderResult);
    console.log(`order confirmation email sent to ${request.email}`);


    const response: PlaceOrderResponse = {
      order: orderResult,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
}