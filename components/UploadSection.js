import Image from 'next/image';

export function UploadCard({
  selectedFile,
  uploadProgress = 0,
  isProcessing = false,
  error = '',
  onFileSelect,
  onClearFile,
  onProcess,
}) {
  const fileName = selectedFile?.name || 'No file selected';

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-[0px_4px_20px_rgba(26,43,76,0.05)]">
      {error && (
        <div className="mb-4 bg-error-container/20 text-error border border-error/20 rounded-lg p-4 flex items-center gap-3 animate-shake">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="font-body-sm text-body-sm font-medium">{error}</p>
        </div>
      )}

      <label className="border-2 border-dashed border-secondary/30 bg-surface-container-low/30 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center group hover:border-secondary transition-all cursor-pointer">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="sr-only"
          onChange={(event) => onFileSelect?.(event.target.files?.[0])}
        />
        <div className="w-14 h-14 bg-secondary-container/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-secondary text-4xl">upload_file</span>
        </div>
        <h4 className="font-title-lg text-title-lg text-primary mb-2">Drag & drop your files here</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Maximum file size: 25MB. Supported formats: .csv, .xlsx</p>
        <span className="inline-flex w-full sm:w-auto min-h-[44px] px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:shadow-lg transition-all active:scale-[0.98]">
          Browse Files
        </span>
      </label>

      <div className="mt-6 p-4 sm:p-5 bg-surface-container-high/20 rounded-lg border border-outline-variant/20 flex flex-col gap-4">
        <div className="p-xs bg-secondary-container/30 rounded">
          <span className="material-symbols-outlined text-secondary">description</span>
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="font-body-md text-body-md font-semibold text-primary truncate">{fileName}</span>
            <span className="font-label-caps text-label-caps text-secondary">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
        <button
          className="p-2 hover:bg-error-container/20 text-error rounded-full transition-colors disabled:opacity-30 self-end sm:self-auto"
          disabled={!selectedFile || isProcessing}
          onClick={onClearFile}
          type="button"
          aria-label="Clear selected file"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        <button
          className="w-full sm:w-auto px-5 py-3 bg-secondary text-on-secondary rounded-lg font-bold shadow-md hover:bg-secondary-fixed-dim/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedFile || isProcessing}
          onClick={onProcess}
          type="button"
        >
          <span className="material-symbols-outlined">bolt</span>
          {isProcessing ? 'Processing...' : 'Process Attendance'}
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
            Include Employee Code, Employee Name, and punch timestamp columns.
          </li>
          <li className="flex gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed-variant text-[20px]">check_circle</span>
            Date and time can be combined or provided as separate Excel columns.
          </li>
          <li className="flex gap-sm">
            <span className="material-symbols-outlined text-secondary-fixed-variant text-[20px]">check_circle</span>
            Multiple punches are paired sequentially to calculate login and break time.
          </li>
        </ul>
        {/* <button className="mt-lg w-full py-xs border border-secondary text-secondary rounded-lg font-bold text-body-sm hover:bg-secondary/5 transition-all">
          Download Sample Template
        </button> */}
      </div>
      <div className="relative rounded-xl overflow-hidden h-40 group hidden sm:block">
        <Image
          alt="Data Analytics"
          src="/assets/data-analytics.png"
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-md">
          <p className="text-on-primary font-body-sm">Automated reconciliation detects 99.8% of anomalies.</p>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden h-40 group hidden sm:block">
        <Image
          alt="Attendance Analytics"
          src="/assets/attendance-analytics.png"
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-transparent flex items-end p-md">
          <p className="text-on-primary font-body-sm text-on-secondary">Advanced HR analytics provide real-time attendance insights.</p>
        </div>
      </div>
    </div>
  );
}
