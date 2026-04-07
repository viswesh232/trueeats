const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ── Generic branded HTML wrapper ─────────────────────────────────────────────
const wrap = (content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
  <div style="background:#1a4331;padding:24px 32px;display:flex;align-items:center;gap:12px;">
    <span style="color:#fcd5ce;font-size:22px;font-weight:900;letter-spacing:1px;">TRUE EATS</span>
  </div>
  <div style="padding:32px;">
    ${content}
  </div>
  <div style="background:#f4f7f6;padding:16px 32px;font-size:12px;color:#64748b;text-align:center;">
    © True Eats · The Way Food Was Meant To Be
  </div>
</div>`;

// ── 1. Verification email ─────────────────────────────────────────────────────
const sendVerificationEmail = async (email, verificationUrl) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your True Eats Account',
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 16px;">Welcome to True Eats!</h2>
                <p style="color:#475569;line-height:1.6;">Thanks for signing up. Click the button below to verify your email and activate your account.</p>
                <a href="${verificationUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1a4331;color:#fcd5ce;text-decoration:none;border-radius:10px;font-weight:bold;">
                    Verify My Account
                </a>
                <p style="font-size:13px;color:#94a3b8;">If the button doesn't work, copy this link: ${verificationUrl}</p>
            `),
        });
    } catch (error) {
        console.error('❌ Verification email failed:', error.message);
    }
};

// ── 2. Order update / shipment message from admin ────────────────────────────
const sendOrderUpdateEmail = async (email, { customerName, orderId, message, trackingId, courierName }) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Update on your True Eats Order #${orderId}`,
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 8px;">Hi ${customerName},</h2>
                <p style="color:#475569;margin:0 0 20px;">Here's an update on your order <strong style="color:#1a4331;">#${orderId}</strong>:</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:20px;">
                    <p style="margin:0;color:#065f46;font-size:15px;line-height:1.6;">${message}</p>
                </div>
                ${trackingId ? `
                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#64748b;text-transform:uppercase;">Tracking Information</p>
                    <p style="margin:0;font-size:15px;color:#1a4331;font-weight:bold;">${courierName || 'Private Courier'}: ${trackingId}</p>
                </div>` : ''}
                <p style="color:#64748b;font-size:13px;">Questions? Just reply to this email.</p>
            `),
        });
    } catch (error) {
        console.error('❌ Order update email failed:', error.message);
    }
};

// ── 3. Send coupon code to a customer ────────────────────────────────────────
const sendCouponEmail = async (email, { customerName, couponCode, discountText, message }) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `A special offer for you from True Eats 🎁`,
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 8px;">Hey ${customerName}! 🎉</h2>
                <p style="color:#475569;line-height:1.6;">${message || "We have a special offer just for you!"}</p>
                <div style="background:#1a4331;border-radius:14px;padding:28px;text-align:center;margin:24px 0;">
                    <p style="color:rgba(252,213,206,0.7);margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Your Exclusive Coupon Code</p>
                    <div style="background:#fcd5ce;border-radius:10px;padding:14px 28px;display:inline-block;margin:8px 0;">
                        <span style="font-family:monospace;font-size:28px;font-weight:900;color:#1a4331;letter-spacing:4px;">${couponCode}</span>
                    </div>
                    <p style="color:#fcd5ce;margin:8px 0 0;font-size:14px;font-weight:bold;">${discountText}</p>
                </div>
                <p style="color:#64748b;font-size:13px;">Apply this code at checkout on your next order. Valid until admin removes it.</p>
            `),
        });
    } catch (error) {
        console.error('❌ Coupon email failed:', error.message);
    }
};

// Keep old export signature for backward compatibility
// const sendEmail = async (email, subject, text) => {
//     if (subject === 'Verify Your True Eats Account') {
//         return sendVerificationEmail(email, text);
//     }
//     // Generic fallback
//     try {
//         await createTransporter().sendMail({
//             from: `"True Eats" <${process.env.EMAIL_USER}>`,
//             to: email, subject,
//             html: wrap(`<p style="color:#475569;line-height:1.6;">${text}</p>`),
//         });
//     } catch (error) {
//         console.error('❌ Email failed:', error.message);
//     }
// };

const sendEmail = async (email, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text, // Fallback for old email clients
      html: html  // NEW: The beautiful HTML version
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};


module.exports = sendEmail;
module.exports.sendOrderUpdateEmail = sendOrderUpdateEmail;
module.exports.sendCouponEmail      = sendCouponEmail;
module.exports.sendVerificationEmail = sendVerificationEmail;