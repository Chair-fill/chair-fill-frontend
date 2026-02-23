'use client';

import { useTechnician } from '@/app/providers/TechnicianProvider';
import PageLoader from '@/app/components/ui/PageLoader';
import BarberServicesForm from '@/app/features/profile/components/BarberServicesForm';

export default function ServicesPage() {
  const { technician, isTechnicianLoading } = useTechnician();

  if (isTechnicianLoading) {
    return <PageLoader message="Loading…" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-12 sm:pt-28 pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <BarberServicesForm />
        </div>
      </main>
    </div>
  );
}
