import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, note, reportHtml } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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

    const emailContent = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
        ${sanitizedNote ? `<p><strong>Note from sender:</strong> ${sanitizedNote}</p>` : ''}
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#6b7280;margin:0;">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    `;

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Biometric Attendance Report',
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully', messageId: info.messageId },
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
