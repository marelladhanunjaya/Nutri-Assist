# REST API Reference

Base URL: `http://localhost:5000/api`

Protected routes require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

## Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register user or dietitian |
| POST | `/auth/login` | Public | Authenticate active account |
| GET | `/auth/me` | Authenticated | Return current safe profile |

Dietitian registration creates a `pending` account and does not issue a token.

## Clients

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/clients` | All roles | List authorized clients |
| GET | `/clients/mine` | User | Return own client profile |
| GET | `/clients/unassigned-users` | Dietitian/Admin | Users without a client profile |
| GET | `/clients/:id` | Authorized relation | Return one client |
| POST | `/clients` | Dietitian/Admin | Create client profile |
| PUT | `/clients/:id` | Assigned dietitian/Admin | Replace client profile fields |
| DELETE | `/clients/:id` | Assigned dietitian/Admin | Delete client profile |

## Meal plans

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/meal-plans` | All roles | List authorized plans |
| GET | `/meal-plans/:id` | Authorized relation | Return one plan and macro distribution |
| POST | `/meal-plans` | Dietitian/Admin | Create plan |
| PUT | `/meal-plans/:id` | Assigned dietitian/Admin | Update plan |
| DELETE | `/meal-plans/:id` | Assigned dietitian/Admin | Delete plan |

Filters: `client` and `status`.

## Progress

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/progress` | All roles | List authorized entries and summary |
| POST | `/progress` | Authorized relation | Create entry |
| PUT | `/progress/:id` | Authorized relation | Update entry |
| DELETE | `/progress/:id` | Authorized relation | Delete entry |

Filters: `client`, `from` and `to`.

## Administration

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | Admin | Platform counts and recent accounts |
| GET | `/admin/users` | Admin | List accounts |
| PATCH | `/admin/users/:id` | Admin | Change role or status |

## Response contract

Successful responses contain `success: true`. Failed responses use:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

Important statuses: `400` validation, `401` authentication, `403` authorization, `404` missing resource, `409` duplicate conflict and `500` unexpected error.
