import { ICartStore } from './cartstore/ICartStore';
import { RedisCartStore } from './cartstore/RedisCartStore';
import { AlloyDBCartStore } from './cartstore/AlloyDBCartStore';
import { SpannerCartStore } from './cartstore/SpannerCartStore';
import { InMemoryCartStore } from './cartstore/InMemoryCartStore';

export async function createCartStore(): Promise<ICartStore> {
    const redisAddress = process.env.REDIS_ADDR;
    const spannerProjectId = process.env.SPANNER_PROJECT;
    const spannerConnectionString = process.env.SPANNER_CONNECTION_STRING;
    const alloyDBPrimaryIp = process.env.ALLOYDB_PRIMARY_IP;

    if (redisAddress) {
        console.log(`Using Redis cart store: ${redisAddress}`);
        return new RedisCartStore(redisAddress);
    } else if (spannerProjectId || spannerConnectionString) {
        console.log(`Using Spanner cart store`);
        return new SpannerCartStore();
    } else if (alloyDBPrimaryIp) {
        console.log(`Using AlloyDB cart store`);
        return await AlloyDBCartStore.create();
    } else {
        console.log("No database connection specified. Falling back to in-memory store.");
        return new InMemoryCartStore();
    }
}
