# Tier API Specification

## Get All Tier of Event
Endpoint: (GET) /api/events/{eventId}/tier

## Create Tier
Endpoint: (POST) /api/events/{eventId}/tier

Header: 
- Authorization: Bearer {jwt}

Body:
- Request Body (Valid):
```json
{
  "name": "gold",
  "price": 1000,
  "capacity": 10,
  "currency": "idr",
  "icon": "basic",
  "iconColor": "#ffffff",
  "format": "ONSITE",
  "benefits": [
    "merch",
    "keychains"
  ]
}
```

- Response Body (Success)
```json

```

## Patch Tier
Endpoint: (PATCH) /api/events/{eventId}/tier/{tierId}

Header:
- Authorization: Bearer {jwt}

Body:
- Request Body (Valid): Changing tier price
```json
{
	"price": 100000
}
```

## Delete Tier
Endpoint: (DELETE) /api/events/{eventId}/tier/{tierId}