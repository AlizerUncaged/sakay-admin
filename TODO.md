# Admin Dashboard - TODO

## 1. Code Quality & Best Practices

### Redundant Components
- [x] Remove internal StatCard from app/page.tsx and import from components/common/StatCard.tsx

### Inefficient Data Fetching
- [ ] **app/drivers/page.tsx (lines 33-54)**: Backend should provide single endpoint for drivers with vehicle info

### Client-Side Filtering with Server-Side Pagination
- [x] **app/bookings/page.tsx**: Move search to server-side (pass searchQuery to api.getBookings with debounce)
- [x] **app/reviews/page.tsx**: Move search and rating filter to server-side

### State Management
- [x] Wrap fetchData in useCallback in app/page.tsx
- [x] Add useCallback to fetch functions in app/bookings/page.tsx
- [x] Add useCallback to fetch functions in app/reviews/page.tsx

### Poor Error Feedback
- [x] **app/drivers/[id]/page.tsx**: Replace alert() with toast
- [x] **app/reviews/page.tsx**: Replace alert() with toast
- [x] **app/users/[id]/page.tsx**: Replace alert() with toast
- [x] **app/users/page.tsx**: Replace alert() with toast

### Unsafe Type Assertions
- [ ] Create type guard for error objects instead of `err as { errors?: string[] }`

---

## 2. API Synchronization

### Mismatch in getDriver vs getRiders
- [ ] Create `/api/admin/drivers` endpoint that returns paginated Driver type with vehicle

### Unused API Parameters
- [x] **app/reviews/page.tsx**: Pass filterRating and debounced searchQuery to api.getReviews

### Inconsistent Filtering
- [ ] **app/drivers/[id]/page.tsx** and **app/users/[id]/page.tsx**: API should support fetching bookings by driverId/userId directly

---

## 4. Feature Completeness

### User/Driver Management
- [x] Add Edit functionality for users
- [x] Add Edit functionality for drivers
- [ ] Add ability to create Customer users
- [ ] Add ability to create Admin users

### Settings Page
- [x] Add input validation for settings (e.g., ensure ride_baseFare is positive number)
- [ ] Add description for what each setting does

### Dashboard Page
- [ ] Add data visualizations (line charts for trends)
- [ ] Implement proper trend comparison with historical data

### Action Logs
- [x] Create page to display data from api.getActionLogs()

### Notifications
- [ ] Implement real notification system (replace static red dot)

---

## 5. UI/UX Issues

### Non-functional Global Search
- [x] Either implement global search OR remove from layout (REMOVED)

### Driver Profile Navigation
- [x] Simplify: Remove View modal button, rename "Manage" to "View Details"

### Modal Closing Behavior
- [x] **components/modals/AddDriverModal.tsx**: Disable backdrop onClick to prevent data loss

### Pagination Components
- [ ] **app/bookings/page.tsx**: Use shared Pagination component
- [ ] **app/reviews/page.tsx**: Use shared Pagination component

---

## 6. Beta Release Priorities

### CRITICAL
1. [x] Fix data filtering (server-side) in bookings and reviews pages
2. [x] Implement Edit users/drivers functionality

### HIGH
3. [ ] Unify data fetching on drivers page
4. [x] Implement Action Logs UI

### MEDIUM
5. [x] Remove non-functional global search bar
6. [x] Standardize on reusable components (StatCard, Pagination)
7. [x] Replace alert() with toast/banner system

### LOW
8. [ ] Add data visualizations to dashboard
