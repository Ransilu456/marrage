# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

All POST requests require a secret token in the headers:

```http
x-proposal-token: your-secret-token
```

## Endpoints

### Submit Proposal Answer

Submit a YES or NO answer to the marriage proposal.

**Endpoint**: `POST /api/proposal`

**Headers**:
```http
Content-Type: application/json
x-proposal-token: your-secret-token
```

**Request Body**:
```json
{
  "answer": "YES",
  "message": "Optional message (max 1000 characters)",
  "recipientName": "Optional name for new proposal"
}
```

**Field Validation**:
- `answer`: Required, must be "YES" or "NO"
- `message`: Optional, max 1000 characters
- `recipientName`: Optional, required only if no proposal exists yet

**Success Response (200)**:
```json
{
  "success": true,
  "proposal": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "My Love",
    "answer": "YES",
    "message": "I love you so much!",
    "createdAt": "2026-01-17T13:00:00.000Z",
    "updatedAt": "2026-01-17T13:05:00.000Z"
  },
  "emailSent": true
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 400 Bad Request (Validation Error)
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_enum_value",
      "message": "Answer must be YES or NO",
      "path": ["answer"]
    }
  ]
}

// 400 Bad Request (Domain Error)
{
  "error": "Message is too long (max 1000 characters)"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

---

### Get Proposal Status

Retrieve the current proposal status.

**Endpoint**: `GET /api/proposal`

**Query Parameters**:
- `id` (optional): Specific proposal ID to retrieve

**Examples**:
```http
GET /api/proposal
GET /api/proposal?id=550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200)**:
```json
{
  "success": true,
  "proposal": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "My Love",
    "answer": "PENDING",
    "message": null,
    "createdAt": "2026-01-17T13:00:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses**:

```json
// 404 Not Found
{
  "error": "No proposal found"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

## Answer States

The `answer` field can have three values:

- `PENDING`: No answer submitted yet
- `YES`: Proposal accepted ✅
- `NO`: Proposal declined ❌

## Email Notifications

When a proposal is accepted (`answer: "YES"`), an email notification is automatically sent.

**Email Behavior**:
- Triggered only on YES responses
- Sent asynchronously (doesn't block the response)
- Failure to send email doesn't fail the request
- `emailSent` field in response indicates success

## Rate Limiting

> [!NOTE]
> Currently no rate limiting is implemented. For production use, consider adding rate limiting middleware.

## CORS

The API is configured for same-origin requests only. If you need to call the API from a different domain, update the Next.js configuration.

## Example Usage

### JavaScript/TypeScript

```typescript
// Submit YES answer
const response = await fetch('/api/proposal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-proposal-token': process.env.NEXT_PUBLIC_PROPOSAL_TOKEN!,
  },
  body: JSON.stringify({
    answer: 'YES',
    message: 'I love you so much! Of course I will!',
  }),
});

const data = await response.json();

if (data.success) {
  console.log('Proposal accepted!', data.proposal);
}
```

### cURL

```bash
# Submit answer
curl -X POST http://localhost:3000/api/proposal \
  -H "Content-Type: application/json" \
  -H "x-proposal-token: dev-secret-token-12345" \
  -d '{
    "answer": "YES",
    "message": "I love you!"
  }'

# Get status
curl http://localhost:3000/api/proposal
```

## Error Handling Best Practices

Always check the response status and handle errors appropriately:

```typescript
try {
  const response = await fetch('/api/proposal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-proposal-token': token,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    // Handle error
    console.error('Error:', result.error);
    if (result.details) {
      console.error('Validation errors:', result.details);
    }
    return;
  }

  // Success
  console.log('Success:', result.proposal);
} catch (error) {
  console.error('Network error:', error);
}
```
