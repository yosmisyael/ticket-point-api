# Event API Specification

## Get All Published Events
Endpoint: (GET) /api/events/search

## Get Event by Id
Endpoint: (GET) /api/events/{event_id}

## Search Event
Endpoint: (GET) /api/events/search?

Query:

- title (string)
- category (string)
- organizer (string)
- location (string)
- time (option: tomorrow, this weekend)

## Create Event
Endpoint: (GET) /api/events 

Header:
- Authorization: Bearer {jwt}

Body:
- Request Body (Valid):
```json
{
  "event": {
    "title": "Global AI Summit 2025",
    "description": "Explore the future of artificial intelligence with leading experts, hands-on workshops, and networking opportunities.",
    "organizer": {
      "id": "987f6543-e21b-45d6-a789-567812345000",
      "name": "AI Future Labs"
    },
    "startDate": "2025-09-10",
    "endDate": "2025-09-12",
    "startTime": 1757520000,
    "endTime": 1757692800,
    "format": {
      "type": "HYBRID",
      "onsite": {
        "venue": "San Francisco Conference Center",
        "address": "747 Howard St, San Francisco, CA 94103",
        "latitude": 37.7849,
        "longitude": -122.4004,
        "mapUrl": "https://maps.example.com/?q=37.7849,-122.4004"
      },
      "online": {
        "platform": "Microsoft Teams",
        "platformUrl": "https://teams.microsoft.com/l/meetup-join/19%3ameeting_1234567890"
      }
    },
    "category": "artificial-intelligence",
    "contact": {
      "email": "info@aifuturelabs.com",
      "phone": "+16505551234",
      "website": "https://aifuturelabs.com/summit2025"
    },
    "additionalInfo": {
      "agenda": {
        "items": [
          {
            "startTime": 1757523600,
            "endTime": 1757527200,
            "title": "Welcome Address"
          },
          {
            "startTime": 1757527200,
            "endTime": 1757534400,
            "title": "Keynote: The Future of AI in Healthcare"
          },
          {
            "startTime": 1757534400,
            "endTime": 1757538000,
            "title": "Workshop: Building Ethical AI Systems"
          }
        ]
      },
      "faq": [
        {
          "question": "Is there a dress code?",
          "answer": "Business casual is recommended for all attendees."
        },
        {
          "question": "Can I attend both onsite and online?",
          "answer": "Yes, you can switch between onsite and online participation at any time."
        }
      ]
    }
  }
}
```

- Response Body (Success):
```json
{
  "data": {
    "message": "success",
    "id": 1
  }
}
```

## Update Event
Endpoint: (PATCH) /api/events/{event_id}

Header:
- Authorization: Bearer {jwt}

Body:
- Request Body (Valid):
    Example updating event title
```json
{
  "title": "Updated new Title"
}
```
- Response Body (Success):
```json
{
  "data": {
    "message": "success",
    "id": 1
  }
}
```

## Delete Event
Endpoint: (DELETE) /api/events/{event_id}

Header:
- Authorization: Bearer {jwt}
