# Frontend Service

## Overview

The **Frontend** service is the main entry point for the Online Boutique application. It is a Go-based web server that serves the HTML pages for the website and handles all user interactions. It communicates with the various backend microservices to fetch data and perform actions.

## Key Functionalities

- **Homepage:** Displays the list of products.
- **Product Page:** Shows the details of a single product, including recommendations.
- **Cart:** Allows users to view and manage their shopping cart.
- **Checkout:** Enables users to place an order.
- **Currency Selection:** Allows users to select their preferred currency.
- **Shopping Assistant:** Provides a chatbot interface for users to interact with the application.

## Architecture

The `frontend` service is a Go web server built using the `gorilla/mux` router. It uses HTML templates to render the pages. It communicates with the backend services using gRPC.

### Dependencies

The `frontend` service depends on the following backend services:

- **`product-catalog-service`:** To get the list of products and product details.
- **`currency-service`:** To get the list of supported currencies and convert between them.
- **`cart-service`:** To manage the user's shopping cart.
- **`recommendation-service`:** To get product recommendations.
- **`checkout-service`:** To place an order.
- **`shipping-service`:** To get shipping quotes.
- **`ad-service`:** To get advertisements to display on the website.
- **`shopping-assistant-service`:** To power the chatbot functionality.

It also integrates with the following for observability:

- **OpenTelemetry Collector:** For distributed tracing.
- **Stackdriver Profiler:** For performance profiling.

## Running the Service

To run the `frontend` service locally, you need to have the following environment variables set:

```bash
export PRODUCT_CATALOG_SERVICE_ADDR="localhost:3550"
export CURRENCY_SERVICE_ADDR="localhost:7000"
export CART_SERVICE_ADDR="localhost:7070"
export RECOMMENDATION_SERVICE_ADDR="localhost:8080"
export CHECKOUT_SERVICE_ADDR="localhost:5050"
export SHIPPING_SERVICE_ADDR="localhost:50051"
export AD_SERVICE_ADDR="localhost:9555"
export SHOPPING_ASSISTANT_SERVICE_ADDR="localhost:8000"
export COLLECTOR_SERVICE_ADDR="localhost:4317"
```

Then, you can run the service using the following command:

```bash
go run .
```

The service will be available at `http://localhost:8080`.