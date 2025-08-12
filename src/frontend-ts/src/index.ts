import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 8080;

const productCatalogSvcAddr = process.env.PRODUCT_CATALOG_SERVICE_ADDR || 'localhost:3550';
const currencySvcAddr = process.env.CURRENCY_SERVICE_ADDR || 'localhost:7000';
const cartSvcAddr = process.env.CART_SERVICE_ADDR || 'localhost:7070';
const recommendationSvcAddr = process.env.RECOMMENDATION_SERVICE_ADDR || 'localhost:8080';
const checkoutSvcAddr = process.env.CHECKOUT_SERVICE_ADDR || 'localhost:5050';
const shippingSvcAddr = process.env.SHIPPING_SERVICE_ADDR || 'localhost:50051';
const adSvcAddr = process.env.AD_SERVICE_ADDR || 'localhost:9555';
const shoppingAssistantSvcAddr = process.env.SHOPPING_ASSISTANT_SERVICE_ADDR || 'localhost:8000';

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../static')));

const templates = {
    home: fs.readFileSync(path.join(__dirname, '../templates/home.html'), 'utf8'),
    product: fs.readFileSync(path.join(__dirname, '../templates/product.html'), 'utf8'),
    cart: fs.readFileSync(path.join(__dirname, '../templates/cart.html'), 'utf8'),
    order: fs.readFileSync(path.join(__dirname, '../templates/order.html'), 'utf8'),
    header: fs.readFileSync(path.join(__dirname, '../templates/header.html'), 'utf8'),
    footer: fs.readFileSync(path.join(__dirname, '../templates/footer.html'), 'utf8'),
    error: fs.readFileSync(path.join(__dirname, '../templates/error.html'), 'utf8'),
};

const renderTemplate = (template: string, data: { [key: string]: any }): string => {
    let html = template;
    for (const key in data) {
        const re = new RegExp(`{{.${key}}}`, 'g');
        html = html.replace(re, data[key]);
    }
    // render header and footer
    html = html.replace('{{template "header" .}}', templates.header);
    html = html.replace('{{template "footer" .}}', templates.footer);
    return html;
}

interface RequestWithSession extends Request {
    sessionId?: string;
}

const session = (req: RequestWithSession, res: Response, next: NextFunction) => {
    let sessionId = req.cookies['session_id'];
    if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('session_id', sessionId);
    }
    req.sessionId = sessionId;
    next();
};

app.use(session);

app.get('/', async (req: RequestWithSession, res: Response) => {
    try {
        const { data: products } = await axios.get(`http://${productCatalogSvcAddr}/products`);
        const { data: currencies } = await axios.get(`http://${currencySvcAddr}/currencies`);
        const { data: cart } = await axios.get(`http://${cartSvcAddr}/cart/${req.sessionId}`);

        let productsHtml = '';
        for (const product of products) {
            productsHtml += `
                <div class="col-md-4">
                    <a href="/product/${product.id}">
                        <img class="img-fluid" src="${product.picture}" alt="${product.name}">
                    </a>
                    <div class="py-2">
                        <p class="mb-0"><a href="/product/${product.id}" class="text-dark">${product.name}</a></p>
                        <strong>${product.price_usd.currency_code} ${product.price_usd.units}.${product.price_usd.nanos}</strong>
                    </div>
                </div>
            `;
        }

        const homeHtml = renderTemplate(templates.home, {
            "products": productsHtml,
            "currencies": currencies,
            "cart_size": cart.items.length,
        });
        res.send(homeHtml);
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.get('/product/:id', async (req: RequestWithSession, res: Response) => {
    try {
        const { data: product } = await axios.get(`http://${productCatalogSvcAddr}/products/${req.params.id}`);
        const { data: currencies } = await axios.get(`http://${currencySvcAddr}/currencies`);
        const { data: cart } = await axios.get(`http://${cartSvcAddr}/cart/${req.sessionId}`);
        // const { data: recommendations } = await axios.get(`http://${recommendationSvcAddr}/recommendations/${req.params.id}`);

        const productHtml = renderTemplate(templates.product, {
            "product": product,
            "currencies": currencies,
            "cart_size": cart.items.length,
            // "recommendations": recommendations,
        });
        res.send(productHtml);
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.get('/cart', async (req: RequestWithSession, res: Response) => {
    try {
        const { data: currencies } = await axios.get(`http://${currencySvcAddr}/currencies`);
        const { data: cart } = await axios.get(`http://${cartSvcAddr}/cart/${req.sessionId}`);
        // const { data: recommendations } = await axios.get(`http://${recommendationSvcAddr}/recommendations`);

        const cartHtml = renderTemplate(templates.cart, {
            "currencies": currencies,
            "cart": cart,
            "cart_size": cart.items.length,
            // "recommendations": recommendations,
        });
        res.send(cartHtml);
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.post('/cart', async (req: RequestWithSession, res: Response) => {
    try {
        await axios.post(`http://${cartSvcAddr}/cart/${req.sessionId}`, {
            productId: req.body.product_id,
            quantity: req.body.quantity,
        });
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.post('/cart/empty', async (req: RequestWithSession, res: Response) => {
    try {
        await axios.delete(`http://${cartSvcAddr}/cart/${req.sessionId}`);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.post('/cart/checkout', async (req: RequestWithSession, res: Response) => {
    try {
        const { data: order } = await axios.post(`http://${checkoutSvcAddr}/checkout`, {
            user_id: req.sessionId,
            user_currency: req.cookies['currency'] || 'USD',
            address: {
                street_address: req.body.street_address,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                zip_code: parseInt(req.body.zip_code),
            },
            email: req.body.email,
            credit_card: {
                credit_card_number: req.body.credit_card_number,
                credit_card_cvv: parseInt(req.body.credit_card_cvv),
                credit_card_expiration_year: parseInt(req.body.credit_card_expiration_year),
                credit_card_expiration_month: parseInt(req.body.credit_card_expiration_month),
            }
        });

        const orderHtml = renderTemplate(templates.order, {
            "order": order,
        });
        res.send(orderHtml);
    } catch (error) {
        console.error(error);
        res.status(500).send(renderTemplate(templates.error, { "error": (error as Error).message }));
    }
});

app.post('/setCurrency', (req, res) => {
    res.cookie('currency', req.body.currency_code);
    res.redirect('back');
});

app.get('/_healthz', (req, res) => {
    res.status(200).send('ok');
});

app.listen(port, () => {
    console.log(`Frontend service listening at http://localhost:${port}`);
});

export default app;
