import nodemailer from "nodemailer";

// Create transporter once (reuse for all emails)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // false for 587, true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service not configured:", error.message);
  } else {
    console.log("✅ Email service ready");
  }
});

export async function sendFailureEmail({
  repoName,
  branch,
  commitSha,
  commitMessage,
  author,
  failedStep,
  errorMessage,
  logUrl,
  timestamp,
}) {
  const subject = `🚨 [FAILED] ${repoName} - ${commitMessage.slice(0, 50)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        .label { font-weight: bold; color: #333; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>❌ Deployment Failed</h1>
      </div>
      
      <div class="section">
        <h2>📦 Repository</h2>
        <p><span class="label">Name:</span> ${repoName}</p>
        <p><span class="label">Branch:</span> ${branch}</p>
      </div>
      
      <div class="section">
        <h2>📝 Commit</h2>
        <p><span class="label">Hash:</span> ${commitSha}</p>
        <p><span class="label">Message:</span> ${commitMessage}</p>
        <p><span class="label">Author:</span> ${author}</p>
      </div>
      
      <div class="section error">
        <h2>⚠️ Failed Step</h2>
        <p><span class="label">Command:</span> <code>${failedStep}</code></p>
      </div>
      
      <div class="section error">
        <h2>🐛 Error Message</h2>
        <pre>${errorMessage}</pre>
      </div>
      
      <div class="section">
        <h2>📊 Details</h2>
        <p><span class="label">Time:</span> ${timestamp}</p>
        <p><span class="label">Logs:</span> <a href="${logUrl}">${logUrl}</a></p>
      </div>
      
      <div class="section" style="text-align: center; color: #666;">
        <p>This is an automated message from your CI/CD Server</p>
      </div>
    </body>
    </html>
  `;

  const text = `
❌ DEPLOYMENT FAILED

Repository: ${repoName}
Branch: ${branch}
Commit: ${commitSha} - "${commitMessage}"
Author: ${author}

Failed Step: ${failedStep}

Error: ${errorMessage}

Time: ${timestamp}
Logs: ${logUrl}
---
Automated message from CI/CD Server
  `;

  try {
    const info = await transporter.sendMail({
      from: `"CI/CD Server" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: subject,
      text: text,
      html: html,
    });

    console.log(`📧 Failure email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return false;
  }
}

// Optional: Send success email (uncomment if needed)
export async function sendSuccessEmail({
  repoName,
  branch,
  commitSha,
  commitMessage,
  author,
  logUrl,
  timestamp,
}) {
  const subject = `✅ [SUCCESS] ${repoName} - ${commitMessage.slice(0, 50)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Deployment Successful</h1>
      </div>
      
      <div class="section">
        <h2>📦 Repository</h2>
        <p>${repoName} on branch ${branch}</p>
      </div>
      
      <div class="section">
        <h2>📝 Commit</h2>
        <p>${commitSha} - "${commitMessage}" by ${author}</p>
      </div>
      
      <div class="section">
        <h2>📊 Details</h2>
        <p>Time: ${timestamp}</p>
        <p>Logs: <a href="${logUrl}">${logUrl}</a></p>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"CI/CD Server" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: subject,
      html: html,
    });
    console.log(`📧 Success email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return false;
  }
}
