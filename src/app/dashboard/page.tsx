'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminDashboardPage from '@/app/admin/page';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/profile');
    }
  }, [user, router]);

  if (user && user.role !== 'admin') {
    return null;
  }

  return <AdminDashboardPage />;
}
