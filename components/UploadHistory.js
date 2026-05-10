export default function UploadHistory() {
  const historyData = [
    { name: 'attendance_may_final.xlsx', date: 'Jun 12, 2024, 09:45 AM', records: '1,240 Rows', status: 'Processed' },
    { name: 'night_shift_logs_week23.csv', date: 'Jun 08, 2024, 04:12 PM', records: '450 Rows', status: 'Processed' },
    { name: 'biometric_raw_export_122.csv', date: 'Jun 05, 2024, 11:20 AM', records: '3,100 Rows', status: 'Failed' },
    { name: 'contractor_attendance_revised.xlsx', date: 'Jun 01, 2024, 08:30 AM', records: '85 Rows', status: 'Processed' },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] overflow-hidden">
      <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
        <h4 className="font-title-lg text-title-lg text-primary">Upload History</h4>
        <button className="flex items-center gap-xs text-body-sm text-secondary font-bold hover:underline">
          View Detailed Log
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps sticky top-0">
            <tr>
              <th className="px-lg py-sm">File Name</th>
              <th className="px-lg py-sm">Date Uploaded</th>
              <th className="px-lg py-sm">Records</th>
              <th className="px-lg py-sm">Status</th>
              <th className="px-lg py-sm">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm text-on-surface">
            {historyData.map((row, index) => (
              <tr key={index} className="hover:bg-secondary-container/5 transition-colors group">
                <td className="px-lg py-md font-semibold text-primary">{row.name}</td>
                <td className="px-lg py-md">{row.date}</td>
                <td className="px-lg py-md">{row.records}</td>
                <td className="px-lg py-md">
                  <span className={`inline-flex items-center gap-xs px-sm py-1 rounded-full text-xs font-bold ${
                    row.status === 'Processed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-error-container text-on-error-container'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${row.status === 'Processed' ? 'bg-secondary' : 'bg-error'}`}></span>
                    {row.status}
                  </span>
                </td>
                <td className="px-lg py-md">
                  {row.status === 'Processed' ? (
                    <button className="p-xs hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-all">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  ) : (
                    <button className="flex items-center gap-xs text-error font-bold text-xs hover:underline">
                      View Errors
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant/30 flex justify-between items-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Showing 4 of 24 upload events</p>
        <div className="flex gap-xs">
          <button className="p-xs border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-xs border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
