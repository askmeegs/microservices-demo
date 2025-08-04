import { Request, Response } from 'express';
import { ICartStore } from './cartstore/ICartStore';

export const getCart = (store: ICartStore) => async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const cart = await store.getCart(userId);
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting cart');
  }
};

export const addItem = (store: ICartStore) => async (req: Request, res: Response) => {
  const { userId, item } = req.body;
  try {
    await store.addItem(userId, item.productId, item.quantity);
    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding item to cart');
  }
};

export const emptyCart = (store: ICartStore) => async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await store.emptyCart(userId);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error emptying cart');
  }
};