"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  
  // État pour le minuteur
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [progress, setProgress] = useState(100);
  
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
  
  // Gestion du minuteur
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          // Vérifier le statut du paiement lorsque le compteur atteint zéro
          checkPaymentStatus();
          return 0;
        }
        return prevTime - 1;
      });
      
      setProgress((prevProgress) => {
        return (timeLeft - 1) / 60 * 100;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [paymentStatus, timeLeft]);
  
  // Fonction pour formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Fonction pour annuler le paiement
  const handleCancelPayment = () => {
    router.push("/");
  };
  
  // Fonction pour vérifier l'état du paiement
  const checkPaymentStatus = async () => {
    if (!billId) {
      console.error("Identifiant de facture manquant");
      setPaymentStatus("error");
      setErrorMessage("Identifiant de facture manquant");
      return;
    }
    
    console.log("Vérification du statut de paiement pour la facture:", billId);
    
    try {
      const status = await checkBillStatus(billId);
      console.log("Statut reçu:", status);
      
      if (status.state === "paid" || status.state === "processed") {
        console.log("Paiement confirmé:", status.state);
        setPaymentStatus("paid");
      } else if (status.state === "ready" || status.state === "pending") {
        console.log("Paiement en attente:", status.state);
        setPaymentStatus("pending");
      } else {
        console.error("État de paiement inconnu:", status.state);
        setPaymentStatus("error");
        setErrorMessage(`État de paiement inconnu: ${status.state}`);
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification du paiement:", error);
      setPaymentStatus("error");
      setErrorMessage(`Erreur: ${error.message || "Impossible de vérifier l'état du paiement"}`);
    }
  };
  
  useEffect(() => {
    // Vérifier l'état initial du paiement seulement si billId existe
    if (billId) {
      checkPaymentStatus();
      
      // Mettre en place une vérification périodique toutes les 3 secondes
      const intervalId = setInterval(() => {
        if (paymentStatus !== "paid" && paymentStatus !== "error") {
          console.log("Vérification périodique du paiement...");
          checkPaymentStatus();
        } else {
          // Arrêter la vérification si le paiement est terminé ou en erreur
          clearInterval(intervalId);
        }
      }, 3000); // Vérification toutes les 3 secondes
      
      // Nettoyer l'intervalle lors du démontage du composant
      return () => clearInterval(intervalId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId, paymentStatus]);
  
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
  
  // Obtenir le logo du mode de paiement
  const getPaymentLogo = () => {
    if (paymentMethod === 'moov') {
      return "/moov_money.png"; // Logo Moov Money
    } else if (paymentMethod === 'airtel') {
      return "/airtel_money.png"; // Logo Airtel Money
    }
    return "";
  };
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Arrière-plan avec overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
          
          {paymentStatus === "loading" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Vérification du paiement...</h2>
              <p className="text-white/70">Veuillez patienter pendant que nous vérifions votre paiement</p>
            </div>
          )}
          
          {paymentStatus === "pending" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
              <div className="text-center">
                {/* Logo du mode de paiement */}
                <div className="mx-auto mb-6 w-24 h-24 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center p-2">
                  <img 
                    src={getPaymentLogo()} 
                    alt={paymentMethod === "airtel" ? "Airtel Money" : "Moov Money"}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                {/* Titre */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  Confirmation du paiement
                </h3>
                
                {/* Instructions */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-300 font-medium mb-2">
                    ⚠️ Ne fermez pas cet écran
                  </p>
                  <p className="text-sm text-white/80">
                    Vérifiez votre téléphone <strong className="text-white">{phoneNumber}</strong> et suivez les instructions {paymentMethod?.toUpperCase()} pour confirmer le paiement.
                  </p>
                </div>
                
                {/* Décompte visuel */}
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    {/* Cercle de fond */}
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="rgba(59, 130, 246, 0.8)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="339.292"
                        strokeDashoffset={339.292 * (1 - progress / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{formatTime(timeLeft)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression linéaire */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-white/70">
                    Vérification automatique toutes les 3 secondes...
                  </p>
                </div>
                
                {/* Messages d'état */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center text-sm text-white/70">
                    <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    En attente de confirmation
                  </div>
                </div>
                
                {/* Bouton d'annulation */}
                <button
                  onClick={handleCancelPayment}
                  className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
              </div>
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
                Votre abonnement à {serviceName} a été payé avec succès. Vous recevrez les instructions de connexion sur WhatsApp ou dans votre boîte mail.
              </p>
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all"
              >
                Retour à l&apos;accueil
              </button>
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