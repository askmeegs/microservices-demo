import express from 'express';
import bodyParser from 'body-parser';
import { getCart, addItem, emptyCart } from './handlers';
import { createCartStore } from './cartStoreFactory';
import { ICartStore } from './cartstore/ICartStore';

export const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let cartStore: ICartStore;

createCartStore().then(store => {
  cartStore = store;
  
  app.get('/cart/:userId', getCart(cartStore));
  app.post('/cart', addItem(cartStore));
  app.delete('/cart/:userId', emptyCart(cartStore));

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Cart service listening at http://localhost:${port}`);
    });
  }
}).catch(err => {
  console.error("Failed to create cart store", err);
  process.exit(1);
});