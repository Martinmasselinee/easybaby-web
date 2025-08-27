import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface HotelNotificationEmailProps {
  hotelName: string;
  reservationCode: string;
  productName: string;
  pickupDateTime: string;
  dropDateTime: string;
  customerEmail: string;
  customerPhone?: string;
  locale?: string;
}

export const HotelNotificationEmail = ({
  hotelName,
  reservationCode,
  productName,
  pickupDateTime,
  dropDateTime,
  customerEmail,
  customerPhone,
  locale = "fr",
}: HotelNotificationEmailProps) => {
  // Traductions pour les emails
  const translations = {
    fr: {
      subject: `Nouvelle réservation EasyBaby - ${reservationCode}`,
      preview: `Nouvelle réservation ${reservationCode} pour ${productName}`,
      title: "Nouvelle réservation EasyBaby",
      hello: `Bonjour ${hotelName},`,
      notification: `Vous avez une nouvelle réservation pour ${productName}.`,
      reservationDetails: "Détails de la réservation",
      reservationCode: "Code de réservation",
      product: "Produit",
      pickup: "Retrait",
      dropoff: "Retour",
      customer: "Client",
      customerContact: "Contact client",
      instructions: "Instructions",
      prepareInstructions: "Veuillez préparer l'équipement pour le client à la date et l'heure indiquées.",
      verifyInstructions: "Vérifiez le code de réservation avant de remettre l'équipement.",
      questions: "Des questions ?",
      contact: "Contactez-nous à",
      footer: "© 2023 EasyBaby. Tous droits réservés.",
    },
    en: {
      subject: `New EasyBaby reservation - ${reservationCode}`,
      preview: `New reservation ${reservationCode} for ${productName}`,
      title: "New EasyBaby reservation",
      hello: `Hello ${hotelName},`,
      notification: `You have a new reservation for ${productName}.`,
      reservationDetails: "Reservation details",
      reservationCode: "Reservation code",
      product: "Product",
      pickup: "Pickup",
      dropoff: "Return",
      customer: "Customer",
      customerContact: "Customer contact",
      instructions: "Instructions",
      prepareInstructions: "Please prepare the equipment for the customer at the specified date and time.",
      verifyInstructions: "Verify the reservation code before handing over the equipment.",
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
            {t.notification}
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
              <strong>{t.pickup}:</strong> {pickupDate}
            </Text>
            
            <Text style={detailRow}>
              <strong>{t.dropoff}:</strong> {dropDate}
            </Text>
          </Section>
          
          <Section style={customerSection}>
            <Heading as="h2" style={h2}>
              {t.customer}
            </Heading>
            
            <Text style={detailRow}>
              <strong>Email:</strong> {customerEmail}
            </Text>
            
            {customerPhone && (
              <Text style={detailRow}>
                <strong>{t.customerContact}:</strong> {customerPhone}
              </Text>
            )}
          </Section>
          
          <Section style={section}>
            <Heading as="h2" style={h2}>
              {t.instructions}
            </Heading>
            
            <Text style={text}>
              {t.prepareInstructions}
            </Text>
            
            <Text style={text}>
              {t.verifyInstructions}
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

const customerSection = {
  margin: "26px 0",
  padding: "20px",
  backgroundColor: "#f0f7ff",
  borderRadius: "5px",
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

export default HotelNotificationEmail;
