export interface VendorNotificationPayload {
  vendorEmail: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  categoryName: string;
  quantityRequested: string;
  deliveryAddress: string;
  pincode: string;
  enquiryDate: string;
  enquiryId: string;
}

/**
 * Service to send vendor email notifications.
 * Currently uses a mock implementation that logs to the console.
 * This can be swapped with Resend, SendGrid, etc. later without changing calling logic.
 */
export async function sendVendorNotificationEmail(payload: VendorNotificationPayload) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const enquiryLink = `${appUrl}/vendor/enquiries#enquiry-${payload.enquiryId}`;

    const emailSubject = `New Enquiry for ${payload.productName} from ${payload.customerName}`;
    
    const emailBody = `
==================================================
EMAIL NOTIFICATION (MOCK)
==================================================
To: ${payload.vendorEmail}
Subject: ${emailSubject}

Hello ${payload.vendorName},

You have received a new enquiry through Multiplying Brics!

Customer Details:
-----------------
Name: ${payload.customerName}
Phone: ${payload.customerPhone}
Email: ${payload.customerEmail}

Order / Enquiry Details:
------------------------
Product: ${payload.productName}
Category: ${payload.categoryName}
Quantity Requested: ${payload.quantityRequested}
Delivery Address: ${payload.deliveryAddress}
Pincode: ${payload.pincode}
Date & Time of Enquiry: ${payload.enquiryDate}

View this enquiry directly on your dashboard:
${enquiryLink}

==================================================
    `;

    // Mock send
    console.log(emailBody);

    // TODO: Integrate actual email provider here (e.g. Resend)
    // await resend.emails.send({ ... })

    return { success: true };
  } catch (error) {
    console.error('Failed to send vendor notification email:', error);
    // Don't throw, so we don't break the enquiry creation workflow
    return { success: false, error };
  }
}
