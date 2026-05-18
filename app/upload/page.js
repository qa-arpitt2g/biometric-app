import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import UploadWorkspace from '@/components/UploadWorkspace';

export const metadata = {
  title: 'Upload Attendance - Tech2Globe',
  description: 'Sync employee attendance logs by uploading biometric exports.',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 min-h-screen lg:ml-sidebar-width">
          <TopNavbar />
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-screen-2xl mx-auto">
            <div className="mb-4 sm:mb-8">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Upload Attendance</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Sync employee attendance logs by uploading CSV or XLSX biometric exports.
              </p>
            </div>
            <UploadWorkspace />
          </div>
        </main>
      </div>
    </div>
  );
}
