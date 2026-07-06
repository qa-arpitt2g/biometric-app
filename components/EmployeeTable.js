'use client';

import { useMemo, useState } from 'react';

const columns = [
  { key: 'employeeCode', label: 'Employee Code', className: 'min-w-[110px]' },
  { key: 'employeeName', label: 'Employee Name', className: 'min-w-[140px]' },
  { key: 'department', label: 'Department', className: 'min-w-[120px]' },
  { key: 'reportingPerson', label: 'Reporting Person', className: 'min-w-[130px]' },
  { key: 'hodEmail', label: 'HOD Email', className: 'min-w-[180px]' },
];

export default function EmployeeTable({ employees, onEdit, onDelete, isLoading = false }) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter((employee) =>
      columns.some((column) => String(employee[column.key] || '').toLowerCase().includes(query))
    );
  }, [employees, search]);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] overflow-hidden">
      <div className="px-4 py-4 sm:px-5 sm:py-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h4 className="font-title-lg text-title-lg text-primary shrink-0">Employee Data</h4>

        </div>
        {!isLoading && employees.length > 0 && (
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-secondary/20 border-t-secondary animate-spin mx-auto mb-3" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">Loading employee data...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto mb-3 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-3xl">table_view</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No employees yet. Upload an Excel file or add one above.
          </p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[min(58vh,560px)]">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-high/95 backdrop-blur-sm">
              <tr className="border-b border-outline-variant/30">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 font-label-caps text-label-caps text-on-surface-variant ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 font-body-md text-body-md text-on-surface truncate max-w-[240px]"
                      title={employee[column.key]}
                    >
                      {employee[column.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(employee)}
                        className="p-2 text-secondary hover:bg-secondary-container/30 rounded-lg transition-colors"
                        aria-label="Edit employee"
                      >
                        <span className="material-symbols-outlined text-[22px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(employee.id)}
                        disabled={deletingId === employee.id}
                        className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Delete employee"
                      >
                        <span className="material-symbols-outlined text-[22px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
