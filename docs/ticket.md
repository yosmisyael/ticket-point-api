# Ticket API Specification

## Booking an Ticket
Endpoint: (POST) /api/tickets/booking

Body:
- Request Body (Valid):
```json
{
	"email": "alex@gmail.com",
	"firstName": "alex",
	"lastName": "turner",
	"organization": "pens",
	"position": "student",
	"phone": "12039812",
	"tierId": 1
}
```

## Validate Payment and Generate Ticket
Endpoint: (POST) /api/tickets/booking/{bookingId}

Body:
- Request Body (Valid):
```json
{
}
```

- Response Body (Success)
```json

```

## Validate Ticket for Check In
Endpoint: (PATCH) /api/tickets/booking/{bookingId}

Header:
- Authorization: Bearer {jwt}

Body:
- Request Body (Valid)
```json
{
	"credential": "f2512d02-8ffd-4331-872d-39c11b9dfdfa"
}
```

## Get User Data by Ticket ID
Endpoint: (GET) /api/tickets/{ticketId}

Header:
- Authorization: Bearer {jwt}

## Get All Attendances of Event
Endpoint: (GET) /api/tickets/attendances/{eventId}

Header:
- Authorization: Bearer {jwt}
