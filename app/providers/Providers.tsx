'use client';

import { ContactsProvider } from "@/app/providers/ContactsProvider";
import { ProgressProvider } from "@/app/providers/ProgressProvider";
import { SubscriptionProvider } from "@/app/providers/SubscriptionProvider";
import { TechnicianProvider } from "@/app/providers/TechnicianProvider";
import { UserProvider } from "@/app/providers/UserProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TechnicianProvider>
        <ProgressProvider>
          <ContactsProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </ContactsProvider>
        </ProgressProvider>
      </TechnicianProvider>
    </UserProvider>
  );
}
