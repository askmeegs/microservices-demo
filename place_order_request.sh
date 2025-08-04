#!/bin/bash
curl -X POST -H "Content-Type: application/json" \
-d '{ "user_id": "12345", "user_currency": "USD", "address": { "street_address": "1600 Amphitheatre Parkway", "city": "Mountain View", "state": "CA", "country": "USA", "zip_code": 94043 }, "email": "test@example.com", "credit_card": { "credit_card_number": "4000-1234-5678-9010", "credit_card_cvv": 123, "credit_card_expiration_year": 2028, "credit_card_expiration_month": 10 } }' \
http://localhost:8080/placeorder
