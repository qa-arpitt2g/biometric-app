import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emails, note, reportHtml, reportTitle } = await request.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient email is required' },
        { status: 400 }
      );
    }

    // Validate all emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email) => !emailRegex.test(String(email).trim()));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email address(es): ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    if (!emailUser || !emailPassword) {
      console.error('[ERROR] Missing email environment variables');
      return NextResponse.json(
        { error: 'Email sender is not configured' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    await transporter.verify();

    const sanitizedNote = note ? String(note).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    const bodyHtml = reportHtml || `
      <div style="font-family:Arial,sans-serif;color:#111;">
        <h2>Biometric Attendance Report</h2>
        <p>Please find the attendance report attached to this email.</p>
        <p><strong>This report contains sensitive PII data and has been encrypted during transit.</strong></p>
      </div>
    `;

    const formattedFooterDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const emailContent = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
        ${sanitizedNote ? `<p><strong>Note from sender:</strong> ${sanitizedNote}</p>` : ''}
        ${bodyHtml}
      </div>
    `;

    const mailOptions = {
      from: `"Biometric Attendance" <${emailFrom}>`,
      to: emails.map((e) => String(e).trim()).join(', '),
      subject: reportTitle || 'Biometric Attendance Report',
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: `Email sent successfully to ${emails.length} recipient(s)`, messageId: info.messageId },
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
