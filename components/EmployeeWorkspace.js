'use client';

import { useCallback, useEffect, useState } from 'react';
import { UploadCard } from '@/components/UploadSection';
import EmployeeForm from '@/components/EmployeeForm';
import EmployeeTable from '@/components/EmployeeTable';
import { formatImportError, parseEmployeeFile } from '@/lib/parseEmployeeExcel';

export default function EmployeeWorkspace() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchEmployees = useCallback(async () => {
    setLoadError('');

    try {
      const response = await fetch('/api/employees', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setLoadError(data.error || 'Failed to load employees');
        setEmployees([]);
        return;
      }

      setEmployees(data.employees || []);
    } catch (error) {
      console.error('[ERROR] Failed to load employees:', error);
      setLoadError('Failed to load employees. Please refresh and try again.');
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    fetchEmployees().finally(() => setIsLoading(false));
  }, [fetchEmployees]);

  function showSuccess(message) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleFileSelect(file) {
    if (!file) {
      return;
    }

    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const allowedMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const hasValidExtension = allowedExtensions.includes(fileExtension);
    const hasValidMime = allowedMimeTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMime) {
      setUploadError('Invalid file type. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadProgress(0);
  }

  function handleClearFile() {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError('');
  }

  async function handleProcessUpload() {
    if (!selectedFile) {
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    setUploadProgress(30);

    try {
      const parsed = await parseEmployeeFile(selectedFile);
      setUploadProgress(60);

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: parsed.employees }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import employees');
      }

      setUploadProgress(100);
      await fetchEmployees();

      const createdCount = data.created?.length || 0;
      const skippedCount = data.skipped?.length || 0;

      if (createdCount > 0) {
        showSuccess(`Imported ${createdCount} employee${createdCount === 1 ? '' : 's'}${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}.`);
      } else {
        setUploadError(formatImportError(createdCount, data.skipped));
      }

      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      setUploadError(error.message || 'Failed to process the file.');
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreateEmployee(formData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add employee');
      }

      await fetchEmployees();
      showSuccess('Employee added successfully.');
      setActiveTab('upload');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateEmployee(formData) {
    if (!editingEmployee) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update employee');
      }

      await fetchEmployees();
      setEditingEmployee(null);
      showSuccess('Employee updated successfully.');
      setActiveTab('upload');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEmployee(id) {
    const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete employee');
    }

    await fetchEmployees();
    showSuccess('Employee deleted successfully.');
  }

  function handleEdit(employee) {
    setEditingEmployee(employee);
    setActiveTab('manual');
  }

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: 'upload_file' },
    { id: 'manual', label: 'Add Employee', icon: 'person_add' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Employee</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Import from Excel or add individually.
          </p>
        </div>

        <div className="inline-flex p-1.5 bg-surface-container-high/50 rounded-xl border border-outline-variant/20 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'manual') {
                  setEditingEmployee(null);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-body-md text-body-md font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="bg-error-container/20 text-error border border-error/20 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px]">error</span>
          <p className="font-body-sm text-body-sm font-medium">{loadError}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-secondary-container/30 text-on-secondary-container border border-secondary/20 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
          <p className="font-body-md text-body-md font-medium">{successMessage}</p>
        </div>
      )}

      {activeTab === 'upload' && (
        <UploadCard
          compact
          selectedFile={selectedFile}
          uploadProgress={uploadProgress}
          isProcessing={isProcessing}
          error={uploadError}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onProcess={handleProcessUpload}
          processLabel="Import"
          processingLabel="Importing..."
        />
      )}

      {activeTab === 'manual' && (
        <EmployeeForm
          key={editingEmployee?.id || 'new'}
          initialValues={editingEmployee}
          isEditing={Boolean(editingEmployee)}
          isSubmitting={isSubmitting}
          onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
          onCancel={editingEmployee ? () => { setEditingEmployee(null); setActiveTab('upload'); } : undefined}
        />
      )}

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
}
