import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface UserConfirmationEmailProps {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupDateTime: string;
  dropHotel: string;
  dropDateTime: string;
  totalPrice: string;
  depositAmount: string;
  userEmail: string;
  hotelDiscountCode?: string;
  locale?: string;
}

export const UserConfirmationEmail = ({
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
  locale = "fr",
}: UserConfirmationEmailProps) => {
  // Traductions pour les emails
  const translations = {
    fr: {
      subject: "Confirmation de votre réservation EasyBaby",
      preview: `Votre réservation ${reservationCode} est confirmée`,
      title: "Votre réservation est confirmée",
      hello: `Bonjour,`,
      confirmation: `Nous vous confirmons votre réservation de ${productName} avec EasyBaby.`,
      reservationDetails: "Détails de la réservation",
      reservationCode: "Code de réservation",
      product: "Produit",
      pickup: "Retrait",
      dropoff: "Retour",
      price: "Prix",
      deposit: "Caution",
      hotelDiscount: "Code de réduction hôtel",
      hotelDiscountInfo: "Utilisez ce code lors de votre réservation d'hôtel pour bénéficier d'une réduction.",
      instructions: "Instructions",
      pickupInstructions: "Présentez ce code à l'hôtel pour récupérer votre équipement.",
      questions: "Des questions ?",
      contact: "Contactez-nous à",
      footer: "© 2023 EasyBaby. Tous droits réservés.",
    },
    en: {
      subject: "Confirmation of your EasyBaby reservation",
      preview: `Your reservation ${reservationCode} is confirmed`,
      title: "Your reservation is confirmed",
      hello: `Hello,`,
      confirmation: `We confirm your reservation of ${productName} with EasyBaby.`,
      reservationDetails: "Reservation details",
      reservationCode: "Reservation code",
      product: "Product",
      pickup: "Pickup",
      dropoff: "Return",
      price: "Price",
      deposit: "Deposit",
      hotelDiscount: "Hotel discount code",
      hotelDiscountInfo: "Use this code when booking your hotel to get a discount.",
      instructions: "Instructions",
      pickupInstructions: "Present this code at the hotel to pick up your equipment.",
      questions: "Any questions?",
      contact: "Contact us at",
      footer: "© 2023 EasyBaby. All rights reserved.",
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Formatter les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const pickupDate = formatDate(pickupDateTime);
  const dropDate = formatDate(dropDateTime);

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.title}</Heading>
          
          <Text style={text}>
            {t.hello}
          </Text>
          
          <Text style={text}>
            {t.confirmation}
          </Text>
          
          <Section style={section}>
            <Heading as="h2" style={h2}>
              {t.reservationDetails}
            </Heading>
            
            <Text style={detailRow}>
              <strong>{t.reservationCode}:</strong> {reservationCode}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.product}:</strong> {productName}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.pickup}:</strong> {pickupHotel}, {pickupDate}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.dropoff}:</strong> {dropHotel}, {dropDate}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.price}:</strong> {totalPrice}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.deposit}:</strong> {depositAmount}
            </Text>
          </Section>
          
          {hotelDiscountCode && (
            <Section style={discountSection}>
              <Heading as="h2" style={h2}>
                {t.hotelDiscount}
              </Heading>
              
              <Text style={discountCode}>
                {hotelDiscountCode}
              </Text>
              
              <Text style={text}>
                {t.hotelDiscountInfo}
              </Text>
            </Section>
          )}
          
          <Section style={section}>
            <Heading as="h2" style={h2}>
              {t.instructions}
            </Heading>
            
            <Text style={text}>
              {t.pickupInstructions}
            </Text>
          </Section>
          
          <Text style={text}>
            {t.questions} <Link href={`mailto:contact@easybaby.io`}>{t.contact} contact@easybaby.io</Link>
          </Text>
          
          <Text style={footer}>
            {t.footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "15px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const section = {
  margin: "26px 0",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "5px",
};

const discountSection = {
  margin: "26px 0",
  padding: "20px",
  backgroundColor: "#f0f7ff",
  borderRadius: "5px",
  borderLeft: "5px solid #0070f3",
};

const discountCode = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "20px 0",
  padding: "10px",
  backgroundColor: "#e6f0ff",
  borderRadius: "5px",
  color: "#0070f3",
};

const detailRow = {
  margin: "8px 0",
  fontSize: "16px",
  color: "#333",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "50px",
  textAlign: "center" as const,
};

export default UserConfirmationEmail;
