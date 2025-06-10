import nodemailer from 'nodemailer';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  experience: string;
  message: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Create transporter for Hostinger SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email account
      pass: process.env.SMTP_PASS, // your email password
    },
  });
};

export async function sendContactEmail(formData: ContactFormData): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.");
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'info@loughhynecottage.com',
      subject: `New Contact Form Submission - ${formData.experience}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            <p><strong>Experience Interest:</strong> ${formData.experience}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2d5a27; margin: 10px 0;">
              ${formData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
            <p>This email was sent from the Lough Hyne Cottage website contact form.</p>
            <p>Reply directly to this email to respond to ${formData.firstName}.</p>
          </div>
        </div>
      `,
      replyTo: formData.email
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully via Hostinger SMTP');
    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}

export async function sendTestEmail(testEmail: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: 'Email System Test - Lough Hyne Cottage',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">
            Email System Test
          </h2>
          
          <p>Hello!</p>
          
          <p>This is a test email from the Lough Hyne Cottage website to verify that our email system is working correctly with Hostinger's SMTP service.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5a27; margin-top: 0;">Test Details:</h3>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Email Service:</strong> Hostinger SMTP</p>
            <p><strong>Status:</strong> Email system operational ✓</p>
          </div>
          
          <p>If you received this email, the Lough Hyne Cottage website is successfully configured to send:</p>
          <ul>
            <li>Contact form notifications</li>
            <li>Booking confirmations</li>
            <li>Administrative alerts</li>
          </ul>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            The Lough Hyne Cottage Team
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
            <p>Lough Hyne Cottage | Ireland's Premier Eco Retreat</p>
            <p>Located on the shores of Lough Hyne Marine Nature Reserve, West Cork</p>
            <p>This was an automated test email from our booking system.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

export async function sendBookingConfirmation(
  customerEmail: string,
  customerName: string,
  bookingDetails: any
): Promise<any> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = createTransporter();
    
    const checkInDate = new Date(bookingDetails.checkIn).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const checkOutDate = bookingDetails.checkOut ? 
      new Date(bookingDetails.checkOut).toLocaleDateString('en-IE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null;

    const experienceNames = {
      'cabin': 'Eco Cabin Retreat',
      'sauna': 'Finnish Sauna Experience',
      'yoga': 'Day-Long Yoga Retreat',
      'bread': 'Artisan Bread Making'
    };

    const experienceName = experienceNames[bookingDetails.type as keyof typeof experienceNames] || bookingDetails.type;

    // Customer confirmation email
    const customerMailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Booking Confirmed - ${experienceName} at Lough Hyne Cottage`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your sustainable escape awaits</p>
          </div>
          
          <!-- Booking Details -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 24px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">
              ${experienceName}
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Guest Name:</td>
                  <td style="padding: 8px 0; color: #2d5a27; font-weight: bold;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${customerEmail}</td>
                </tr>
                ${bookingDetails.customerPhone ? `
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;">${bookingDetails.customerPhone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">${bookingDetails.type === 'cabin' ? 'Check-in' : 'Date'}:</td>
                  <td style="padding: 8px 0; color: #2d5a27; font-weight: bold;">${checkInDate}</td>
                </tr>
                ${checkOutDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Check-out:</td>
                  <td style="padding: 8px 0; color: #2d5a27; font-weight: bold;">${checkOutDate}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Guests:</td>
                  <td style="padding: 8px 0;">${bookingDetails.guests} ${bookingDetails.guests === 1 ? 'guest' : 'guests'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Total Paid:</td>
                  <td style="padding: 8px 0; color: #2d5a27; font-weight: bold; font-size: 18px;">€${bookingDetails.totalPrice}</td>
                </tr>
              </table>
            </div>
            
            ${bookingDetails.specialRequests ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #2d5a27; margin-bottom: 10px;">Special Requests:</h3>
              <div style="background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4a7c59; border-radius: 4px;">
                ${bookingDetails.specialRequests}
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- What to Expect -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0;">What to Expect</h2>
            
            ${bookingDetails.type === 'cabin' ? `
            <p>Your eco cabin retreat includes:</p>
            <ul style="color: #6c757d; line-height: 1.6;">
              <li>Solar-powered accommodation with backup systems</li>
              <li>Private deck with stunning nature views</li>
              <li>Organic linens and eco-friendly amenities</li>
              <li>Kitchenette stocked with local ingredients</li>
              <li>Access to Lough Hyne's unique marine ecosystem</li>
            </ul>
            <p style="color: #6c757d;"><strong>Check-in:</strong> 3:00 PM | <strong>Check-out:</strong> 11:00 AM</p>
            ` : ''}
            
            ${bookingDetails.type === 'sauna' ? `
            <p>Your Finnish sauna experience includes:</p>
            <ul style="color: #6c757d; line-height: 1.6;">
              <li>Traditional Finnish sauna session</li>
              <li>Eucalyptus aromatherapy</li>
              <li>Temperature controls for your comfort</li>
              <li>Relaxation area with nature views</li>
              <li>Towels and robes provided</li>
            </ul>
            <p style="color: #6c757d;"><strong>Please arrive 15 minutes early</strong> for your orientation.</p>
            ` : ''}
            
            ${bookingDetails.type === 'yoga' ? `
            <p>Your day-long yoga retreat includes:</p>
            <ul style="color: #6c757d; line-height: 1.6;">
              <li>Morning meditation & sunrise yoga</li>
              <li>Healthy organic meals throughout the day</li>
              <li>Nature walking meditation</li>
              <li>Expert instructor guidance</li>
              <li>All equipment provided</li>
            </ul>
            <p style="color: #6c757d;"><strong>Start time:</strong> 7:00 AM | <strong>End time:</strong> 6:00 PM</p>
            ` : ''}
            
            ${bookingDetails.type === 'bread' ? `
            <p>Your artisan bread making workshop includes:</p>
            <ul style="color: #6c757d; line-height: 1.6;">
              <li>Sourdough starter creation</li>
              <li>Wood-fired oven baking experience</li>
              <li>Take home fresh bread and starter</li>
              <li>Master baker instruction</li>
              <li>Recipe cards and techniques guide</li>
            </ul>
            <p style="color: #6c757d;"><strong>Workshop time:</strong> 9:00 AM - 4:00 PM</p>
            ` : ''}
          </div>
          
          <!-- Important Information -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0;">Important Information</h2>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; color: #856404;"><strong>Location:</strong> Lough Hyne, Skibbereen, Co. Cork, Ireland</p>
              <p style="margin: 5px 0 0 0; color: #856404;"><strong>What3Words:</strong> ///sprayed.sharks.scuba</p>
            </div>
            
            <h3 style="color: #2d5a27; font-size: 18px;">What to Bring:</h3>
            <ul style="color: #6c757d; line-height: 1.6;">
              <li>Comfortable outdoor clothing</li>
              <li>Waterproof jacket (Irish weather!)</li>
              <li>Sturdy walking shoes</li>
              <li>Sunscreen and hat</li>
              ${bookingDetails.type === 'yoga' ? '<li>Yoga mat (if you prefer your own)</li>' : ''}
              ${bookingDetails.type === 'sauna' ? '<li>Swimwear for lake swimming (optional)</li>' : ''}
            </ul>
            
            <h3 style="color: #2d5a27; font-size: 18px;">Contact Us:</h3>
            <p style="color: #6c757d; margin: 10px 0;">
              <strong>Phone:</strong> +353-85-123-4567<br>
              <strong>Email:</strong> info@loughhynecottage.com<br>
              <strong>Emergency Contact:</strong> +353-85-123-4567
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #2d5a27; color: white; padding: 30px; text-align: center; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0;">We can't wait to welcome you!</h3>
            <p style="margin: 0; opacity: 0.9;">Thank you for choosing sustainable tourism at Ireland's first marine nature reserve.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 14px; opacity: 0.8;">
              <p style="margin: 0;">This confirmation was sent from Lough Hyne Cottage</p>
              <p style="margin: 5px 0 0 0;">Lough Hyne, Skibbereen, Co. Cork, Ireland</p>
            </div>
          </div>
        </div>
      `,
    };

    // Internal notification email
    const internalMailOptions = {
      from: `"Lough Hyne Cottage Bookings" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'info@loughhynecottage.com',
      cc: 'stevenpetergrant@gmail.com',
      subject: `New Booking: ${experienceName} - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">
            New Booking Received
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5a27; margin-top: 0;">${experienceName}</h3>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            ${bookingDetails.customerPhone ? `<p><strong>Phone:</strong> ${bookingDetails.customerPhone}</p>` : ''}
            <p><strong>${bookingDetails.type === 'cabin' ? 'Check-in' : 'Date'}:</strong> ${checkInDate}</p>
            ${checkOutDate ? `<p><strong>Check-out:</strong> ${checkOutDate}</p>` : ''}
            <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
            <p><strong>Total Paid:</strong> €${bookingDetails.totalPrice}</p>
            ${bookingDetails.specialRequests ? `<p><strong>Special Requests:</strong><br>${bookingDetails.specialRequests}</p>` : ''}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
            <p>Customer confirmation email has been sent automatically.</p>
            <p>Booking ID: ${bookingDetails.id || 'Pending'}</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(customerMailOptions);
    console.log("Booking confirmation sent to customer:", customerEmail);
    
    await transporter.sendMail(internalMailOptions);
    console.log("Booking notification sent to staff");
    
    return {
      success: true,
      emailType: 'booking_confirmation',
      timestamp: new Date().toISOString(),
      recipients: {
        customer: customerEmail,
        staff: process.env.CONTACT_EMAIL || 'info@loughhynecottage.com',
        cc: 'stevenpetergrant@gmail.com'
      }
    };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}

export async function sendPreArrivalEmail(
  customerEmail: string,
  customerName: string,
  bookingDetails: any
): Promise<any> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = createTransporter();
    
    const checkInDate = new Date(bookingDetails.checkIn).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const experienceNames = {
      'cabin': 'Eco Cabin Retreat',
      'sauna': 'Finnish Sauna Experience',
      'yoga': 'Day-Long Yoga Retreat',
      'bread': 'Artisan Bread Making'
    };

    const experienceName = experienceNames[bookingDetails.type as keyof typeof experienceNames] || bookingDetails.type;

    const mailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      cc: 'stevenpetergrant@gmail.com',
      subject: `Your Visit to Lough Hyne Cottage - ${experienceName} on ${checkInDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">We look forward to welcoming you!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Arriving ${checkInDate} at Lough Hyne Cottage</p>
          </div>
          
          <!-- Personal Welcome -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px 0; color: #2d5a27; font-weight: 600;">Dear ${customerName.split(' ')[0]},</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">We look forward to welcoming you to Lough Hyne Cottage later in the week. Our Eircode is <strong>P81P984</strong>. Please use this in Google Maps in order to find your way here.</p>
            
            <div style="background-color: #f0f8f0; border-left: 4px solid #2d5a27; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d5a27;">Check-in time is 3pm and checkout on your last day will be 10am.</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We have included some further details below to help you get settled on arrival. If you have any further questions, please do get in touch.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; font-weight: 600; color: #2d5a27;">Steven and Claire</p>
          </div>

          <!-- Internet Access -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Internet Access</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>WiFi Name:</strong> Lough Hyne Guest</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> L0ughHyne</p>
            </div>
            <p style="color: #6c757d; line-height: 1.6;">There is limited cell phone coverage. If you are on the 3 or Eir network you will get pretty good coverage in certain spots. If you are on Vodafone or other networks it is very patchy. The best spot for coverage in the cottage is in the window facing south. We know all the other good spots so just ask us and we can help you out!</p>
          </div>

          <!-- Hikki Bathtub -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Hikki Bathtub</h2>
            <p style="line-height: 1.6;">The Hikki Bath tub will be filled, the fire set, and ready for you to use upon arrival. There will be enough wood and kindling to enjoy the bath for many hours. If you would like to enjoy the bath tub more than once during your stay, we have additional wood and kindling available for a charge of €10.</p>
          </div>

          <!-- Bakery -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Lough Hyne Cottage Bakery</h2>
            <p style="line-height: 1.6;">We bake fresh Organic Sourdough Bread and Pastries for the Skibbereen Farmers market every Saturday morning. If you are staying with us over a Friday night, we offer a breakfast basket which includes a fresh loaf of organic sourdough bread as well as a variety of four artisan pastries. The cost of the breakfast basket is €20. Drop us a note before you arrive and we can make sure we get that to you on Saturday morning.</p>
          </div>

          <!-- West Cork Recommendations -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Our Top Places of West Cork</h2>
            
            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Fine Dining</h3>
            <ul style="color: #6c757d; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Customs House Baltimore</strong> - 2 Michelin stars! This is a once in a lifetime dining experience.</li>
              <li><strong>BabaDe</strong> - Sister restaurant to Customs House. Turkish Tapas.</li>
              <li><strong>The Dock Wall in Union Hall</strong> - Ciaran and his team make incredible food.</li>
              <li><strong>Arundel</strong> - Beautiful pub in sheep's head with gorgeous food (summer only)</li>
            </ul>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Casual Dining & Drinks</h3>
            <ul style="color: #6c757d; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Tokyu Sushi</strong> - Piotr produces beautiful sushi. His shop is in Skibbereen.</li>
              <li><strong>Budds in Ballydehob</strong> - Great homemade food. Well worth the trip.</li>
              <li><strong>Bushes Bar, Baltimore</strong> - Nice for a drink on a sunny evening. They also do great toasties at lunchtime!</li>
              <li><strong>The Glandore Inn</strong> - A pint with the best view in Ireland.</li>
              <li><strong>Levis in Ballydehob</strong> - Pints and Music.</li>
              <li><strong>Connollys of Leap</strong> - Pints and Music.</li>
              <li><strong>The Chunky Chip, Clonakilty</strong> - Excellent chipper.</li>
            </ul>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Coffee & Light Meals</h3>
            <ul style="color: #6c757d; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>O'Neills coffee shop in Skibbereen</strong> - Best coffee in town</li>
              <li><strong>Antiquity Vegan Cafe</strong> - Lunch, Coffee and stunning vegan chocolate and cherry cake.</li>
            </ul>
          </div>

          <!-- Practical Information -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Cottage Information</h2>
            
            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Heating System</h3>
            <p style="color: #6c757d; line-height: 1.6;">Our heating system uses an air-to-heat pump. The guest cottage is fitted with an underfloor heating system that is left on constantly and automatically adjusts. This gives a lovely ambient temperature. If you find the room too hot or cold, you can adjust the thermostat inside the main door. We recommend leaving it at 19 degrees. Please do not increase above 21 degrees.</p>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Hot Water</h3>
            <p style="color: #6c757d; line-height: 1.6;">Our water system uses an air-to-heat pump. As the hot water tank is located inside the main house, sometimes it may take some time for hot water to come through to the cottage pipes.</p>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Cooking Facilities</h3>
            <p style="color: #6c757d; line-height: 1.6;">In the kitchenette: small fridge, two-ring hob, air fryer, toaster, kettle, nespresso coffee machine, and various utensils. If anything is missing, please ask us.</p>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Outdoor Kitchen</h3>
            <p style="color: #6c757d; line-height: 1.6;">We have built an outdoor kitchen with a large fridge, barbecue, and main rubbish bins for the cottage.</p>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Swimming</h3>
            <p style="color: #6c757d; line-height: 1.6;">Swim towels are provided in the cottage. Please use these rather than the grey shower towels.</p>
          </div>

          <!-- Environmental Information -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Environmental Guidelines</h2>
            
            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Waste Water (Reed Bed System)</h3>
            <p style="color: #6c757d; line-height: 1.6;">We use a reed bed system to filter all grey water from your shower, wash basin and kitchen sink. This natural system uses bulrushes to filter water before it percolates back into the ground. <strong>Nothing with chemicals can be put into the sinks or shower.</strong> We have provided chemical-free shampoo, conditioner and body wash for your stay.</p>

            <h3 style="color: #4a7c59; font-size: 16px; margin: 20px 0 10px 0;">Waste & Recycling</h3>
            <ul style="color: #6c757d; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li><strong>Compost:</strong> Use the compost bin for all organic vegetable matter, cardboard, paper or biodegradable material. Leave outside your door when full.</li>
              <li><strong>Recycling:</strong> Use the outdoor bin for glass, cartons, cans and paper.</li>
              <li><strong>General Waste:</strong> Use the second outdoor bin for anything going to landfill.</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Need Help?</h2>
            <p style="color: #6c757d; margin: 10px 0;">
              <strong>Phone:</strong> +353-85-123-4567<br>
              <strong>Email:</strong> info@loughhynecottage.com<br>
              <strong>Location:</strong> Lough Hyne, Skibbereen, Co. Cork, Ireland<br>
              <strong>Eircode:</strong> P81P984
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #2d5a27; color: white; padding: 30px; text-align: center; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0;">We can't wait to welcome you to Lough Hyne!</h3>
            <p style="margin: 0; opacity: 0.9;">Ireland's first marine nature reserve awaits your arrival.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 14px; opacity: 0.8;">
              <p style="margin: 0;">This pre-arrival information was sent automatically</p>
              <p style="margin: 5px 0 0 0;">Lough Hyne Cottage, Skibbereen, Co. Cork, Ireland</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Pre-arrival email sent to customer:", customerEmail);
    
    return {
      success: true,
      emailType: 'pre_arrival_information',
      timestamp: new Date().toISOString(),
      recipients: {
        customer: customerEmail,
        cc: 'stevenpetergrant@gmail.com'
      }
    };
  } catch (error) {
    console.error('Error sending pre-arrival email:', error);
    return false;
  }
}

export async function sendThankYouEmail(
  customerEmail: string,
  customerName: string,
  bookingDetails: any
): Promise<any> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = createTransporter();
    
    const checkOutDate = new Date(bookingDetails.checkOut).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const experienceNames = {
      'cabin': 'Eco Cabin Retreat',
      'sauna': 'Finnish Sauna Experience',
      'yoga': 'Day-Long Yoga Retreat',
      'bread': 'Artisan Bread Making'
    };

    const experienceName = experienceNames[bookingDetails.type as keyof typeof experienceNames] || bookingDetails.type;

    const mailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      cc: 'stevenpetergrant@gmail.com',
      subject: `Thank you for staying with us at Lough Hyne Cottage`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Thank you for staying with us!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We hope you enjoyed your ${experienceName} experience</p>
          </div>
          
          <!-- Personal Thank You -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px 0; color: #2d5a27; font-weight: 600;">Dear ${customerName.split(' ')[0]},</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for staying with us at Lough Hyne Cottage. We hope you enjoyed your time in West Cork.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We are always looking to improve, so if you have any feedback about your stay, we would greatly appreciate it. Claire and I hope to welcome you back again soon.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; font-weight: 600; color: #2d5a27;">Steven and Claire</p>
          </div>

          <!-- Feedback Section -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Share Your Experience</h2>
            
            <p style="color: #6c757d; line-height: 1.6; margin-bottom: 20px;">Your feedback helps us continue to provide exceptional experiences for our guests. We'd love to hear about your stay!</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="mailto:info@loughhynecottage.com?subject=Feedback%20from%20my%20stay&body=Dear%20Steven%20and%20Claire,%0A%0AI%20recently%20stayed%20at%20Lough%20Hyne%20Cottage%20and%20wanted%20to%20share%20my%20experience..." 
                 style="background-color: #2d5a27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 10px;">
                Share Your Feedback
              </a>
            </div>
            
            <p style="color: #6c757d; line-height: 1.6; text-align: center; font-size: 14px; margin: 20px 0 0 0;">Or simply reply to this email with your thoughts</p>
          </div>

          <!-- Social Media & Rebooking -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Stay Connected</h2>
            
            <div style="text-align: center; margin: 25px 0;">
              <p style="color: #6c757d; line-height: 1.6; margin-bottom: 20px;">Follow our journey and see what's happening at Ireland's first marine nature reserve</p>
              
              <div style="margin: 20px 0;">
                <a href="https://www.instagram.com/loughhynecottage" 
                   style="background-color: #E4405F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px; display: inline-block;">
                  Follow @loughhynecottage
                </a>
              </div>
              
              <div style="margin: 20px 0;">
                <a href="https://www.loughhynecottage.com" 
                   style="background-color: #2d5a27; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px; display: inline-block;">
                  Book Your Next Stay
                </a>
              </div>
            </div>
          </div>

          <!-- Memories Section -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">We Hope You Enjoyed</h2>
            
            <ul style="color: #6c757d; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>The tranquil beauty of Ireland's first marine nature reserve</li>
              <li>Sustainable luxury in our eco-designed cottage</li>
              <li>The warmth of authentic West Cork hospitality</li>
              <li>Delicious local experiences and flavors</li>
              <li>Peaceful moments away from the everyday</li>
            </ul>
            
            <p style="color: #6c757d; line-height: 1.6; margin-top: 20px; text-align: center; font-style: italic;">
              "The memories made here will last a lifetime"
            </p>
          </div>

          <!-- Return Invitation -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Come Back Soon</h2>
            
            <p style="color: #6c757d; line-height: 1.6; margin-bottom: 20px;">West Cork changes with every season, offering new experiences throughout the year:</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <h4 style="color: #2d5a27; margin: 0 0 10px 0;">Spring & Summer</h4>
                <p style="color: #6c757d; margin: 0; font-size: 14px;">Wildflowers bloom, marine life thrives, perfect for hiking and swimming</p>
              </div>
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <h4 style="color: #2d5a27; margin: 0 0 10px 0;">Autumn & Winter</h4>
                <p style="color: #6c757d; margin: 0; font-size: 14px;">Cozy fires, dramatic storms, starlit skies, and peaceful reflection</p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="background-color: white; margin: 20px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2d5a27; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2d5a27; padding-bottom: 10px;">Stay in Touch</h2>
            <div style="text-align: center;">
              <p style="color: #6c757d; margin: 10px 0;">
                <strong>Website:</strong> <a href="https://www.loughhynecottage.com" style="color: #2d5a27; text-decoration: none;">www.loughhynecottage.com</a><br>
                <strong>Instagram:</strong> <a href="https://www.instagram.com/loughhynecottage" style="color: #2d5a27; text-decoration: none;">@loughhynecottage</a><br>
                <strong>Email:</strong> <a href="mailto:info@loughhynecottage.com" style="color: #2d5a27; text-decoration: none;">info@loughhynecottage.com</a><br>
                <strong>Location:</strong> Lough Hyne, Skibbereen, Co. Cork, Ireland
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #2d5a27; color: white; padding: 30px; text-align: center; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0;">Until we meet again at Lough Hyne</h3>
            <p style="margin: 0; opacity: 0.9;">Thank you for choosing sustainable luxury in Ireland's first marine nature reserve</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 14px; opacity: 0.8;">
              <p style="margin: 0;">This thank you message was sent automatically on your departure day</p>
              <p style="margin: 5px 0 0 0;">Lough Hyne Cottage, Skibbereen, Co. Cork, Ireland</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Thank you email sent to customer:", customerEmail);
    
    return {
      success: true,
      emailType: 'thank_you_post_stay',
      timestamp: new Date().toISOString(),
      recipients: {
        customer: customerEmail,
        cc: 'stevenpetergrant@gmail.com'
      }
    };
  } catch (error) {
    console.error('Error sending thank you email:', error);
    return false;
  }
}

// Generic email sending function
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailData.from || `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${emailData.to}:`, error);
    return false;
  }
}

export async function sendNewGuestExperienceNotification(experienceData: {
  guestName: string;
  experienceTitle: string;
  experienceDescription: string;
  recommendation?: string;
  stayDate: string;
  photoCount: number;
}): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.");
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Lough Hyne Cottage" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'info@loughhynecottage.com',
      subject: `New Guest Experience Submitted - ${experienceData.experienceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">New Guest Experience</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Ready for review and approval</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2d5a27; margin-top: 0;">${experienceData.experienceTitle}</h2>
              <p style="margin: 5px 0;"><strong>Guest:</strong> ${experienceData.guestName}</p>
              <p style="margin: 5px 0;"><strong>Stay Date:</strong> ${new Date(experienceData.stayDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Photos:</strong> ${experienceData.photoCount} uploaded</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #2d5a27; margin-bottom: 10px;">Experience Description:</h3>
              <div style="background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4a7c59; border-radius: 4px;">
                ${experienceData.experienceDescription}
              </div>
            </div>
            
            ${experienceData.recommendation ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #2d5a27; margin-bottom: 10px;">Guest Recommendation:</h3>
              <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
                "${experienceData.recommendation}"
              </div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://loughhynecottage.replit.app/admin" 
                 style="background-color: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review in Admin Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p>This guest experience is awaiting approval. You can review, approve, or reject it in the admin dashboard under the "Guest Stories" tab.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`New guest experience notification sent successfully`);
    return true;
  } catch (error) {
    console.error('Error sending new guest experience notification:', error);
    return false;
  }
}