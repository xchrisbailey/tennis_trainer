'use client';
import { User } from 'lucia';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function DashboardView(props: { user: User | null }) {
  const router = useRouter();

  if (!props.user || props.user.role !== 'admin') {
    toast.error('You do not have permission to view this page', { id: 'unauthorized' });
    router.push('/');
  }

  return (
    <>
      <h1>Dashboard</h1>
    </>
  );
}
