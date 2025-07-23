import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;

interface Money {
    currencyCode: string;
    units: number;
    nanos: number;
}

interface Product {
    id: string;
    name: string;
    description: string;
    picture: string;
    priceUsd: Money;
    categories: string[];
}

let products: Product[] = [];

const loadProducts = () => {
    const productsPath = path.join(__dirname, '..', 'products.json');
    const productsJson = fs.readFileSync(productsPath, 'utf8');
    const catalog = JSON.parse(productsJson);
    products = catalog.products;
};

// Load products at startup
loadProducts();

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/search', (req, res) => {
    console.log('Search query:', req.query);
    const query = (req.query.query as string)?.toLowerCase();
    if (!query) {
        return res.status(400).send('Search query is required');
    }
    const results = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    res.json(results);
});

app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

export default app;
