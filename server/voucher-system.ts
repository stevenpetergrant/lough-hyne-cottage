import { storage } from "./storage";
import { sendEmail } from "./email";

interface VoucherData {
  amount: number;
  recipientName: string;
  recipientEmail: string;
  purchaserName: string;
  purchaserEmail: string;
  personalMessage?: string;
  stripeSessionId: string;
}

export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LHC-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createVoucher(voucherData: VoucherData) {
  const voucherCode = generateVoucherCode();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 12 months validity

  const voucher = {
    voucherCode,
    amount: voucherData.amount.toString(),
    recipientName: voucherData.recipientName,
    recipientEmail: voucherData.recipientEmail,
    purchaserName: voucherData.purchaserName,
    purchaserEmail: voucherData.purchaserEmail,
    personalMessage: voucherData.personalMessage || '',
    isRedeemed: false,
    expiresAt,
    stripeSessionId: voucherData.stripeSessionId,
  };

  // Store voucher (when database is ready)
  // const savedVoucher = await storage.createVoucher(voucher);

  // Send voucher emails
  await sendVoucherEmails(voucher);
  
  return voucher;
}

export async function sendVoucherEmails(voucher: any) {
  const voucherEmailHtml = generateVoucherEmailHtml(voucher);
  const purchaseConfirmationHtml = generatePurchaseConfirmationHtml(voucher);

  // Send voucher to recipient
  await sendEmail({
    to: voucher.recipientEmail,
    subject: `🎁 You've Received a Gift Voucher for Lough Hyne Cottage!`,
    html: voucherEmailHtml,
    from: 'Lough Hyne Cottage <info@loughhynecottage.com>'
  });

  // Send confirmation to purchaser
  await sendEmail({
    to: voucher.purchaserEmail,
    subject: `Gift Voucher Purchase Confirmation - Lough Hyne Cottage`,
    html: purchaseConfirmationHtml,
    from: 'Lough Hyne Cottage <info@loughhynecottage.com>'
  });
}

function generateVoucherEmailHtml(voucher: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Gift Voucher for Lough Hyne Cottage</title>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .voucher-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 3px dashed #4a7c59; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .voucher-code { font-size: 32px; font-weight: bold; color: #2d5a27; letter-spacing: 3px; margin: 20px 0; }
        .amount { font-size: 24px; color: #4a7c59; font-weight: bold; }
        .message-box { background: #f1f8e9; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .experiences { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .experience-item { display: inline-block; background: white; padding: 12px 18px; margin: 5px; border-radius: 25px; border: 2px solid #4a7c59; color: #2d5a27; font-weight: 500; }
        .location-info { background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .booking-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .footer { background: #2d5a27; color: white; padding: 30px; text-align: center; }
        .btn { display: inline-block; background: #4a7c59; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .btn:hover { background: #2d5a27; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏞️ Lough Hyne Cottage</div>
            <p>Eco Luxury at Ireland's First Marine Nature Reserve</p>
        </div>
        
        <div class="content">
            <h1 style="color: #2d5a27; text-align: center; margin-bottom: 30px;">🎁 You've Received a Gift Voucher!</h1>
            
            <p>Dear ${voucher.recipientName},</p>
            
            <p>Congratulations! You've received a wonderful gift voucher for an unforgettable experience at Lough Hyne Cottage, nestled on the shores of Ireland's first marine nature reserve in beautiful West Cork.</p>
            
            ${voucher.personalMessage ? `
            <div class="message-box">
                <h3 style="margin-top: 0; color: #2d5a27;">Personal Message from ${voucher.purchaserName}:</h3>
                <p style="font-style: italic; margin-bottom: 0;">"${voucher.personalMessage}"</p>
            </div>
            ` : ''}
            
            <div class="voucher-card">
                <h2 style="margin-top: 0; color: #2d5a27;">Your Gift Voucher</h2>
                <div class="voucher-code">${voucher.voucherCode}</div>
                <div class="amount">Value: €${voucher.amount}</div>
                <p style="margin-bottom: 0; color: #6c757d;">Valid for 12 months from issue date</p>
            </div>
            
            <div class="experiences">
                <h3 style="text-align: center; color: #2d5a27; margin-bottom: 20px;">Use Your Voucher For:</h3>
                <div style="text-align: center;">
                    <span class="experience-item">🏡 Eco Cabin Stays</span>
                    <span class="experience-item">🧘‍♀️ Yoga Retreats</span>
                    <span class="experience-item">🔥 Sauna Sessions</span>
                    <span class="experience-item">🍞 Bread Making Workshops</span>
                </div>
            </div>
            
            <div class="location-info">
                <h3 style="color: #2d5a27; margin-top: 0;">About Lough Hyne Cottage</h3>
                <p>Our contemporary eco-cottage sits on the shores of Lough Hyne, Ireland's first marine nature reserve. This unique saltwater lake is home to rare marine species and offers a truly magical setting for your retreat.</p>
                <ul style="margin: 15px 0;">
                    <li><strong>Location:</strong> Skibbereen, West Cork, Ireland</li>
                    <li><strong>Setting:</strong> Shores of Lough Hyne Marine Nature Reserve</li>
                    <li><strong>Style:</strong> Contemporary eco-luxury accommodation</li>
                    <li><strong>Perfect for:</strong> Romantic getaways, wellness retreats, nature lovers</li>
                </ul>
            </div>
            
            <div class="booking-info">
                <h3 style="color: #856404; margin-top: 0;">How to Redeem Your Voucher</h3>
                <ol>
                    <li>Visit our website: <strong>loughhynecottage.com</strong></li>
                    <li>Browse and select your preferred experience</li>
                    <li>During booking, enter your voucher code: <strong>${voucher.voucherCode}</strong></li>
                    <li>The voucher amount will be automatically applied to your booking</li>
                    <li>Pay any remaining balance if your booking exceeds the voucher value</li>
                </ol>
            </div>
            
            <div style="text-align: center;">
                <a href="https://loughhynecottage.com/booking" class="btn">Book Your Experience Now</a>
            </div>
            
            <p style="margin-top: 30px;">We can't wait to welcome you to this magical corner of West Cork for an unforgettable experience in harmony with nature.</p>
            
            <p>With warm regards,<br>
            <strong>The Team at Lough Hyne Cottage</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Lough Hyne Cottage</strong><br>
            Skibbereen, Co. Cork, Ireland<br>
            📧 info@loughhynecottage.com<br>
            🌐 loughhynecottage.com</p>
            
            <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                This voucher is valid for 12 months from the issue date and can be used towards any experience at Lough Hyne Cottage. 
                If your booking total exceeds the voucher value, you can pay the difference. Vouchers are non-refundable but transferable.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function generatePurchaseConfirmationHtml(voucher: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gift Voucher Purchase Confirmation</title>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .confirmation-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .voucher-details { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .footer { background: #2d5a27; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">✅ Purchase Confirmed</h1>
            <p>Lough Hyne Cottage Gift Voucher</p>
        </div>
        
        <div class="content">
            <p>Dear ${voucher.purchaserName},</p>
            
            <div class="confirmation-box">
                <h3 style="color: #155724; margin-top: 0;">Thank you for your purchase!</h3>
                <p style="margin-bottom: 0;">Your gift voucher has been successfully created and sent to ${voucher.recipientName} at ${voucher.recipientEmail}.</p>
            </div>
            
            <div class="voucher-details">
                <h3 style="color: #2d5a27; margin-top: 0;">Voucher Details</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Voucher Code:</strong> ${voucher.voucherCode}</li>
                    <li><strong>Amount:</strong> €${voucher.amount}</li>
                    <li><strong>Recipient:</strong> ${voucher.recipientName}</li>
                    <li><strong>Recipient Email:</strong> ${voucher.recipientEmail}</li>
                    <li><strong>Valid Until:</strong> ${new Date(voucher.expiresAt).toLocaleDateString('en-IE')}</li>
                </ul>
                
                ${voucher.personalMessage ? `
                <h4 style="color: #2d5a27;">Your Personal Message:</h4>
                <p style="font-style: italic; background: white; padding: 15px; border-radius: 6px;">"${voucher.personalMessage}"</p>
                ` : ''}
            </div>
            
            <p>The recipient will receive a beautifully designed voucher email with all the details they need to book their experience at Lough Hyne Cottage.</p>
            
            <p>If you have any questions about the voucher or need to make changes, please don't hesitate to contact us.</p>
            
            <p>Thank you for choosing Lough Hyne Cottage!</p>
            
            <p>Warm regards,<br>
            <strong>The Team at Lough Hyne Cottage</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Lough Hyne Cottage</strong><br>
            Skibbereen, Co. Cork, Ireland<br>
            📧 info@loughhynecottage.com<br>
            🌐 loughhynecottage.com</p>
        </div>
    </div>
</body>
</html>
  `;
}

export async function validateVoucher(voucherCode: string): Promise<{ valid: boolean; voucher?: any; message: string }> {
  // For now, return mock validation - will be replaced with database lookup
  if (!voucherCode || voucherCode.length < 8) {
    return { valid: false, message: "Invalid voucher code format" };
  }
  
  // Mock voucher for testing
  const mockVoucher = {
    voucherCode,
    amount: 100,
    isRedeemed: false,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  };
  
  if (mockVoucher.isRedeemed) {
    return { valid: false, message: "This voucher has already been redeemed" };
  }
  
  if (new Date() > mockVoucher.expiresAt) {
    return { valid: false, message: "This voucher has expired" };
  }
  
  return { valid: true, voucher: mockVoucher, message: "Voucher is valid" };
}

export async function redeemVoucher(voucherCode: string, bookingId: number, amountUsed: number): Promise<boolean> {
  // This will update the voucher status in the database when ready
  console.log(`Redeeming voucher ${voucherCode} for booking ${bookingId}, amount used: €${amountUsed}`);
  return true;
}