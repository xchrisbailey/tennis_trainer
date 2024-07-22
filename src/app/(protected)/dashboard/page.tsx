import { validateRequest } from '@/lib/auth';
import { DashboardView } from './dashboard_view';
import { Suspense } from 'react';

export default async function Page() {
  const { user } = await validateRequest();

  return (
    <Suspense>
      <DashboardView user={user} />
    </Suspense>
  );
}
