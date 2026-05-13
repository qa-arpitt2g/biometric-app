import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, note, reportData } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection (optional but recommended)
    await transporter.verify();

    // Prepare email content
    const emailContent = `
      <h2>Biometric Attendance Report</h2>
      <p>Please find the attendance report attached to this email.</p>
      ${note ? `<h3>Note from sender:</h3><p>${note}</p>` : ''}
      <p><strong>This report contains sensitive PII data and has been encrypted during transit.</strong></p>
      <hr/>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Biometric Attendance Report',
      html: emailContent,
      attachments: reportData ? [
        {
          filename: `report-${new Date().toISOString().split('T')[0]}.xlsx`,
          content: Buffer.from(reportData, 'base64'),
        },
      ] : [],
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
