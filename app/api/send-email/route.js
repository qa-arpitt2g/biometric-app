import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeNote(note) {
  return note ? String(note).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

function buildEmailContent(note, reportHtml) {
  const sanitizedNote = sanitizeNote(note);
  const bodyHtml = reportHtml || `
      <div style="font-family:OpenSans,sans-serif;color:#111;">
        <h2>Biometric Attendance Report</h2>
        <p>Please find the attendance report attached to this email.</p>
        <p><strong>This report contains sensitive PII data and has been encrypted during transit.</strong></p>
      </div>
    `;

  return `
      <div style="font-family:OpenSans,sans-serif;color:#111;line-height:1.5;">
        ${sanitizedNote ? `<p><strong>Note from sender:</strong> ${sanitizedNote}</p>` : ''}
        ${bodyHtml}
      </div>
    `;
}

function normalizeSingleBatch({ emails, toEmail, ccEmails, reportHtml, reportTitle }) {
  const toList = Array.isArray(emails)
    ? emails.map((email) => String(email).trim()).filter(Boolean)
    : [String(toEmail || '').trim()].filter(Boolean);
  const ccList = Array.isArray(ccEmails)
    ? ccEmails.map((email) => String(email).trim()).filter(Boolean)
    : [];

  return {
    toList,
    ccList,
    reportHtml,
    reportTitle,
  };
}

function normalizeBatches(payload) {
  if (Array.isArray(payload?.batches)) {
    return payload.batches.map((batch) => normalizeSingleBatch(batch));
  }
  return [normalizeSingleBatch(payload || {})];
}

function validateBatches(batches) {
  if (!Array.isArray(batches) || batches.length === 0) {
    return 'At least one recipient email is required';
  }

  for (const batch of batches) {
    if (!batch.toList.length) {
      return 'At least one recipient email is required';
    }
    const invalidEmails = [...batch.toList, ...batch.ccList].filter((email) => !EMAIL_REGEX.test(email));
    if (invalidEmails.length > 0) {
      return `Invalid email address(es): ${invalidEmails.join(', ')}`;
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const batches = normalizeBatches(payload);
    const validationError = validateBatches(batches);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    let emailPassword = process.env.EMAIL_PASSWORD;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    if (emailPassword && (emailPassword.startsWith('"') || emailPassword.startsWith("'")) && (emailPassword.endsWith('"') || emailPassword.endsWith("'"))) {
      emailPassword = emailPassword.slice(1, -1);
    }

    if (!emailUser || !emailPassword) {
      console.error('[ERROR] Missing email environment variables');
      return NextResponse.json(
        { error: 'Email sender is not configured' },
        { status: 500 }
      );
    }

    // Configure transporter based on service type
    let transporterConfig;
    if (emailService === 'custom') {
      transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: process.env.EMAIL_SECURE === 'true',
        authMethod: 'LOGIN',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
        logger: true,
        debug: true,
      };
    } else {
      transporterConfig = {
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    await transporter.verify();

    const sendResults = [];
    for (const batch of batches) {
      const mailOptions = {
        from: `"Biometric Attendance" <${emailFrom}>`,
        to: batch.toList.join(', '),
        ...(batch.ccList.length > 0 ? { cc: batch.ccList.join(', ') } : {}),
        subject: batch.reportTitle || 'Biometric Attendance Report',
        html: buildEmailContent(payload.note, batch.reportHtml),
      };

      const info = await transporter.sendMail(mailOptions);
      sendResults.push({
        to: batch.toList,
        cc: batch.ccList,
        messageId: info.messageId,
      });
    }

    return NextResponse.json(
      {
        message: `Email sent successfully (${sendResults.length} batch${sendResults.length > 1 ? 'es' : ''})`,
        sentCount: sendResults.length,
        results: sendResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
