"use client";

import { useState } from "react";
import { 
  CardElement, 
  Elements, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import { Button } from "@/components/ui/button";

// Traductions statiques
const translations = {
  fr: {
    cardDetails: "Détails de la carte",
    depositInfo: "Information sur la caution",
    depositNotice: "Prélèvement de 0€ maintenant. En cas de non-retour ou dommage, nous pourrons débiter la caution.",
    processing: "Traitement en cours...",
    confirm: "Confirmer le paiement"
  },
  en: {
    cardDetails: "Card Details",
    depositInfo: "Deposit Information",
    depositNotice: "€0 charged now. In case of non-return or damage, we may charge the deposit.",
    processing: "Processing...",
    confirm: "Confirm Payment"
  }
};

// Types pour les props
interface PaymentFormProps {
  clientSecret: string;
  setupIntentSecret: string;
  onSuccess: (paymentIntentId: string, setupIntentId: string) => void;
  onError: (error: string) => void;
  depositAmount: number;
  currency: string;
  locale?: string;
}

// Le formulaire de paiement qui utilise les éléments Stripe
const PaymentForm = ({
  clientSecret,
  setupIntentSecret,
  onSuccess,
  onError,
  depositAmount,
  currency,
  locale = 'fr'
}: PaymentFormProps) => {
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js n'a pas encore chargé
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirmer le PaymentIntent (pré-autorisation)
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || "Erreur lors du traitement du paiement");
      }

      // Confirmer le SetupIntent (pour sauvegarder la carte)
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
        setupIntentSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (setupError) {
        throw new Error(setupError.message || "Erreur lors de la sauvegarde de la carte");
      }

      if (paymentIntent?.id && setupIntent?.id) {
        onSuccess(paymentIntent.id, setupIntent.id);
      } else {
        throw new Error("Informations de paiement manquantes");
      }
    } catch (error: unknown) {
      console.error("Erreur de paiement:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors du paiement");
      onError(error.message || "Une erreur est survenue lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t.cardDetails}
          </label>
          <div className="border rounded-md p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-md">
          <p className="text-sm font-medium mb-1">
            {t.depositInfo}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.depositNotice}
          </p>
          <p className="mt-2 font-medium">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: currency,
            }).format(depositAmount / 100)}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing
          ? t.processing
          : t.confirm}
      </Button>
    </form>
  );
};

// Wrapper qui fournit le contexte Stripe
export const StripePaymentFormWrapper = ({
  clientSecret,
  setupIntentSecret,
  onSuccess,
  onError,
  depositAmount,
  currency = "EUR",
  locale = "fr",
}: PaymentFormProps) => {
  return (
    <Elements stripe={getStripe()}>
      <PaymentForm
        clientSecret={clientSecret}
        setupIntentSecret={setupIntentSecret}
        onSuccess={onSuccess}
        onError={onError}
        depositAmount={depositAmount}
        currency={currency}
        locale={locale}
      />
    </Elements>
  );
};
