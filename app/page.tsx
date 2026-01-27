import ContactUpload from "./components/ContactUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Contact Upload
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Upload your contacts via CSV or VCF format
          </p>
        </div>
        <ContactUpload />
      </main>
    </div>
  );
}
