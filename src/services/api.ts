// src/services/api.ts
// Instance Axios centralisée pour toutes les requêtes vers l'API Symfony.
// Similaire à la version web, mais utilise SecureStore (chiffré)
// au lieu de localStorage pour stocker le token JWT.

import axios from 'axios';
import { recupererToken, supprimerSession } from './storage';

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
  async (config) => {
    // Récupère le token depuis SecureStore (stockage chiffré)
    const token = await recupererToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (erreur.response?.status === 401) {
      // Token expiré ou invalide : supprime la session complète
      await supprimerSession();
      // Note : la redirection vers login sera gérée par le Navigator
    }

    return Promise.reject(erreur);
  }
);

export default apiClient;
