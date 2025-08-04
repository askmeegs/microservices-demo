import { createClient, RedisClientType } from 'redis';
import { ICartStore } from './ICartStore';
import { Cart } from '../types';

export class RedisCartStore implements ICartStore {
  private readonly client: RedisClientType;

  constructor(redisAddress: string) {
    this.client = createClient({ url: `redis://${redisAddress}` });
    this.client.connect();
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<void> {
    console.log(`AddItemAsync called with userId=${userId}, productId=${productId}, quantity=${quantity}`);
    try {
      let cart = await this.getCart(userId);
      
      const existingItem = cart.items.find(i => i.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      
      await this.client.set(userId, JSON.stringify(cart));
    } catch (err) {
      console.error(err);
      throw new Error(`Can't access cart storage.`);
    }
  }

  async getCart(userId: string): Promise<Cart> {
    console.log(`GetCartAsync called with userId=${userId}`);
    try {
      const value = await this.client.get(userId);
      if (value) {
        return JSON.parse(value) as Cart;
      }
      // We decided to return empty cart in cases when user wasn't in the cache before
      return { userId, items: [] };
    } catch (err) {
      console.error(err);
      throw new Error(`Can't access cart storage.`);
    }
  }

  async emptyCart(userId: string): Promise<void> {
    console.log(`EmptyCartAsync called with userId=${userId}`);
    try {
      const cart: Cart = { userId, items: [] };
      await this.client.set(userId, JSON.stringify(cart));
    } catch (err) {
      console.error(err);
      throw new Error(`Can't access cart storage.`);
    }
  }

  async ping(): Promise<void> {
    try {
      await this.client.ping();
    } catch (err) {
      throw new Error('Redis connection failed');
    }
  }
}
