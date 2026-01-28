import ContactsList from "@/app/features/contacts/components/ContactsList";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Contacts
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Manage your contacts
            </p>
          </div>
          <ContactsList />
        </div>
      </main>
    </div>
  );
}
