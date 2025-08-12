import express from 'express';

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;

function createTrackingId(address: any): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const twoRandomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const anotherRandomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${twoRandomLetters}-${randomNumber}-${anotherRandomNumber}`;
}

app.get('/', (req, res) => {
    res.send('Shipping Service is up and running');
});

app.post('/quote', (req, res) => {
    const { address, items } = req.body;
    if (!address || !items) {
        return res.status(400).send('Invalid request');
    }

    const quote = {
        cost_usd: {
            currency_code: 'USD',
            units: 8,
            nanos: 990000000
        }
    };
    res.json(quote);
});

app.post('/shiporder', (req, res) => {
    const { address, items } = req.body;
    if (!address || !items) {
        return res.status(400).send('Invalid request');
    }
    const trackingId = createTrackingId(address);
    res.json({ tracking_id: trackingId });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Shipping Service listening on port ${port}`);
    });
}

export { app };
