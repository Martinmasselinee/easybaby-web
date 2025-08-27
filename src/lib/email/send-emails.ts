import { Resend } from 'resend';
import { render } from '@react-email/render';
import UserConfirmationEmail from './templates/user-confirmation';
import HotelNotificationEmail from './templates/hotel-notification';
import { generateReservationICS } from './ics-generator';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY || 'test_api_key');

/**
 * Envoie un email de confirmation à l'utilisateur
 */
export async function sendUserConfirmationEmail({
  reservationCode,
  productName,
  pickupHotel,
  pickupHotelAddress,
  pickupDateTime,
  dropHotel,
  dropHotelAddress,
  dropDateTime,
  totalPrice,
  depositAmount,
  userEmail,
  hotelDiscountCode,
  locale = 'fr',
}: {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupHotelAddress: string;
  pickupDateTime: string;
  dropHotel: string;
  dropHotelAddress: string;
  dropDateTime: string;
  totalPrice: string;
  depositAmount: string;
  userEmail: string;
  hotelDiscountCode?: string;
  locale?: string;
}) {
  try {
    // Générer le contenu de l'email
    const emailHtml = render(
      UserConfirmationEmail({
        reservationCode,
        productName,
        pickupHotel,
        pickupDateTime,
        dropHotel,
        dropDateTime,
        totalPrice,
        depositAmount,
        userEmail,
        hotelDiscountCode,
        locale,
      })
    );

    // Générer le fichier ICS
    const icsContent = generateReservationICS({
      reservationCode,
      productName,
      pickupHotel,
      pickupAddress: pickupHotelAddress,
      pickupDateTime,
      dropHotel,
      dropAddress: dropHotelAddress,
      dropDateTime,
      locale,
    });

    // Traductions pour l'objet de l'email
    const subjects = {
      fr: `Confirmation de votre réservation EasyBaby - ${reservationCode}`,
      en: `Confirmation of your EasyBaby reservation - ${reservationCode}`,
    };

    const subject = subjects[locale as keyof typeof subjects] || subjects.fr;

    // Envoyer l'email avec la pièce jointe ICS
    const { data, error } = await resend.emails.send({
      from: 'EasyBaby <reservations@easybaby.io>',
      to: [userEmail],
      subject,
      html: emailHtml,
      attachments: [
        {
          filename: `reservation-${reservationCode}.ics`,
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Error sending user confirmation email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendUserConfirmationEmail:', error);
    return { success: false, error };
  }
}

/**
 * Envoie un email de notification à l'hôtel
 */
export async function sendHotelNotificationEmail({
  hotelName,
  hotelEmail,
  reservationCode,
  productName,
  pickupDateTime,
  dropDateTime,
  customerEmail,
  customerPhone,
  locale = 'fr',
}: {
  hotelName: string;
  hotelEmail: string;
  reservationCode: string;
  productName: string;
  pickupDateTime: string;
  dropDateTime: string;
  customerEmail: string;
  customerPhone?: string;
  locale?: string;
}) {
  try {
    // Générer le contenu de l'email
    const emailHtml = render(
      HotelNotificationEmail({
        hotelName,
        reservationCode,
        productName,
        pickupDateTime,
        dropDateTime,
        customerEmail,
        customerPhone,
        locale,
      })
    );

    // Traductions pour l'objet de l'email
    const subjects = {
      fr: `Nouvelle réservation EasyBaby - ${reservationCode}`,
      en: `New EasyBaby reservation - ${reservationCode}`,
    };

    const subject = subjects[locale as keyof typeof subjects] || subjects.fr;

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: 'EasyBaby <reservations@easybaby.io>',
      to: [hotelEmail],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending hotel notification email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendHotelNotificationEmail:', error);
    return { success: false, error };
  }
}

/**
 * Envoie les emails de confirmation et de notification pour une réservation
 */
export async function sendReservationEmails({
  reservationCode,
  productName,
  pickupHotel,
  pickupHotelAddress,
  pickupHotelEmail,
  pickupDateTime,
  dropHotel,
  dropHotelAddress,
  dropDateTime,
  totalPrice,
  depositAmount,
  userEmail,
  userPhone,
  hotelDiscountCode,
  locale = 'fr',
}: {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupHotelAddress: string;
  pickupHotelEmail: string;
  pickupDateTime: string;
  dropHotel: string;
  dropHotelAddress: string;
  dropDateTime: string;
  totalPrice: string;
  depositAmount: string;
  userEmail: string;
  userPhone?: string;
  hotelDiscountCode?: string;
  locale?: string;
}) {
  // Envoyer l'email de confirmation à l'utilisateur
  const userEmailResult = await sendUserConfirmationEmail({
    reservationCode,
    productName,
    pickupHotel,
    pickupHotelAddress,
    pickupDateTime,
    dropHotel,
    dropHotelAddress,
    dropDateTime,
    totalPrice,
    depositAmount,
    userEmail,
    hotelDiscountCode,
    locale,
  });

  // Envoyer l'email de notification à l'hôtel
  const hotelEmailResult = await sendHotelNotificationEmail({
    hotelName: pickupHotel,
    hotelEmail: pickupHotelEmail,
    reservationCode,
    productName,
    pickupDateTime,
    dropDateTime,
    customerEmail: userEmail,
    customerPhone: userPhone,
    locale,
  });

  return {
    userEmail: userEmailResult,
    hotelEmail: hotelEmailResult,
  };
}
