import React from "react";

interface MultiItemUserConfirmationEmailProps {
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

export function MultiItemUserConfirmationEmail({
  reservationCode,
  cityName,
  items,
  totalPriceCents,
  totalDepositCents,
}: MultiItemUserConfirmationEmailProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#e91e63", margin: 0 }}>EasyBaby</h1>
        <h2 style={{ color: "#333", margin: "10px 0" }}>Confirmation de réservation</h2>
      </div>

      <div style={{ padding: "20px" }}>
        <p>Bonjour,</p>
        
        <p>Votre réservation a été confirmée avec succès !</p>

        <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Détails de la réservation</h3>
          <p style={{ margin: "5px 0" }}><strong>Code de réservation :</strong> {reservationCode}</p>
          <p style={{ margin: "5px 0" }}><strong>Ville :</strong> {cityName}</p>
        </div>

        <h3 style={{ color: "#333", margin: "20px 0 10px 0" }}>Équipements réservés :</h3>
        
        {items.map((item, index) => (
          <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", margin: "10px 0" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#e91e63" }}>{item.productName}</h4>
            <p style={{ margin: "5px 0" }}><strong>Hôtel de retrait :</strong> {item.pickupHotelName}</p>
            <p style={{ margin: "5px 0" }}><strong>Hôtel de retour :</strong> {item.dropHotelName}</p>
            <p style={{ margin: "5px 0" }}><strong>Date de retrait :</strong> {formatDate(item.pickupDate)}</p>
            <p style={{ margin: "5px 0" }}><strong>Date de retour :</strong> {formatDate(item.dropDate)}</p>
            <p style={{ margin: "5px 0" }}><strong>Quantité :</strong> {item.quantity}</p>
            <p style={{ margin: "5px 0" }}><strong>Prix :</strong> {formatPrice(item.priceCents)}</p>
            <p style={{ margin: "5px 0" }}><strong>Caution :</strong> {formatPrice(item.depositCents)}</p>
          </div>
        ))}

        <div style={{ backgroundColor: "#e91e63", color: "white", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Total</h3>
          <p style={{ margin: "5px 0" }}><strong>Prix total :</strong> {formatPrice(totalPriceCents)}</p>
          <p style={{ margin: "5px 0" }}><strong>Caution totale :</strong> {formatPrice(totalDepositCents)}</p>
          <p style={{ margin: "5px 0" }}><strong>Montant total payé :</strong> {formatPrice(totalPriceCents + totalDepositCents)}</p>
        </div>

        <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: "8px", padding: "15px", margin: "20px 0" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>Instructions importantes :</h4>
          <ul style={{ margin: "0", paddingLeft: "20px", color: "#856404" }}>
            <li>Présentez ce code de réservation lors du retrait de vos équipements</li>
            <li>Assurez-vous d'avoir une pièce d'identité avec vous</li>
            <li>Les équipements doivent être retournés dans le même état</li>
            <li>En cas de question, contactez directement l'hôtel concerné</li>
          </ul>
        </div>

        <p>Merci de votre confiance !</p>
        <p>L'équipe EasyBaby</p>
      </div>
    </div>
  );
}
