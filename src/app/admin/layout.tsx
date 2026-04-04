import { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import HidePublicChrome from '@/components/admin/HidePublicChrome';

export const metadata: Metadata = {
  title: 'Admin | Indubienes',
  description: 'Panel administrativo de Indubienes',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HidePublicChrome />
      <div className="fixed inset-0 z-[999] flex min-h-screen bg-[#0D0D0D] overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
