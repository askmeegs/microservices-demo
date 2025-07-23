curl -vvv -X POST http://localhost:8080/send_order_confirmation \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "order": {
    "order_id": "a24b-1d4f-4c8f-a329",
    "shipping_tracking_id": "1a2b3c4d",
    "shipping_cost": {
      "currency_code": "USD",
      "units": 12,
      "nanos": 990000000
    },
    "shipping_address": {
      "street_address": "1600 Amphitheatre Parkway",
      "city": "Mountain View",
      "state": "CA",
      "country": "USA",
      "zip_code": 94043
    },
    "items": [
      {
        "item": {
          "product_id": "OLJCESPC7Z",
          "quantity": 1
        },
        "cost": {
          "currency_code": "USD",
          "units": 10,
          "nanos": 0
        }
      },
      {
        "item": {
          "product_id": "66VCHSJNUP",
          "quantity": 2
        },
        "cost": {
          "currency_code": "USD",
          "units": 2,
          "nanos": 990000000
        }
      }
    ]
  }
}'