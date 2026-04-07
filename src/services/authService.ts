// src/services/authService.ts
// Service d'authentification : connexion, inscription, changement de mot de passe.
// Communique avec l'API Symfony via l'instance Axios centralisée.
// Après une connexion réussie, décode le JWT pour récupérer les infos utilisateur.

import apiClient from './api';

// ─── Types des données envoyées à l'API ──────────────────────────────────────

// Données nécessaires pour se connecter
interface DonneesConnexion {
  email: string;
  password: string;
}

// Données nécessaires pour créer un compte
interface DonneesInscription {
  email: string;
  password: string;
  prenom: string;
  nom: string;
}

// ─── Types des réponses de l'API ──────────────────────────────────────────────

// Réponse de l'API lors d'une connexion réussie
interface ReponseLogin {
  token: string;
}

// Contenu du payload JWT décodé (les informations dans le token)
export interface PayloadJWT {
  id: number;
  email: string;
  roles: string[];
  prenom: string;
  nom: string;
}

// ─── Décodage du JWT ──────────────────────────────────────────────────────────

// Décode la partie "payload" d'un JWT sans vérifier la signature.
// Le JWT est structuré ainsi : header.payload.signature (séparés par des points)
// La partie payload est encodée en Base64 et contient les données de l'utilisateur.
const decoderPayloadJWT = (token: string): PayloadJWT | null => {
  try {
    // Sépare les 3 parties du JWT et prend la partie centrale (index 1)
    const partiePayload = token.split('.')[1];

    // Le JWT utilise Base64 "URL-safe" (- et _) → on le convertit en Base64 standard
    const base64Standard = partiePayload.replace(/-/g, '+').replace(/_/g, '/');

    // Décode le Base64 en chaîne de texte JSON
    const chaineDecodee = atob(base64Standard);

    // Parse le JSON pour obtenir un objet JavaScript
    return JSON.parse(chaineDecodee) as PayloadJWT;
  } catch (erreur) {
    console.error('Erreur lors du décodage du JWT :', erreur);
    return null;
  }
};

// ─── Fonctions du service ─────────────────────────────────────────────────────

// Connexion : envoie email + mot de passe, reçoit un token JWT.
// Décode le token pour extraire les infos utilisateur et les retourne.
export const seConnecter = async (donnees: DonneesConnexion) => {
  // Appel POST /auth/login
  const reponse = await apiClient.post<ReponseLogin>('/auth/login', donnees);
  const token = reponse.data.token;

  // Décode le payload du JWT pour récupérer id, email, roles, prenom, nom
  const payload = decoderPayloadJWT(token);

  if (!payload) {
    throw new Error('Impossible de décoder le token JWT reçu du serveur.');
  }

  // Retourne le token brut ET les infos utilisateur extraites du JWT
  return {
    token,
    utilisateur: {
      id: payload.id,
      email: payload.email,
      roles: payload.roles,
      prenom: payload.prenom,
      nom: payload.nom,
    },
  };
};

// Inscription : crée un nouveau compte utilisateur.
// L'API renvoie un statut 201 sans corps de réponse.
export const sInscrire = async (donnees: DonneesInscription): Promise<void> => {
  // Appel POST /auth/register
  await apiClient.post('/auth/register', donnees);
};

// Changement de mot de passe (nécessite d'être connecté).
// Envoie l'ancien et le nouveau mot de passe à l'API.
export const changerMotDePasse = async (
  ancienMotDePasse: string,
  nouveauMotDePasse: string
): Promise<void> => {
  // Appel POST /auth/change-password
  await apiClient.post('/auth/change-password', {
    ancienMotDePasse,
    nouveauMotDePasse,
  });
};
