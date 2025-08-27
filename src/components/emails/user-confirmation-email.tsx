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
  Img,
  Row,
  Column,
} from '@react-email/components';

interface UserConfirmationEmailProps {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupDate: string;
  dropoffHotel: string;
  dropoffDate: string;
  depositAmount: string;
  discountCode?: string;
}

export const UserConfirmationEmail = ({
  reservationCode,
  productName,
  pickupHotel,
  pickupDate,
  dropoffHotel,
  dropoffDate,
  depositAmount,
  discountCode,
}: UserConfirmationEmailProps) => {
  const previewText = `Votre réservation EasyBaby - ${productName} - ${reservationCode}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>EasyBaby</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Votre réservation est confirmée !
            </Heading>
            
                          <Text style={paragraph}>
                Merci d&apos;avoir choisi EasyBaby pour votre location d&apos;équipement.
                Voici les détails de votre réservation :
              </Text>

            <Section style={codeSection}>
              <Text style={codeText}>
                {reservationCode}
              </Text>
              <Text style={codeInstructions}>
                Présentez ce code à l&apos;hôtel pour récupérer votre équipement
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
                <Text style={valueText}>{pickupHotel}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={labelText}>Retour :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{dropoffDate}</Text>
                <Text style={valueText}>{dropoffHotel}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={labelText}>Caution :</Text>
              </Column>
              <Column>
                <Text style={valueText}>{depositAmount}</Text>
              </Column>
            </Row>
            
            {discountCode && (
              <Row>
                <Column>
                  <Text style={labelText}>Code utilisé :</Text>
                </Column>
                <Column>
                  <Text style={valueText}>{discountCode}</Text>
                </Column>
              </Row>
            )}
            
            <Hr style={hr} />
            
            <Text style={paragraph}>
              <strong>Important :</strong> Aucun montant n&apos;a été prélevé pour le moment. 
              La caution sera débitée uniquement en cas de non-retour ou de dommage sur l&apos;équipement.
            </Text>
            
            <Text style={paragraph}>
              Si vous avez des questions, n&apos;hésitez pas à nous contacter à{' '}
              <Link href="mailto:support@easybaby.io" style={link}>
                support@easybaby.io
              </Link>
              .
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

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '48px 0 0',
};

export default UserConfirmationEmail;
