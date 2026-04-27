# ChairFill UI Library Documentation

This document provides a detailed reference for the reusable UI components, layout elements, and shared hooks used across the ChairFill application.

---

## UI Components (`app/components/ui`)

### AuthCard
A container component for authentication forms and cards, providing consistent styling and rounding.

**Props**:
- `children`: `React.ReactNode` - The form elements or content inside the card.
- `rounded`: `boolean` (optional) - If true, uses the `AUTH_CARD_ROUNDED` style (ideal for multi-step registration).
- `className`: `string` (optional) - Additional Tailwind classes for customization.

**Implementation Example**:
```tsx
import AuthCard from "@/app/components/ui/AuthCard";

export default function LoginPage() {
  return (
    <AuthCard rounded={true} className="shadow-2xl">
      <h1>Login to your account</h1>
      <form>...</form>
    </AuthCard>
  );
}
```

### AuthenticatedAvatar
A robust avatar component that securely fetches images from S3 using the user's JWT. It handles loading states and cache-busting automatically.

**Props**:
- `src`: `string | null` - The API path for the user's avatar.
- `alt`: `string` - Descriptive text for the image.
- `className`: `string` (optional) - CSS classes for styling the image.
- `fallback`: `React.ReactNode` (optional) - Element shown if no image is available or while loading.

**Implementation Example**:
```tsx
import AuthenticatedAvatar from "@/app/components/ui/AuthenticatedAvatar";
import { UserCircle } from "lucide-react";

const MyProfile = ({ user }) => (
  <AuthenticatedAvatar
    src={user.avatar_url}
    alt={user.full_name}
    className="w-12 h-12 rounded-full border-2 border-primary"
    fallback={<UserCircle className="w-12 h-12 text-zinc-600" />}
  />
);
```

### RichText
Safely renders text containing basic markdown formatting like bold text and bullet points.

**Props**:
- `text`: `string` - The formatted string to render.
- `className`: `string` (optional) - Container styling.

**Implementation Example**:
```tsx
import RichText from "@/app/components/ui/RichText";

const serviceDescription = `
**Service Includes:**
- Precision haircut
- Hot towel shave
- Beard sculpting
`;

<RichText text={serviceDescription} className="text-zinc-400" />
```

### Form Alerts (Error & Success)
Simple, standardized components for displaying feedback messages.

**Implementation Example**:
```tsx
import FormError from "@/app/components/ui/FormError";
import FormSuccess from "@/app/components/ui/FormSuccess";

{error && <FormError message={error} />}
{success && <FormSuccess message="Changes saved!" />}
```

---

## Layout Components (`app/components/layout`)

### Header
The global application header. It handles responsive navigation, user profile menus, and the technician dashboard links.

### BottomNav
The mobile-optimized navigation bar shown at the bottom of the viewport.

### Conditional Wrappers
`ConditionalHeader` and `ConditionalBottomNav` are used to prevent the main navigation from appearing on specific pages (like `/login`, `/signup`, or public booking pages).

---

## Feature-Specific Components

### Calendar (`app/features/bookings/components/Calendar.tsx`)
A high-performance calendar for the technician dashboard.

**Key Props**:
- `selectedDate`: `Date`
- `availability`: `Availability` (Weekly schedule)
- `dailyEntries`: `Record<string, CalendarDailyEntry>` (Overrides & Bookings)
- `onDateSelect`: `(date: Date) => void`

**Implementation Example**:
```tsx
<Calendar
  selectedDate={selectedDate}
  availability={weeklyAvailability}
  dailyEntries={calendarData?.daily_entries}
  onDateSelect={(date) => setSelectedDate(date)}
/>
```

---

## Reusable Hooks (`lib/hooks`)

### useModal
Used to manage common modal interactions.

**Usage Example**:
```ts
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";

export default function MyModal({ isOpen, onClose }) {
  useModalKeyboard(isOpen, onClose); // Closes on Escape
  useModalScrollLock(isOpen);        // Prevents body scroll
  
  if (!isOpen) return null;
  return <div>...</div>;
}
```

### useBalanceVisibility
Used to toggle the visibility of financial data (balances, payouts) globally.

**Usage Example**:
```ts
import { useBalanceVisibility } from "@/lib/hooks/use-balance-visibility";

const WalletBalance = ({ balance }) => {
  const { isVisible, toggleVisibility, maskValue } = useBalanceVisibility();
  
  return (
    <div onClick={toggleVisibility}>
      {isVisible ? `$${balance}` : maskValue(balance)}
    </div>
  );
}
```
