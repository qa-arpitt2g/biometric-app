import Image from 'next/image';

export function UploadCard() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-[0px_4px_20px_rgba(26,43,76,0.05)]">
      <div className="border-2 border-dashed border-secondary/30 bg-surface-container-low/30 rounded-xl p-xl flex flex-col items-center justify-center text-center group hover:border-secondary transition-all cursor-pointer">
        <div className="w-16 h-16 bg-secondary-container/50 rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-secondary text-4xl">upload_file</span>
        </div>
        <h4 className="font-title-lg text-title-lg text-primary mb-xs">Drag & drop your files here</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Maximum file size: 25MB. Supported formats: .csv, .xlsx</p>
        <button className="px-lg py-sm bg-primary text-on-primary rounded-lg font-bold hover:shadow-lg transition-all active:scale-[0.98]">
          Browse Files
        </button>
      </div>

      {/* File Validation UI (Active state mock) */}
      <div className="mt-lg p-md bg-surface-container-high/20 rounded-lg border border-outline-variant/20 flex items-center gap-md">
        <div className="p-xs bg-secondary-container/30 rounded">
          <span className="material-symbols-outlined text-secondary">description</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-xs">
            <span className="font-body-md text-body-md font-semibold text-primary">Biometric_Logs_June_2024.xlsx</span>
            <span className="font-label-caps text-label-caps text-secondary">65%</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        <button className="p-xs hover:bg-error-container/20 text-error rounded-full transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="mt-lg flex justify-end">
        <button className="px-xl py-sm bg-secondary text-on-secondary rounded-lg font-bold shadow-md hover:bg-secondary-fixed-dim/90 transition-all active:scale-[0.98] flex items-center gap-sm">
          <span className="material-symbols-outlined">bolt</span>
          Process Attendance
        </button>
      </div>
    </div>
  );
}

export function GuidelinesCard() {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-gutter">
      <div className="glass-panel border border-outline-variant/30 rounded-xl p-md shadow-sm">
        <h4 className="font-title-lg text-title-lg text-primary mb-md flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary">info</span>
          Upload Guidelines
        </h4>
        <ul className="space-y-sm text-body-sm text-on-surface-variant">
          <li className="flex gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed-variant text-[20px]">check_circle</span>
            Ensure column headers match: EmployeeID, Date, CheckIn, CheckOut.
          </li>
          <li className="flex gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed-variant text-[20px]">check_circle</span>
            Dates must follow YYYY-MM-DD format.
          </li>
          <li className="flex gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed-variant text-[20px]">check_circle</span>
            Duplicate entries will be automatically flagged for review.
          </li>
        </ul>
        <button className="mt-lg w-full py-xs border border-secondary text-secondary rounded-lg font-bold text-body-sm hover:bg-secondary/5 transition-all">
          Download Sample Template
        </button>
      </div>
      <div className="relative rounded-xl overflow-hidden h-40 group">
        <Image
          alt="Data Analytics"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcS7NczTqNgiVBTIc4l9PQsFHuEuRYGpQVuPp6gESC95vhreXn5cTCsjG4PBYE5a9k81YwHRhR-kUXOf1qbyYIlVD5Aloh3FN8zrYpZ83AfJlpz9iXLkXnw_cqaZE3hWVdE3GwWvMh8WTDwIh2O2T6OUj_i1OCLFJi3ucG2BuikN98zpcQKVBqqeyDQAnhQA4XxZxtqRD2ftcEO1_KsFz2XYaj8a1ED9Pg9p4vHgzPrZSOSgo5TFHnZgFwq4j7Ti-E5tvuOpIw7xU"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-md">
          <p className="text-on-primary font-body-sm">Automated reconciliation detects 99.8% of anomalies.</p>
        </div>
      </div>
    </div>
  );
}
