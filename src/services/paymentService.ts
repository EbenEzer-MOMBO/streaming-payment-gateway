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
  state: "ready" | "paid" | "processed";
}

/**
 * Crée une nouvelle facture dans le système E-Billing
 */
export const createBill = async (payload: CreateBillPayload): Promise<BillResponse> => {
  try {
    const formData = new URLSearchParams();
    
    // Ajout des paramètres au formData
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    const response = await fetch("https://itech-gabon.alwaysdata.net/ebilling-pay/nouvelle_facture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data: CreateBillResponse = await response.json();
    
    if (data.success !== "transaction_completed") {
      throw new Error("La création de la facture a échoué");
    }
    
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
    
    const response = await fetch("https://itech-gabon.alwaysdata.net/ebilling-pay/etat_facture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data: BillStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état de la facture:", error);
    throw error;
  }
};

/**
 * Génère une référence externe unique
 */
export const generateExternalReference = (): string => {
  const prefix = "SPG"; // Streaming Payment Gateway
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}${timestamp}${random}`;
};
