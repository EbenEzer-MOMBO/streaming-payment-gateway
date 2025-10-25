// Service de paiement utilisant l'API E-Billing

interface CreateBillPayload {
  payer_email: string;
  payer_msisdn: string;
  amount: number;
  short_description: string;
  external_reference: string;
  payer_last_name: string;
  payer_first_name: string;
  payment_system: string;
}

interface BillResponse {
  bill_id: string;
  payer_email: string;
  payer_msisdn: string;
  amount: number;
  currency: string;
  state: string;
  created_at: string;
  short_description: string;
  due_date: string;
  external_reference: string;
  payer_name: string;
  payee_id: string;
  payee_name: string;
  [key: string]: unknown;
}

interface CreateBillResponse {
  success: string;
  success_message: string;
  response: {
    e_bills: BillResponse[];
  };
}

interface BillStatusResponse {
  state: "ready" | "paid" | "processed" | "pending";
}

// Définition des prix officiels des services pour validation côté serveur
const OFFICIAL_SERVICE_PRICES = {
  "netflix": 2500,
  "prime": 2500
};

/**
 * Valide le montant du paiement en fonction du service sélectionné
 */
const validateServiceAmount = (serviceId: string, amount: number): boolean => {
  if (!serviceId || !OFFICIAL_SERVICE_PRICES[serviceId as keyof typeof OFFICIAL_SERVICE_PRICES]) {
    return false;
  }
  
  return OFFICIAL_SERVICE_PRICES[serviceId as keyof typeof OFFICIAL_SERVICE_PRICES] === amount;
};

/**
 * Crée une nouvelle facture dans le système E-Billing
 */
export const createBill = async (payload: CreateBillPayload): Promise<BillResponse> => {
  try {
    // Extraire le service ID à partir de la description
    const serviceMatch = payload.short_description.match(/Abonnement\s+(\w+)/i);
    const serviceId = serviceMatch ? serviceMatch[1].toLowerCase() : null;
    
    // Valider le montant du paiement
    if (!serviceId || !validateServiceAmount(serviceId, payload.amount)) {
      console.error("Tentative de manipulation du montant détectée:", {
        service: serviceId,
        requestedAmount: payload.amount,
        officialAmount: serviceId ? OFFICIAL_SERVICE_PRICES[serviceId as keyof typeof OFFICIAL_SERVICE_PRICES] : "unknown"
      });
      throw new Error("Montant de paiement non valide pour ce service");
    }
    
    const formData = new URLSearchParams();
    
    // Ajout des paramètres au formData
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    console.log("Création d'une nouvelle facture avec les données:", payload);
    
    const response = await fetch("https://itech-gabon.alwaysdata.net/ebilling-pay/nouvelle_facture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      console.error(`Erreur HTTP lors de la création de facture: ${response.status}`);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log("Réponse brute de l'API (création):", responseText);
    
    let data: CreateBillResponse;
    try {
      data = JSON.parse(responseText);
      console.log("Réponse parsée de création de facture:", data);
    } catch (parseError) {
      console.error("Erreur de parsing JSON (création):", parseError);
      console.error("Réponse non-JSON reçue:", responseText);
      throw new Error("Réponse invalide du serveur lors de la création de facture");
    }
    
    if (data.success !== "transaction_completed") {
      console.error("La création de la facture a échoué:", data);
      throw new Error("La création de la facture a échoué");
    }
    
    console.log("Facture créée avec succès:", data.response.e_bills[0]);
    
    // Nous ne faisons plus l'appel webhook ici, il sera fait dans le composant checkout
    // pour inclure les informations complètes de l'acheteur
    
    return data.response.e_bills[0];
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw error;
  }
};

/**
 * Vérifie l'état d'une facture
 */
export const checkBillStatus = async (billId: string): Promise<BillStatusResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append("bill_id", billId);
    
    console.log("Vérification de l'état de la facture:", billId);
    
    const response = await fetch("https://itech-gabon.alwaysdata.net/ebilling-pay/etat_facture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      console.error(`Erreur HTTP lors de la vérification: ${response.status}`);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log("Réponse brute de l'API:", responseText);
    
    let data: BillStatusResponse;
    try {
      data = JSON.parse(responseText);
      console.log("État de la facture parsé:", data);
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      console.error("Réponse non-JSON reçue:", responseText);
      throw new Error("Réponse invalide du serveur");
    }
    
    if (!data.state) {
      console.error("État de paiement manquant dans la réponse:", data);
      throw new Error("État de paiement manquant dans la réponse");
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état de la facture:", error);
    throw error;
  }
};

/**
 * Génère une référence externe unique avec un jeton anti-CSRF
 */
export const generateExternalReference = (): string => {
  const prefix = "SPG"; // Streaming Payment Gateway
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const csrfToken = Math.random().toString(36).substring(2, 15);
  
  // Stockage du token CSRF dans le sessionStorage pour validation ultérieure
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', csrfToken);
  }
  
  return `${prefix}${timestamp}${random}_${csrfToken}`;
};

/**
 * Expose les prix officiels pour validation côté client
 */
export const getOfficialServicePrice = (serviceId: string): number | null => {
  return OFFICIAL_SERVICE_PRICES[serviceId as keyof typeof OFFICIAL_SERVICE_PRICES] || null;
};