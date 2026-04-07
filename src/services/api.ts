// src/services/api.ts
// Instance Axios centralisée pour toutes les requêtes vers l'API Symfony.
// Similaire à la version web, mais utilise SecureStore (chiffré)
// au lieu de localStorage pour stocker le token JWT.
//
// ⚡ Optimisation anti-timeout : le token JWT est mis en cache en mémoire.
// Problème résolu : lire SecureStore de façon asynchrone à CHAQUE requête
// pouvait prendre >10 secondes sur Android, déclenchant le timeout Axios
// AVANT même d'envoyer la requête au serveur.
// Solution : AuthContext appelle definirToken() lors de la connexion/déconnexion/
// restauration de session, et l'intercepteur utilise ce cache (lecture synchrone).

import axios from 'axios';
import { supprimerSession } from './storage';

// ─── Cache du token en mémoire ────────────────────────────────────────────────
// Null au démarrage, mis à jour par AuthContext dès que l'état change.
let tokenEnCache: string | null = null;

// Permet à AuthContext de synchroniser le cache avec l'état d'authentification.
// À appeler : après connexion, après restauration de session, et lors de la déconnexion.
export const definirToken = (token: string | null): void => {
  tokenEnCache = token;
};

// Création de l'instance Axios avec l'URL de base depuis les variables d'env Expo
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // API Platform attend du JSON-LD par défaut
    'Accept': 'application/ld+json',
  },
  // Timeout de 10 secondes pour éviter les requêtes qui bloquent indéfiniment
  timeout: 10000,
});

// Intercepteur de requête : ajoute automatiquement le token JWT si présent
apiClient.interceptors.request.use(
  (config) => {
    // Lecture synchrone depuis le cache mémoire (pas de SecureStore ici)
    // → aucun risque de timeout dû à une lecture lente du stockage chiffré
    if (tokenEnCache) {
      config.headers.Authorization = `Bearer ${tokenEnCache}`;
    }

    return config;
  },
  (erreur) => {
    return Promise.reject(erreur);
  }
);

// Intercepteur de réponse : gère les erreurs globales
apiClient.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    // Log complet de l'erreur pour faciliter le débogage
    console.error('[API] Erreur réseau :', {
      message: erreur.message,
      code: erreur.code,
      status: erreur.response?.status,
      url: erreur.config?.url,
      baseURL: erreur.config?.baseURL,
    });

    if (erreur.response?.status === 401) {
      // Token expiré ou invalide :
      // 1. Vide le cache mémoire immédiatement pour stopper les futures requêtes
      tokenEnCache = null;
      // 2. Supprime aussi le token persisté dans SecureStore
      await supprimerSession();
      // Note : la redirection vers login sera gérée par le Navigator
      // (il observe token === null dans AuthContext)
    }

    return Promise.reject(erreur);
  }
);

export default apiClient;
