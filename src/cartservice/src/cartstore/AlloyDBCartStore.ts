import { Client } from 'pg';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { ICartStore } from './ICartStore';
import { Cart, CartItem } from '../types';

export class AlloyDBCartStore implements ICartStore {
    private readonly tableName: string;
    private readonly client: Client;
    private connectionString: string;

    private constructor(connectionString: string, tableName: string) {
        this.connectionString = connectionString;
        this.client = new Client({ connectionString: this.connectionString });
        this.tableName = tableName;
    }

    public static async create(): Promise<AlloyDBCartStore> {
        const projectId = process.env.PROJECT_ID;
        const secretId = process.env.ALLOYDB_SECRET_NAME;
        const alloyDBUser = "postgres";
        const databaseName = process.env.ALLOYDB_DATABASE_NAME;
        const primaryIPAddress = process.env.ALLOYDB_PRIMARY_IP;
        const tableName = process.env.ALLOYDB_TABLE_NAME;

        if (!projectId || !secretId || !databaseName || !primaryIPAddress || !tableName) {
            throw new Error("AlloyDB environment variables not set");
        }

        const secretManagerClient = new SecretManagerServiceClient();
        const [version] = await secretManagerClient.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretId}/versions/latest`,
        });

        if (!version.payload || !version.payload.data) {
            throw new Error("Failed to access secret from Secret Manager");
        }
        const alloyDBPassword = version.payload.data.toString().trim();

        const connectionString = `postgres://${alloyDBUser}:${alloyDBPassword}@${primaryIPAddress}:5432/${databaseName}`;

        const store = new AlloyDBCartStore(connectionString, tableName);
        await store.client.connect();
        return store;
    }


    async addItem(userId: string, productId: string, quantity: number): Promise<void> {
        console.log(`AddItemAsync for ${userId} called`);
        try {
            const fetchCmd = `SELECT quantity FROM ${this.tableName} WHERE userID='${userId}' AND productID='${productId}'`;
            const res = await this.client.query(fetchCmd);
            
            let currentQuantity = 0;
            if (res.rows.length > 0) {
                currentQuantity = res.rows[0].quantity;
            }
            
            const totalQuantity = quantity + currentQuantity;

            const insertCmd = `INSERT INTO ${this.tableName} (userId, productId, quantity) VALUES ('${userId}', '${productId}', ${totalQuantity}) ON CONFLICT (userId, productId) DO UPDATE SET quantity = ${totalQuantity}`;
            await this.client.query(insertCmd);
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        }
    }

    async getCart(userId: string): Promise<Cart> {
        console.log(`GetCartAsync called for userId=${userId}`);
        const cart: Cart = { userId, items: [] };
        try {
            const cartFetchCmd = `SELECT productId, quantity FROM ${this.tableName} WHERE userId = '${userId}'`;
            const res = await this.client.query(cartFetchCmd);

            res.rows.forEach((row: any) => {
                const item: CartItem = {
                    productId: row.productid,
                    quantity: row.quantity
                };
                cart.items.push(item);
            });
            
            return cart;
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        }
    }

    async emptyCart(userId: string): Promise<void> {
        console.log(`EmptyCartAsync called for userId=${userId}`);
        try {
            const deleteCmd = `DELETE FROM ${this.tableName} WHERE userID = '${userId}'`;
            await this.client.query(deleteCmd);
        } catch (ex) {
            console.error(ex);
            throw new Error(`Can't access cart storage. ${ex}`);
        }
    }

    async ping(): Promise<void> {
        try {
            await this.client.query('SELECT 1');
        } catch (err) {
            throw new Error('AlloyDB connection failed');
        }
    }
}
