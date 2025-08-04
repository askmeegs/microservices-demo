import { Spanner } from '@google-cloud/spanner';
import { ICartStore } from './ICartStore';
import { Cart, CartItem } from '../types';

export class SpannerCartStore implements ICartStore {
    private static readonly TableName = "CartItems";
    private static readonly DefaultInstanceName = "onlineboutique";
    private static readonly DefaultDatabaseName = "carts";
    private readonly spanner: Spanner;
    private readonly instanceName: string;
    private readonly databaseName: string;

    constructor() {
        const spannerProjectId = process.env.SPANNER_PROJECT;
        const spannerInstanceId = process.env.SPANNER_INSTANCE || SpannerCartStore.DefaultInstanceName;
        const spannerDatabaseId = process.env.SPANNER_DATABASE || SpannerCartStore.DefaultDatabaseName;
        
        if (!spannerProjectId) {
            throw new Error("Spanner project not set in environment variables");
        }

        this.spanner = new Spanner({ projectId: spannerProjectId });
        this.instanceName = spannerInstanceId;
        this.databaseName = spannerDatabaseId;
    }

    private getDatabase() {
        return this.spanner.instance(this.instanceName).database(this.databaseName);
    }

    async addItem(userId: string, productId: string, quantity: number): Promise<void> {
        console.log(`AddItemAsync for ${userId} called`);
        const database = this.getDatabase();
        const table = database.table(SpannerCartStore.TableName);

        try {
            await database.runTransactionAsync(async (transaction) => {
                const query = {
                    sql: `SELECT quantity FROM ${SpannerCartStore.TableName} WHERE userId = @userId AND productId = @productId`,
                    params: {
                        userId: userId,
                        productId: productId,
                    },
                };
                const [rows] = await transaction.run(query);
                let currentQuantity = 0;
                if (rows.length > 0) {
                    const json = rows[0].toJSON();
                    currentQuantity = json.quantity;
                }

                const totalQuantity = currentQuantity + quantity;

                await transaction.upsert(SpannerCartStore.TableName, {
                    userId: userId,
                    productId: productId,
                    quantity: totalQuantity,
                });
                await transaction.commit();
            });
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        } finally {
            database.close();
        }
    }

    async getCart(userId: string): Promise<Cart> {
        console.log(`GetCartAsync called for userId=${userId}`);
        const cart: Cart = { userId, items: [] };
        const database = this.getDatabase();
        try {
            const query = {
                sql: `SELECT productId, quantity FROM ${SpannerCartStore.TableName} WHERE userId = @userId`,
                params: {
                    userId: userId,
                },
            };
            const [rows] = await database.run(query);
            rows.forEach(row => {
                const json = row.toJSON();
                const item: CartItem = {
                    productId: json.productId,
                    quantity: json.quantity
                };
                cart.items.push(item);
            });
            return cart;
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        } finally {
            database.close();
        }
    }

    async emptyCart(userId: string): Promise<void> {
        console.log(`EmptyCartAsync called for userId=${userId}`);
        const database = this.getDatabase();
        try {
            await database.runTransactionAsync(async (transaction) => {
                await transaction.deleteRows(SpannerCartStore.TableName, [userId]);
                await transaction.commit();
            });
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        } finally {
            database.close();
        }
    }

    async ping(): Promise<void> {
        const database = this.getDatabase();
        try {
            await database.run({ sql: 'SELECT 1' });
        } catch (err) {
            throw new Error('Spanner connection failed');
        } finally {
            database.close();
        }
    }
}
