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
          <div className="px-4 py-6 sm:px-6 lg:px-lg lg:py-lg max-w-[1440px] mx-auto">
            <div className="mb-lg">
              <h3 className="font-headline-md text-headline-md text-primary mb-xs">Upload Attendance</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
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
