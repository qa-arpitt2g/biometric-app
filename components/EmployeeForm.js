'use client';

import { useState } from 'react';

const emptyForm = {
  employeeCode: '',
  employeeName: '',
  department: '',
  reportingPerson: '',
  hodEmail: '',
};

export default function EmployeeForm({ onSubmit, onCancel, initialValues = null, isEditing = false, isSubmitting = false }) {
  const [form, setForm] = useState(initialValues || emptyForm);
  const [error, setError] = useState('');

  function handleChange(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await onSubmit(form);
      if (!isEditing) {
        setForm(emptyForm);
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to save employee');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-[0px_4px_20px_rgba(26,43,76,0.05)]">
      {isEditing && (
        <p className="font-title-lg text-title-lg text-primary mb-4">Edit Employee</p>
      )}

      {error && (
        <div className="mb-4 bg-error-container/20 text-error border border-error/20 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px]">error</span>
          <p className="font-body-sm text-body-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Employee Code</span>
          <input
            type="text"
            value={form.employeeCode}
            onChange={handleChange('employeeCode')}
            className="px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="EMP001"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Employee Name</span>
          <input
            type="text"
            value={form.employeeName}
            onChange={handleChange('employeeName')}
            className="px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="Full name"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Department</span>
          <input
            type="text"
            value={form.department}
            onChange={handleChange('department')}
            className="px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="Engineering"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Reporting Person</span>
          <input
            type="text"
            value={form.reportingPerson}
            onChange={handleChange('reportingPerson')}
            className="px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="Manager name"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">HOD Email</span>
          <input
            type="email"
            value={form.hodEmail}
            onChange={handleChange('hodEmail')}
            className="px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="hod@company.com"
            required
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 font-body-md text-body-md border border-outline-variant text-primary rounded-lg font-semibold hover:bg-surface-container-high transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-on-primary shadow-md hover:shadow-lg rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-[22px]">save</span>
          <span className="font-body-md text-body-md">{isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Add Employee'}</span>
        </button>
      </div>
    </form>
  );
}
