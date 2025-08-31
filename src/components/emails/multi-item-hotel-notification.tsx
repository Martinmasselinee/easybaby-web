import React from "react";

interface MultiItemHotelNotificationEmailProps {
  reservationCode: string;
  userEmail: string;
  userPhone?: string;
  cityName: string;
  hotelName: string;
  items: Array<{
    productName: string;
    pickupDate: Date;
    dropDate: Date;
    quantity: number;
    priceCents: number;
    depositCents: number;
  }>;
}

export function MultiItemHotelNotificationEmail({
  reservationCode,
  userEmail,
  userPhone,
  cityName,
  hotelName,
  items,
}: MultiItemHotelNotificationEmailProps) {
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

  const totalPriceCents = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  const totalDepositCents = items.reduce((sum, item) => sum + (item.depositCents * item.quantity), 0);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#e91e63", margin: 0 }}>EasyBaby</h1>
        <h2 style={{ color: "#333", margin: "10px 0" }}>Nouvelle réservation</h2>
      </div>

      <div style={{ padding: "20px" }}>
        <p>Bonjour,</p>
        
        <p>Une nouvelle réservation a été effectuée pour votre hôtel.</p>

        <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Détails de la réservation</h3>
          <p style={{ margin: "5px 0" }}><strong>Code de réservation :</strong> {reservationCode}</p>
          <p style={{ margin: "5px 0" }}><strong>Hôtel :</strong> {hotelName}</p>
          <p style={{ margin: "5px 0" }}><strong>Ville :</strong> {cityName}</p>
          <p style={{ margin: "5px 0" }}><strong>Client :</strong> {userEmail}</p>
          {userPhone && <p style={{ margin: "5px 0" }}><strong>Téléphone :</strong> {userPhone}</p>}
        </div>

        <h3 style={{ color: "#333", margin: "20px 0 10px 0" }}>Équipements à préparer :</h3>
        
        {items.map((item, index) => (
          <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", margin: "10px 0" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#e91e63" }}>{item.productName}</h4>
            <p style={{ margin: "5px 0" }}><strong>Date de retrait :</strong> {formatDate(item.pickupDate)}</p>
            <p style={{ margin: "5px 0" }}><strong>Date de retour :</strong> {formatDate(item.dropDate)}</p>
            <p style={{ margin: "5px 0" }}><strong>Quantité :</strong> {item.quantity}</p>
            <p style={{ margin: "5px 0" }}><strong>Prix :</strong> {formatPrice(item.priceCents)}</p>
            <p style={{ margin: "5px 0" }}><strong>Caution :</strong> {formatPrice(item.depositCents)}</p>
          </div>
        ))}

        <div style={{ backgroundColor: "#e91e63", color: "white", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Total pour votre hôtel</h3>
          <p style={{ margin: "5px 0" }}><strong>Prix total :</strong> {formatPrice(totalPriceCents)}</p>
          <p style={{ margin: "5px 0" }}><strong>Caution totale :</strong> {formatPrice(totalDepositCents)}</p>
          <p style={{ margin: "5px 0" }}><strong>Montant total :</strong> {formatPrice(totalPriceCents + totalDepositCents)}</p>
        </div>

        <div style={{ backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "8px", padding: "15px", margin: "20px 0" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#155724" }}>Actions requises :</h4>
          <ul style={{ margin: "0", paddingLeft: "20px", color: "#155724" }}>
            <li>Préparez les équipements listés ci-dessus</li>
            <li>Vérifiez que le code de réservation correspond</li>
            <li>Demandez une pièce d'identité lors du retrait</li>
            <li>Confirmez le retour des équipements</li>
          </ul>
        </div>

        <p>Merci pour votre collaboration !</p>
        <p>L'équipe EasyBaby</p>
      </div>
    </div>
  );
}
