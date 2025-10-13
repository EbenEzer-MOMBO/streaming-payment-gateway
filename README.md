# Streaming Payment Gateway

<img width="1440" height="818" alt="Capture d’écran 2025-10-13 à 11 10 11" src="https://github.com/user-attachments/assets/6d5b9233-162c-4aa6-aa4f-9bbbee7740fa" />


Une passerelle de paiement sécurisée pour les services de streaming, développée avec Next.js et intégrée avec les solutions de paiement mobile en Afrique (Airtel Money, Moov Money).

## Fonctionnalités

- Interface utilisateur moderne avec design responsive
- Intégration avec l'API E-Billing pour les paiements mobiles
- Gestion sécurisée des transactions
- Validation des paiements en temps réel
- Protection contre la manipulation des montants
- Système anti-CSRF intégré

## Mesures de sécurité

Le système implémente plusieurs niveaux de sécurité pour garantir l'intégrité des paiements :

- **Validation des prix côté serveur** : Les prix des services sont définis et vérifiés côté serveur
- **Double vérification des montants** : Validation avant et après la création de facture
- **Protection CSRF** : Jetons uniques générés pour chaque transaction
- **Validation des données** : Vérification stricte des numéros de téléphone et informations de paiement

## Architecture

Le projet est structuré comme suit :

- `/src/app` - Pages et composants de l'application
  - `/checkout` - Processus de paiement et confirmation
  - `/components` - Composants réutilisables (PaymentProgressBar, PhoneNumberInput, etc.)
- `/src/services` - Services d'intégration avec les API externes
- `/public` - Ressources statiques (images, logos)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/streaming-payment-gateway.git
cd streaming-payment-gateway

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Configuration

Aucune configuration spécifique n'est requise pour le développement local. Pour le déploiement en production, assurez-vous de configurer correctement les variables d'environnement si nécessaire.

## Technologies utilisées

- **Frontend** : Next.js, React, TailwindCSS
- **API de paiement** : E-Billing
- **Méthodes de paiement** : Airtel Money, Moov Money
<img width="1200" height="1197" alt="airtel_money" src="https://github.com/user-attachments/assets/ccdc116a-25c9-4f91-99e0-1515fa572024" />
<img width="512" height="512" alt="moov_money" src="https://github.com/user-attachments/assets/9ca3692c-f4fa-4dd2-b3a4-54974d068da2" />

## Déploiement

Le moyen le plus simple de déployer cette application est d'utiliser la [plateforme Vercel](https://vercel.com/new).

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.
