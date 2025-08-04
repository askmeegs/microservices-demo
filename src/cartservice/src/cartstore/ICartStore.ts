import { Cart } from '../types';

export interface ICartStore {
  addItem(userId: string, productId: string, quantity: number): Promise<void>;
  getCart(userId: string): Promise<Cart>;
  emptyCart(userId: string): Promise<void>;
  ping(): Promise<void>;
}
