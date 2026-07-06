import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emails, toEmail, ccEmails, note, reportHtml, reportTitle } = await request.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const toList = Array.isArray(emails)
      ? emails.map((email) => String(email).trim()).filter(Boolean)
      : [String(toEmail || '').trim()].filter(Boolean);
    const ccList = Array.isArray(ccEmails)
      ? ccEmails.map((email) => String(email).trim()).filter(Boolean)
      : [];

    if (toList.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient email is required' },
        { status: 400 }
      );
    }

    const invalidEmails = [...toList, ...ccList].filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email address(es): ${invalidEmails.join(', ')}` },
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

    const sanitizedNote = note ? String(note).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    const bodyHtml = reportHtml || `
      <div style="font-family:OpenSans,sans-serif;color:#111;">
        <h2>Biometric Attendance Report</h2>
        <p>Please find the attendance report attached to this email.</p>
        <p><strong>This report contains sensitive PII data and has been encrypted during transit.</strong></p>
      </div>
    `;

    const emailContent = `
      <div style="font-family:OpenSans,sans-serif;color:#111;line-height:1.5;">
        ${sanitizedNote ? `<p><strong>Note from sender:</strong> ${sanitizedNote}</p>` : ''}
        ${bodyHtml}
      </div>
    `;

    const mailOptions = {
      from: `"Biometric Attendance" <${emailFrom}>`,
      to: toList.join(', '),
      ...(ccList.length > 0 ? { cc: ccList.join(', ') } : {}),
      subject: reportTitle || 'Biometric Attendance Report',
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message: `Email sent successfully to ${toList.length} recipient(s)`,
        ccCount: ccList.length,
        messageId: info.messageId,
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
