# Testing Checklist

## Automated checks

Run from the project root:

```bash
npm test
npm run build
```

The unit suite covers macro calculations, progress summaries and client authorization rules.

## Authentication

- User registration issues a token.
- Dietitian registration remains pending.
- Pending dietitian cannot log in.
- Admin can approve the dietitian.
- Wrong password returns `401` without revealing which field failed.
- Suspended account cannot log in.

## Client profiles

- Dietitian sees only assigned clients.
- User sees only their own profile.
- Admin can view all clients.
- Duplicate client profile is rejected.
- Invalid height, weight and calorie values are rejected.

## Meal plans

- Assigned dietitian can create, edit and delete a plan.
- Unassigned dietitian receives `403`.
- User can read but cannot modify a plan.
- Nutrient totals equal the sum of embedded food items.
- End date cannot precede start date.

## Progress

- User can log progress only for their own profile.
- Dietitian can record progress for an assigned client.
- Charts update after create, edit and delete.
- Adherence outside 0–100 is rejected.
- Summary accurately calculates averages and weight change.

## Responsive UI

Test at widths 360, 768, 1024 and 1440 pixels. Verify mobile bottom navigation, scrollable tables, form labels, chart resizing and keyboard focus.

## Postman

Import the included collection, run Login, then exercise clients, meal plans, progress and administration. The login test stores the returned token automatically.
