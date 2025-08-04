import { sendOrderConfirmationEmail } from './email';
import { components } from './schema';

type SendOrderConfirmationRequest = components['schemas']['SendOrderConfirmationRequest'];

describe('Email Module', () => {
  it('should render the email template with the correct data', () => {
    const request: SendOrderConfirmationRequest = {
      email: 'test@example.com',
      order: {
        order_id: '123',
        shipping_tracking_id: 'abc',
        shipping_cost: {
          currency_code: 'USD',
          units: 10,
          nanos: 0,
        },
        shipping_address: {
          street_address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: 12345,
        },
        items: [
          {
            item: {
              product_id: 'product1',
              quantity: 1,
            },
            cost: {
              currency_code: 'USD',
              units: 10,
              nanos: 0,
            },
          },
        ],
      },
    };

    const renderedHtml = sendOrderConfirmationEmail(request);
    expect(renderedHtml).toContain('Order Confirmation');
    expect(renderedHtml).toContain('123'); // order_id
    expect(renderedHtml).toContain('product1');
  });
});
