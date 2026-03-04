"use client";

import { useEffect } from "react";
import { useContacts } from "@/app/providers/ContactsProvider";
import { useUser } from "@/app/providers/UserProvider";
import PageLoader from "@/app/components/ui/PageLoader";
import ContactsList from "@/app/features/contacts/components/ContactsList";

export default function ContactsPage() {
  const { isLoaded } = useContacts();
  const { user, refetchProfile } = useUser();

  // Fetch full profile (including avatar) when on contacts screen, especially after initial login
  useEffect(() => {
    if (user) refetchProfile();
  }, [user?.id, refetchProfile]);

  if (!isLoaded) {
    return <PageLoader message="Loading contacts..." />;
  }

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ContactsList />
        </div>
      </main>
    </div>
  );
}
