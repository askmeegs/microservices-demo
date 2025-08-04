import { ICartStore } from './ICartStore';
import { Cart } from '../types';

export class InMemoryCartStore implements ICartStore {
  private readonly carts: Map<string, Cart> = new Map();

  async addItem(userId: string, productId: string, quantity: number): Promise<void> {
    console.log(`AddItemAsync called with userId=${userId}, productId=${productId}, quantity=${quantity}`);
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = { userId, items: [] };
    }
    
    const existingItem = cart.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    this.carts.set(userId, cart);
  }

  async getCart(userId: string): Promise<Cart> {
    console.log(`GetCartAsync called with userId=${userId}`);
    if (this.carts.has(userId)) {
      return this.carts.get(userId)!;
    }
    return { userId, items: [] };
  }

  async emptyCart(userId: string): Promise<void> {
    console.log(`EmptyCartAsync called with userId=${userId}`);
    this.carts.delete(userId);
  }

  async ping(): Promise<void> {
    // In-memory store is always available
    return Promise.resolve();
  }
}
