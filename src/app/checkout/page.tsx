"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PhoneNumberInput from "../components/PhoneNumberInput";
import PaymentProgressBar from "../components/PaymentProgressBar";
import { createBill, generateExternalReference } from "@/services/paymentService";

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "airtel",
    name: "Airtel Money",
    logo: "/airtel_money.png",
  },
  {
    id: "moov",
    name: "Moov Money",
    logo: "/moov_money.png",
  }
];

// Données des services disponibles
const services = {
  "netflix": {
    id: "netflix",
    name: "Netflix",
    price: "100"
  },
  "prime": {
    id: "prime",
    name: "Prime Video",
    price: "100"
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // État pour les informations de l'acheteur
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  
  // État pour le numéro de paiement
  const [paymentNumber, setPaymentNumber] = useState("");

  // État pour les messages d'erreur de validation
  const [paymentNumberError, setPaymentNumberError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // État pour le processus de paiement
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  
  // État pour stocker le service sélectionné
  const [selectedService, setSelectedService] = useState<{id: string, name: string, price: string} | null>(null);
  
  // Récupérer les paramètres d'URL de manière sécurisée
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('service');
      
      if (serviceId && services[serviceId as keyof typeof services]) {
        setSelectedService(services[serviceId as keyof typeof services]);
      } else {
        // Si pas de service valide dans l'URL, rediriger vers la page d'accueil
        router.push('/');
      }
    }
  }, [router]);
  
  const validatePaymentPhone = (phone: string, paymentType: string | null): string => {
    if (!phone || !paymentType) return '';
    
    // Supprimer tous les espaces et caractères non numériques sauf le +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (paymentType === 'moov') {
      // Format Moov: doit commencer par 06 et avoir 9 chiffres au total
      if (!/^06\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Moov Money doit respecter le format 06XXXXXXX (9 chiffres)';
      }
    } else if (paymentType === 'airtel') {
      // Format Airtel: doit commencer par 07 et avoir 9 chiffres au total
      if (!/^07\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Airtel Money doit respecter le format 07XXXXXXX (9 chiffres)';
      }
    }
    
    return '';
  };
  
  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuyerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validation du numéro de téléphone
  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    
    // Supprimer tous les espaces et caractères non numériques sauf le +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Vérifier que le numéro a au moins 9 chiffres
    if (cleanPhone.length < 9) {
      return 'Le numéro de téléphone doit avoir au moins 9 chiffres';
    }
    
    // Vérifier que le numéro commence par 0, +241, 241
    if (!cleanPhone.startsWith('0') && !cleanPhone.startsWith('+241') && !cleanPhone.startsWith('241')) {
      return 'Le numéro doit commencer par 0, +241 ou 241';
    }
    
    return '';
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    // Vérifier tous les champs requis et la validation
    return (
      buyerInfo.name.trim() !== "" && 
      buyerInfo.phone.trim() !== "" && 
      !phoneError &&
      selectedPaymentMethod !== null &&
      paymentNumber.trim() !== "" &&
      !paymentNumberError && // S'assurer qu'il n'y a pas d'erreur de validation
      selectedService !== null // S'assurer qu'un service est sélectionné
    );
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      return;
    }
    
    // Valider le numéro de téléphone
    const phoneError = validatePhone(buyerInfo.phone);
    setPhoneError(phoneError);
    
    // Valider le numéro de paiement
    const paymentError = validatePaymentPhone(paymentNumber, selectedPaymentMethod);
    setPaymentNumberError(paymentError);
    
    if (isFormValid()) {
      setIsProcessing(true);
      setPaymentError("");
      setShowProgressBar(true);
      
      // Utiliser le composant PaymentProgressBar pour afficher la progression
      // Le traitement réel se fera après la durée du ProgressBar
      setTimeout(async () => {
        try {
          // Déterminer le système de paiement pour l'API
          const paymentSystem = selectedPaymentMethod === "airtel" ? "airtelmoney" : "moovmoney1";
          
          // Créer la facture via l'API
          const bill = await createBill({
            payer_email: buyerInfo.email || "ebenezermombo@gmail.com",
            payer_msisdn: paymentNumber,
            amount: Number(selectedService.price),
            short_description: `Abonnement ${selectedService.name}`,
            external_reference: generateExternalReference(),
            payer_last_name: buyerInfo.name.split(' ')[0],
            payer_first_name: buyerInfo.name.split(' ').slice(1).join(' ') || buyerInfo.name,
            payment_system: paymentSystem
          });
          
          // Rediriger vers la page de confirmation avec l'ID de la facture et les informations de paiement
          router.push(`/checkout/confirmation?bill_id=${bill.bill_id}&service_name=${selectedService.name}&payment_method=${selectedPaymentMethod}&phone_number=${paymentNumber}`);
        } catch (error) {
          console.error("Erreur lors du traitement du paiement:", error);
          setPaymentError("Une erreur s'est produite lors du traitement du paiement. Veuillez réessayer.");
          setIsProcessing(false);
          setShowProgressBar(false);
        }
      }, 10000); // Délai de 10 secondes pour le ProgressBar
    }
  };
  
  // Fonction appelée lorsque le ProgressBar est terminé
  const handleProgressComplete = () => {
    // Cette fonction ne fait rien car la redirection est gérée dans le setTimeout
    // mais elle est nécessaire pour le composant PaymentProgressBar
  };

  // Réinitialiser l'erreur de validation lorsque le moyen de paiement change
  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setPaymentNumber("");
    setPaymentNumberError("");
  };

  // Si nous sommes en train de charger le service ou si aucun service n'est sélectionné
  if (!selectedService) {
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
      {/* Afficher le ProgressBar pendant le traitement */}
      {showProgressBar && (
        <PaymentProgressBar
          duration={10} // Durée en secondes
          onComplete={handleProgressComplete}
          title="Création de votre facture"
          description="Veuillez patienter pendant que nous préparons votre paiement..."
        />
      )}
      
      {/* Arrière-plan avec overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Finaliser votre commande</h1>
            <p className="text-white/70">Complétez les informations ci-dessous pour activer votre abonnement</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bloc récapitulatif */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{selectedService.name}</p>
                  <p className="text-white/70 text-sm">Abonnement mensuel</p>
                </div>
                <p className="text-white font-bold">{selectedService.price} FCFA</p>
              </div>
            </div>

            {/* Bloc informations acheteur */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Informations personnelles</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={buyerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Entrez votre nom"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                    Numéro (WhatsApp si possible) *
                  </label>
                  <div>
                    <PhoneNumberInput
                      value={buyerInfo.phone}
                      onChange={(value) => {
                        handleInputChange({ target: { name: "phone", value } } as React.ChangeEvent<HTMLInputElement>);
                        const error = validatePhone(value);
                        setPhoneError(error);
                      }}
                      required
                      className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${phoneError ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20`}
                    />
                    {phoneError && (
                      <p className="mt-2 text-sm text-red-400">{phoneError}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={buyerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Entrez votre email"
                  />
                </div>
              </div>
            </div>

            {/* Bloc moyen de paiement */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Moyen de paiement</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedPaymentMethod === method.id
                          ? "bg-white/20 border border-white/30"
                          : "bg-white/10 border border-white/5 hover:bg-white/15"
                      }`}
                      onClick={() => handlePaymentMethodChange(method.id)}
                    >
                       <div className="w-10 h-10 relative flex-shrink-0 bg-white rounded-md flex items-center justify-center">
                        <Image
                          src={method.logo}
                          alt={method.name}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="ml-3 text-white">{method.name}</span>
                      <div className="ml-auto">
                        <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                          {selectedPaymentMethod === method.id && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPaymentMethod && (
                  <div className="mt-4 animate-fade-in">
                    <label htmlFor="paymentNumber" className="block text-white text-sm font-medium mb-2">
                      Numéro {selectedPaymentMethod === "airtel" ? "Airtel Money" : "Moov Money"} *
                    </label>
                    <div>
                      <input
                        type="tel"
                        id="paymentNumber"
                        value={paymentNumber}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setPaymentNumber(newValue);
                          const error = validatePaymentPhone(newValue, selectedPaymentMethod);
                          setPaymentNumberError(error);
                        }}
                        required
                        className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${paymentNumberError ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20`}
                        placeholder={`Entrez votre numéro ${selectedPaymentMethod === "airtel" ? "Airtel Money" : "Moov Money"}`}
                      />
                      {paymentNumberError && (
                        <p className="mt-2 text-sm text-red-400">{paymentNumberError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message d'erreur de paiement */}
            {paymentError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-center">{paymentError}</p>
              </div>
            )}
            
            {/* Note de paiement sécurisé */}
            <div className="flex items-center justify-center mb-4">
              <div className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/70">Paiement sécurisé via E-Billing</p>
            </div>
            
            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={!isFormValid() || isProcessing}
              className={`w-full py-4 px-6 rounded-lg text-white font-medium transition-all ${
                isFormValid() && !isProcessing
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-600 cursor-not-allowed opacity-70"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
                  Traitement en cours...
                </div>
              ) : (
                "Confirmer le paiement"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}