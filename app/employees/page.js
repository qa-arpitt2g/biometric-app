import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import EmployeeWorkspace from '@/components/EmployeeWorkspace';

export const metadata = {
  title: 'Employees - Tech2Globe',
  description: 'Manage employee records with Excel upload or manual entry.',
};

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 min-h-screen min-w-0 overflow-x-hidden lg:ml-sidebar-width">
          <TopNavbar />
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 max-w-7xl mx-auto min-w-0">
            <EmployeeWorkspace />
          </div>
        </main>
      </div>
    </div>
  );
}
