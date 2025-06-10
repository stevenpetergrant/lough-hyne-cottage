import { storage } from "./storage";
import { sendEmail } from "./email";

export interface NewYogaDateNotification {
  date: string;
  availableSlots: number;
  description?: string;
}

export async function sendNewYogaDateNotification(yogaDate: NewYogaDateNotification) {
  try {
    // Get all yoga retreat subscribers
    const subscribers = await storage.getMailingListSubscribers('yoga');
    
    if (subscribers.length === 0) {
      console.log('No yoga retreat subscribers found');
      return { success: true, emailsSent: 0 };
    }

    let emailsSent = 0;
    const errors = [];

    for (const subscriber of subscribers) {
      try {
        const bookingUrl = `${process.env.SITE_URL || 'https://loughhynecottage.com'}/yoga-booking`;
        const unsubscribeUrl = `${process.env.SITE_URL || 'https://loughhynecottage.com'}/unsubscribe?token=${subscriber.unsubscribeToken}`;
        
        const firstName = subscriber.firstName || 'Yoga Friend';
        const formattedDate = new Date(yogaDate.date).toLocaleDateString('en-IE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">New Yoga Retreat Date Available!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">At Lough Hyne Cottage</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px; color: #334155; margin-bottom: 20px;">Hello ${firstName},</p>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                We're excited to announce a new yoga retreat date at our beautiful lakeside location in Ireland's first marine nature reserve.
              </p>
              
              <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px;">${formattedDate}</h2>
                <p style="color: #64748b; margin: 0 0 15px 0; font-size: 16px;">
                  ${yogaDate.availableSlots} spaces available
                </p>
                ${yogaDate.description ? `<p style="color: #475569; margin: 0; font-style: italic;">${yogaDate.description}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${bookingUrl}" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Book Your Spot Now
                </a>
              </div>
              
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 18px;">What's Included:</h3>
                <ul style="color: #065f46; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Full day yoga retreat with experienced instructor</li>
                  <li>Healthy vegetarian lunch using local ingredients</li>
                  <li>Access to stunning lakeside location</li>
                  <li>All yoga equipment provided</li>
                  <li>Welcome herbal tea and closing ceremony</li>
                </ul>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                Spaces fill up quickly, so we recommend booking early to secure your place in this transformative experience.
              </p>
              
              <p style="color: #475569; line-height: 1.6;">
                With gratitude,<br>
                <strong>The Lough Hyne Cottage Team</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                You're receiving this email because you subscribed to updates about yoga retreats at Lough Hyne Cottage.<br>
                <a href="${unsubscribeUrl}" style="color: #64748b;">Unsubscribe from these notifications</a>
              </p>
            </div>
          </div>
        `;

        const success = await sendEmail({
          to: subscriber.email,
          subject: `New Yoga Retreat Date: ${formattedDate} - Book Now!`,
          html: emailContent
        });

        if (success) {
          await storage.updateLastEmailSent(subscriber.id);
          emailsSent++;
        } else {
          errors.push(`Failed to send email to ${subscriber.email}`);
        }
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        errors.push(`Error sending email to ${subscriber.email}: ${error}`);
      }
    }

    console.log(`Yoga retreat notification sent to ${emailsSent} subscribers`);
    return {
      success: true,
      emailsSent,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('Error sending yoga retreat notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function subscribeFromBooking(email: string, firstName?: string, lastName?: string) {
  try {
    await storage.subscribeToMailingList({
      email,
      firstName,
      lastName,
      experienceType: 'yoga',
      subscriptionSource: 'booking',
      isActive: true
    });
    console.log(`Auto-subscribed ${email} to yoga mailing list from booking`);
  } catch (error) {
    console.error(`Failed to auto-subscribe ${email}:`, error);
  }
}