'use client';

import { ContactsProvider } from "@/app/providers/ContactsProvider";
import { SubscriptionProvider } from "@/app/providers/SubscriptionProvider";
import { UserProvider } from "@/app/providers/UserProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ContactsProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </ContactsProvider>
    </UserProvider>
  );
}
