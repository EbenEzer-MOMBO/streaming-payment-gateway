"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentCountdown from "@/app/components/PaymentCountdown";
import { checkBillStatus } from "@/services/paymentService";

export default function PaymentConfirmation() {
  const router = useRouter();
  
  // État pour les paramètres de l'URL
  const [billId, setBillId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  
  // État pour le statut du paiement
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);
  
  // Récupérer les paramètres de l'URL
  useEffect(() => {
    // Vérifier que window est défini (côté client uniquement)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setBillId(urlParams.get('bill_id'));
      setServiceName(urlParams.get('service_name'));
      setPaymentMethod(urlParams.get('payment_method'));
      setPhoneNumber(urlParams.get('phone_number'));
    }
  }, []);
  
  // Fonction pour gérer la fin du compte à rebours
  const handleCountdownComplete = () => {
    // Vérifier l'état du paiement après la fin du compte à rebours
    checkPaymentStatus();
  };
  
  // Fonction pour annuler le paiement
  const handleCancelPayment = () => {
    router.push("/");
  };
  
  // Fonction pour vérifier l'état du paiement
  const checkPaymentStatus = async () => {
    if (!billId) {
      setPaymentStatus("error");
      setErrorMessage("Identifiant de facture manquant");
      return;
    }
    
    try {
      const status = await checkBillStatus(billId);
      
      if (status.state === "paid" || status.state === "processed") {
        setPaymentStatus("paid");
        setShowCountdown(false);
      } else if (status.state === "ready") {
        setPaymentStatus("pending");
        // Afficher le compte à rebours si ce n'est pas déjà fait
        if (!showCountdown) {
          setShowCountdown(true);
        }
      } else {
        setPaymentStatus("error");
        setErrorMessage("État de paiement inconnu");
        setShowCountdown(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du paiement:", error);
      setPaymentStatus("error");
      setErrorMessage("Impossible de vérifier l&apos;état du paiement");
      setShowCountdown(false);
    }
  };
  
  useEffect(() => {
    // Vérifier l'état initial du paiement seulement si billId existe
    if (billId) {
      checkPaymentStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId]);
  
  const handleBackToHome = () => {
    router.push("/");
  };
  
  // Afficher un chargement si les paramètres ne sont pas encore chargés
  if (!billId) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>
        <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Chargement...</h2>
              <p className="text-white/70">Veuillez patienter</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Arrière-plan avec overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
          {/* Afficher le compte à rebours pour le paiement en attente */}
          {showCountdown && paymentStatus === "pending" && paymentMethod && phoneNumber && (
            <PaymentCountdown
              duration={180} // 3 minutes pour effectuer le paiement
              onComplete={handleCountdownComplete}
              onCancel={handleCancelPayment}
              paymentMethod={paymentMethod}
              phoneNumber={phoneNumber}
            />
          )}
          
          {paymentStatus === "loading" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Vérification du paiement...</h2>
              <p className="text-white/70">Veuillez patienter pendant que nous vérifions votre paiement</p>
            </div>
          )}
          
          {paymentStatus === "paid" && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Paiement réussi !</h2>
              <p className="text-white/70 mb-6">
                Votre abonnement à {serviceName} a été activé avec succès.
              </p>
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all"
              >
                Retour à l&apos;accueil
              </button>
            </div>
          )}
          
          {paymentStatus === "pending" && !showCountdown && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Paiement en cours...</h2>
              <p className="text-white/70 mb-6">
                Votre paiement est en cours de traitement. Veuillez ne pas fermer cette page.
              </p>
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          
          {paymentStatus === "error" && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Erreur de paiement</h2>
              <p className="text-white/70 mb-6">
                {errorMessage || "Une erreur s&apos;est produite lors du traitement de votre paiement."}
              </p>
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all"
              >
                Réessayer
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/70">Paiement sécurisé via E-Billing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}