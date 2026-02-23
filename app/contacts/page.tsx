'use client';

import { useContacts } from '@/app/providers/ContactsProvider';
import PageLoader from '@/app/components/ui/PageLoader';
import ContactsList from '@/app/features/contacts/components/ContactsList';

export default function ContactsPage() {
  const { isLoaded } = useContacts();

  if (!isLoaded) {
    return <PageLoader message="Loading contacts..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-12 sm:pt-28 pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ContactsList />
        </div>
      </main>
    </div>
  );
}
