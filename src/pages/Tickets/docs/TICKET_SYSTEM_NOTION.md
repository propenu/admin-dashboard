# Propenu Ticket System Frontend Plan
## Backend Contract Read

Backend files were inspected only. No backend code was changed.
Gateway proxies:

- `/api/tickets`
- `/api/ticket-comments`
- `/api/ticket-attachments`
- `/api/ticket-categories`
- `/api/ticket-dashboard`
- `/api/ticket-departments`

## Ticket APIs

### Dashboard

`GET /api/ticket-dashboard/overview`

Query:

- `from?: ISODate`
- `to?: ISODate`

Response data:

- `totals`
- `open`
- `overdue`
- `unassigned`
- `byStatus: [{ _id, count }]`
- `byPriority: [{ _id, count }]`
- `byDepartment: [{ _id, count }]`
- `assignmentLoad: [{ _id, agent, count }]`
- `sla: { avgFirstResponseMinutes, avgResolutionMinutes }`
- `recent: TicketSummary[]`

`GET /api/ticket-dashboard/trends?days=14`

`GET /api/ticket-dashboard/agents?department=support`

### Tickets

`GET /api/tickets`

Query:

- `page`, `limit`
- `q`
- `status`
- `priority`
- `category`
- `department`
- `assignedTo`
- `assignedRole`
- `assignedOrRequested` (returns tickets where the user is either requester or assignee)
- `requesterId`
- `requesterEmail`
- `propertyId`
- `module` (matches `metadata.module`)
- `relatedProjectId` (matches either `propertyId` or `metadata.relatedProjectId`)
- `tag`
- `overdue=true|false`
- `createdFrom`, `createdTo`
- `sortBy=createdAt|updatedAt|priority|dueAt|status`
- `sortOrder=asc|desc`

`POST /api/tickets`

Payload:

```json
{
  "title": "Unable to contact property owner",
  "description": "The owner is not reachable after repeated attempts.",
  "requester": {
    "userId": "optional",
    "name": "Requester name",
    "email": "requester@example.com",
    "phone": "optional"
  },
  "category": "account-access",
  "department": "support",
  "propertyId": "optional",
  "bookingId": "optional",
  "assignedTo": {
    "userId": "optional",
    "name": "Agent name",
    "email": "agent@example.com",
    "role": "customer_care"
  },
  "priority": "medium",
  "source": "admin",
  "tags": ["support"],
  "dueAt": "2026-07-09T10:00:00.000Z",
  "attachments": [
    {
      "url": "https://...",
      "name": "screenshot.png",
      "mimeType": "image/png",
      "size": 245000
    }
  ],
  "metadata": {}
}
```

`GET /api/tickets/:id`

`PATCH /api/tickets/:id`

`DELETE /api/tickets/:id`

`PATCH /api/tickets/:id/status`

```json
{
  "status": "in_progress",
  "reason": "Agent started verification",
  "actor": {
    "userId": "admin-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

`PATCH /api/tickets/:id/assign`

```json
{
  "assignedTo": {
    "userId": "agent-id",
    "name": "Agent User",
    "email": "agent@example.com",
    "role": "customer_care"
  },
  "actor": {
    "userId": "admin-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

`PATCH /api/tickets/:id/priority`

```json
{
  "priority": "high",
  "reason": "SLA risk",
  "actor": {
    "userId": "admin-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

`POST /api/tickets/:id/comments`

```json
{
  "message": "We are checking this now.",
  "visibility": "public",
  "author": {
    "userId": "admin-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "super_admin"
  },
  "attachments": []
}
```

### Supporting Admin APIs

Categories:

- `GET /api/ticket-categories`
- `POST /api/ticket-categories`
- `GET /api/ticket-categories/:id`
- `PATCH /api/ticket-categories/:id`
- `DELETE /api/ticket-categories/:id`

Departments:

- `GET /api/ticket-departments`
- `POST /api/ticket-departments`
- `GET /api/ticket-departments/:id`
- `PATCH /api/ticket-departments/:id`
- `DELETE /api/ticket-departments/:id`
- `POST /api/ticket-departments/:id/members`
- `DELETE /api/ticket-departments/:id/members/:userId`

Attachments:

- `GET /api/ticket-attachments`
- `POST /api/ticket-attachments`
- `POST /api/ticket-attachments/tickets/:ticketId`
- `GET /api/ticket-attachments/:id`
- `PATCH /api/ticket-attachments/:id/scan-status`
- `DELETE /api/ticket-attachments/:id`

## Frontend UX Direction

The admin dashboard should expose one compact ticket workspace:

- Overview: KPI cards, status/priority/department/SLA/recent tickets.
- Queue: searchable operational queue with filters and right-side detail panel.
- Ticket detail: requester, department, priority, status, assignment, due date, comments, activities, attachments.
- New ticket: admin-created ticket with requester, department, priority, source, due date, property id, tags.
- Config: lightweight category/department visibility for super admin operations.

## Role Behavior

- `super_admin`: full workspace, dashboard, queue, new ticket, assignment/status/priority actions, config visibility.
- `admin` and `customer_care`: queue-first operational workspace, can reply and change ticket workflow fields.
- `builder`, `agent`, `user`: requester-focused mode can be supported with `requesterId` or `requesterEmail` filters when these roles are opened in this dashboard shell.

## Frontend Structure

```text
src/features/ticket/ticket_system.js
src/pages/Tickets/
  TicketDashboard.jsx
  constants/ticketOptions.js
  docs/TICKET_SYSTEM_NOTION.md
  hooks/
    useTicketDashboard.js
    useTicketWorkspace.js
  utils/
    ticketFormatters.js
    ticketNormalizers.js
  components/
    overview/*
    workspace/*
```

## Implementation Notes

- Keep backend payload names exactly as backend validation expects.
- Normalize backend statuses with underscores, not old hyphenated values.
- Use TanStack Query for all server state.
- Keep page compact because global layout already provides navbar/sidebar/padding.
- Use optimistic-light refetch after mutations to keep code stable and simple.
