export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Subscription
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Manage your subscription plan
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Subscription content will be displayed here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
