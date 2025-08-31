import { resend } from "@/lib/email/resend";
import { MultiItemUserConfirmationEmail } from "@/components/emails/multi-item-user-confirmation";
import { MultiItemHotelNotificationEmail } from "@/components/emails/multi-item-hotel-notification";

export interface MultiItemEmailData {
  userEmail: string;
  reservationCode: string;
  cityName: string;
  items: Array<{
    productName: string;
    pickupHotelName: string;
    dropHotelName: string;
    pickupDate: Date;
    dropDate: Date;
    quantity: number;
    priceCents: number;
    depositCents: number;
  }>;
  totalPriceCents: number;
  totalDepositCents: number;
}

export interface MultiItemHotelNotificationData {
  basketReservationId: string;
  reservationCode: string;
  userEmail: string;
  userPhone?: string;
  cityName: string;
  items: any[]; // Will be filtered by hotel
}

export async function sendMultiItemUserConfirmation(data: MultiItemEmailData) {
  try {
    await resend.emails.send({
      from: "EasyBaby <noreply@easybaby.com>",
      to: [data.userEmail],
      subject: `Confirmation de réservation - ${data.reservationCode}`,
      react: MultiItemUserConfirmationEmail({
        reservationCode: data.reservationCode,
        cityName: data.cityName,
        items: data.items,
        totalPriceCents: data.totalPriceCents,
        totalDepositCents: data.totalDepositCents,
      }),
    });
  } catch (error) {
    console.error("Failed to send multi-item user confirmation:", error);
    throw error;
  }
}

export async function sendMultiItemHotelNotifications(data: MultiItemHotelNotificationData) {
  try {
    // Group items by hotel
    const hotelGroups = new Map<string, any[]>();
    
    for (const item of data.items) {
      const pickupHotelId = item.pickupHotelId;
      if (!hotelGroups.has(pickupHotelId)) {
        hotelGroups.set(pickupHotelId, []);
      }
      hotelGroups.get(pickupHotelId)!.push(item);
    }

    // Send notification to each hotel
    for (const [hotelId, hotelItems] of hotelGroups) {
      const hotel = hotelItems[0].pickupHotel;
      
      if (hotel.email) {
        await resend.emails.send({
          from: "EasyBaby <noreply@easybaby.com>",
          to: [hotel.email],
          subject: `Nouvelle réservation - ${data.reservationCode}`,
          react: MultiItemHotelNotificationEmail({
            reservationCode: data.reservationCode,
            userEmail: data.userEmail,
            userPhone: data.userPhone,
            cityName: data.cityName,
            hotelName: hotel.name,
            items: hotelItems.map(item => ({
              productName: item.product.name,
              pickupDate: item.pickupDate,
              dropDate: item.dropDate,
              quantity: item.quantity,
              priceCents: item.priceCents,
              depositCents: item.depositCents,
            })),
          }),
        });
      }
    }
  } catch (error) {
    console.error("Failed to send multi-item hotel notifications:", error);
    throw error;
  }
}
