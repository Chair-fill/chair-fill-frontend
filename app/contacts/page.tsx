import ContactsList from "../components/ContactsList";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Contacts
            </h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your contacts
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <ContactsList />
        </div>
      </main>
    </div>
  );
}
