'use client';

import { ReactNode } from 'react';
import QueryProvider from "@/app/providers/QueryProvider";
import { ContactsProvider } from "@/app/providers/ContactsProvider";
import { ProgressProvider } from "@/app/providers/ProgressProvider";
import { SubscriptionProvider } from "@/app/providers/SubscriptionProvider";
import { TechnicianProvider } from "@/app/providers/TechnicianProvider";
import { UserProvider } from "@/app/providers/UserProvider";
import { ChatProvider } from "@/app/providers/ChatProvider";
import SubscriptionPrefetcher from "@/app/components/SubscriptionPrefetcher";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
    <UserProvider>
      <TechnicianProvider>
        <ChatProvider>
          <SubscriptionPrefetcher />
          <ProgressProvider>
            <ContactsProvider>
              <SubscriptionProvider>
                {children}
              </SubscriptionProvider>
            </ContactsProvider>
          </ProgressProvider>
        </ChatProvider>
      </TechnicianProvider>
    </UserProvider>
    </QueryProvider>
  );
}
