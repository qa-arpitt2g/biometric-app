'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

async function sendReportEmails({ emailBatches, note }) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      note,
      batches: emailBatches.map((batch) => ({
        toEmail: batch.toEmail,
        ccEmails: batch.ccEmails,
        reportHtml: batch.reportHtml,
        reportTitle: batch.reportTitle,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to send email');
  }

  return response.json();
}

export default function EmailReportModal({
  isOpen,
  onClose,
  onSent,
  emailBatches = [],
  summaryTitle = 'Biometric Attendance Report',
}) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const noteInputRef = useRef(null);

  const handleClose = useCallback(() => {
    setNote('');
    setError('');
    setIsSending(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => noteInputRef.current?.focus(), 80);

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!emailBatches.length) {
      setError('No email recipients found for this report.');
      return;
    }

    setError('');
    setIsSending(true);
    try {
      await sendReportEmails({ emailBatches, note });
      handleClose();
      onSent?.(emailBatches.length);
    } catch (err) {
      setError(err.message || 'Failed to send email. Please try again.');
      setIsSending(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/45 backdrop-blur-sm flex items-center justify-center p-md fade-in"
      onMouseDown={handleClose}
      role="presentation"
    >
      <div
        className="w-[90%] max-w-[420px] bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden slide-in-from-bottom-4"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-report-title"
      >
        <div className="px-md py-md border-b border-outline-variant/30 flex items-start justify-between gap-md">
          <div className="flex items-center gap-sm">
            <div className="w-11 h-11 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div>
              <h4 id="send-report-title" className="font-title-lg text-title-lg text-primary">Send Department Reports</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{summaryTitle}</p>
            </div>
          </div>
          <button
            className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
            onClick={handleClose}
            type="button"
            aria-label="Close send report modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-md space-y-md" onSubmit={handleSubmit} noValidate>
          {error ? (
            <span className="block font-body-sm text-body-sm text-error">{error}</span>
          ) : null}

          <label className="block">
            <span className="font-body-sm text-body-sm font-semibold text-primary">Add a Note <span className="text-on-surface-variant font-normal">(Optional)</span></span>
            <textarea
              ref={noteInputRef}
              className="mt-xs w-full min-h-28 rounded-lg border border-outline-variant/40 bg-white px-sm py-sm font-body-sm text-body-sm outline-none focus:border-secondary resize-y"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Write a brief message..."
            />
          </label>

          <div className="flex gap-sm rounded-lg bg-surface-container-low border border-outline-variant/30 p-sm">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[19px]">lock</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              This report contains sensitive PII data and will be encrypted during transit.
            </p>
          </div>

          <div className="flex justify-end gap-sm pt-xs">
            <button
              className="px-md py-sm border border-outline-variant/40 rounded-lg font-bold text-primary hover:bg-surface-container-low transition-colors"
              onClick={handleClose}
              type="button"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              className="px-md py-sm bg-secondary text-on-secondary rounded-lg font-bold shadow-md hover:bg-secondary-fixed-dim/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-xs min-w-28 justify-center"
              type="submit"
              disabled={!emailBatches.length || isSending}
            >
              {isSending ? (
                <span className="w-4 h-4 rounded-full border-2 border-on-secondary/40 border-t-on-secondary animate-spin" aria-hidden="true"></span>
              ) : null}
              {isSending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
