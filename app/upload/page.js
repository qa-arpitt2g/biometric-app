import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { UploadCard, GuidelinesCard } from '@/components/UploadSection';
import UploadHistory from '@/components/UploadHistory';

export const metadata = {
  title: 'Upload Attendance - Tech2Globe',
  description: 'Sync employee attendance logs by uploading biometric exports.',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      
      <main className="ml-sidebar-width min-h-screen">
        <TopNavbar />
        
        <div className="p-lg max-w-[1440px] mx-auto">
          <div className="mb-lg">
            <h3 className="font-headline-md text-headline-md text-primary mb-xs">Upload Attendance</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sync employee attendance logs by uploading CSV or XLSX biometric exports.
            </p>
          </div>

          {/* Bento Layout for Upload & Guidelines */}
          <div className="grid grid-cols-12 gap-gutter mb-xl">
            <UploadCard />
            <GuidelinesCard />
          </div>

          {/* Upload History Section */}
          <UploadHistory />
        </div>
      </main>
    </div>
  );
}
