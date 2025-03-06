# Event API Specification

## Create Event

Request Body:
```json
{
  "event": {
    "title": "Annual Developer Conference 2025",
    "description": "Join us for the latest in web development trends and networking opportunities.",
    "organizer": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tech Innovators Group"
    },
    "dateTime": {
      "type": "range",
      "startDate": "1999-01-08",
      "endDate": "1999-01-08",
      "startTime": "1741297391",
      "endTime": "1741297391"
    },
    "format": {
      "type": "hybrid",
      "onsite": {
        "venueName": "Tech Convention Center",
        "address": {
          "street": "123 Innovation Blvd",
          "city": "San Francisco",
          "state": "CA",
          "postalCode": "94107",
          "country": "USA"
        },
        "coordinates": {
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "mapUrl": "https://maps.example.com/?q=37.7749,-122.4194",
        "venueNotes": "Enter through the main lobby, registration is on the second floor."
      },
      "online": {
        "platform": "zoom",
        "platformUrl": "https://zoom.us/j/123456789?pwd=abcdefghijklmn"
      }
    },
    "category": "technology",
    "capacity": {
      "total": 500,
      "onsite": 300,
      "online": 200
    },
    "contact": {
      "email": "events@techinnovators.com",
      "phone": "+1-555-123-4567",
      "website": "https://techinnovators.com/events"
    },
  "coverImage": "https://example.com/images/event-cover.jpg",
    "additionalInfo": {
      "agenda": {
        "items": [
          {
            "startTime": "2025-04-15T09:00:00Z",
            "endTime": "2025-04-15T09:00:00Z",
            "event": "event name"
          },
          {
            "startTime": "2025-04-15T09:00:00Z",
            "endTime": "2025-04-15T09:00:00Z",
            "event": "event name"
          }
        ]
      },
      "faq": [
        {
          "question": "where is the parking lot?",
          "answer": "something"
        }
      ]
    }
  }
}
```

## Create Ticket

Request Body:
```json

```