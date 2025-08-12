const express = require('express');
const app = express();
const port = 9000;

app.use(express.json());

// Mock for cartservice
app.get('/cart/:userId', (req, res) => {
  res.json({
    items: [{ product_id: '1', quantity: 1 }],
  });
});
app.delete('/cart/:userId', (req, res) => {
  res.status(204).send();
});

// Mock for productcatalogservice
app.get('/products/:id', (req, res) => {
  res.json({
    priceUsd: { currency_code: 'USD', units: 10, nanos: 0 },
  });
});

// Mock for currencyservice
app.post('/convert', (req, res) => {
  res.json({ currency_code: 'USD', units: 10, nanos: 0 });
});

// Mock for shippingservice
app.post('/quote', (req, res) => {
  res.json({
    cost_usd: { currency_code: 'USD', units: 5, nanos: 0 },
  });
});
app.post('/shiporder', (req, res) => {
  res.json({ tracking_id: 'abc' });
});

// Mock for paymentservice
app.post('/charge', (req, res) => {
  res.json({ transaction_id: '123' });
});

// Mock for emailservice
app.post('/send_order_confirmation', (req, res) => {
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Mock services listening on port ${port}`);
});
