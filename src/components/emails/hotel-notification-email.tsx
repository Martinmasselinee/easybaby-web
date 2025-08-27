import React from 'react';
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
  Hr,
  Row,
  Column,
} from '@react-email/components';

interface HotelNotificationEmailProps {
  reservationCode: string;
  productName: string;
  userEmail: string;
  userPhone: string;
  pickupDate: string;
  dropoffDate: string;
}

export const HotelNotificationEmail = ({
  reservationCode,
  productName,
  userEmail,
  userPhone,
  pickupDate,
  dropoffDate,
}: HotelNotificationEmailProps) => {
  const previewText = `Nouvelle réservation EasyBaby - ${reservationCode}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>EasyBaby</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Nouvelle réservation
            </Heading>
            
            <Text style={paragraph}>
              Une nouvelle réservation a été effectuée pour votre établissement.
              Voici les détails :
            </Text>

            <Section style={codeSection}>
              <Text style={codeText}>
                {reservationCode}
              </Text>
              <Text style={codeInstructions}>
                Code de réservation à vérifier lors du retrait
              </Text>
            </Section>

            <Hr style={hr} />
            
            <Heading as="h3" style={detailsHeading}>
              Détails de la réservation
            </Heading>
            
            <Row>
              <Column>
                <Text style={labelText}>Produit :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{productName}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={labelText}>Retrait :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{pickupDate}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={labelText}>Retour :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{dropoffDate}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={labelText}>Client :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{userEmail}</Text>
                <Text style={valueText}>{userPhone}</Text>
              </Column>
            </Row>
            
            <Hr style={hr} />
            
            <Text style={paragraph}>
              <strong>Note :</strong> Des événements ont été ajoutés à votre calendrier pour le retrait et le retour.
            </Text>
            
            <Text style={paragraph}>
              Pour toute réclamation (non-retour/casse), répondez à cet email avec le code de réservation.
            </Text>
          </Section>
          
          <Text style={footer}>
            &copy; {new Date().getFullYear()} EasyBaby. Tous droits réservés.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#111827',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const section = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const subheading = {
  fontSize: '22px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#111827',
  margin: '16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '16px 0',
};

const codeSection = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '5px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const codeText = {
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#111827',
  margin: '0 0 12px',
};

const codeInstructions = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const detailsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '24px 0 16px',
};

const labelText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  margin: '8px 0',
};

const valueText = {
  fontSize: '14px',
  color: '#111827',
  margin: '8px 0',
};

const footer = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '48px 0 0',
};

export default HotelNotificationEmail;
