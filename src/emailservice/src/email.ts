import nunjucks from 'nunjucks';
import path from 'path';
import { components } from './schema';

type SendOrderConfirmationRequest = components['schemas']['SendOrderConfirmationRequest'];

// Configure Nunjucks to load templates from the 'templates' directory
const env = nunjucks.configure(path.join(__dirname, '../templates'), {
  autoescape: true,
});

/**
 * A custom Nunjucks filter to format currency values.
 * This mimics the Python string format `"%02d"`.
 */
env.addFilter('format', (str, count) => {
  return str.replace('%02d', count.toString().padStart(2, '0'));
});

/**
 * Renders the order confirmation email template and logs it to the console.
 * This is a dummy implementation that does not actually send an email.
 *
 * @param {SendOrderConfirmationRequest} request - The request object containing the email and order details.
 * @returns {string} The rendered HTML content of the email.
 */
export function sendOrderConfirmationEmail(request: SendOrderConfirmationRequest): string {
  console.log(`Sending order confirmation email to ${request.email}`);
  const renderedHtml = nunjucks.render('confirmation.html', { order: request.order });
  // In a real application, this would be sent using an email client.
  // For this demo, we just log the output.
  console.log(renderedHtml);
  return renderedHtml;
}