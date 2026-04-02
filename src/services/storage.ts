// src/services/storage.ts
// Service de stockage sécurisé pour les tokens JWT sur mobile.
// Utilise expo-secure-store qui chiffre les données dans le trousseau
// du système d'exploitation (Keychain iOS / Keystore Android).

import * as SecureStore from 'expo-secure-store';

// Clé utilisée pour stocker le token JWT dans SecureStore
const CLE_TOKEN_JWT = 'jwt_token';
// Clé utilisée pour stocker les données de l'utilisateur
const CLE_UTILISATEUR = 'utilisateur_data';

// Sauvegarde le token JWT de façon sécurisée
export const sauvegarderToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CLE_TOKEN_JWT, token);
  } catch (erreur) {
    console.error('Erreur lors de la sauvegarde du token :', erreur);
    throw erreur;
  }
};

// Récupère le token JWT depuis le stockage sécurisé
// Retourne null si aucun token n'est stocké
export const recupererToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(CLE_TOKEN_JWT);
    return token;
  } catch (erreur) {
    console.error('Erreur lors de la récupération du token :', erreur);
    return null;
  }
};

// Supprime le token JWT du stockage sécurisé (lors de la déconnexion)
export const supprimerToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CLE_TOKEN_JWT);
  } catch (erreur) {
    console.error('Erreur lors de la suppression du token :', erreur);
    throw erreur;
  }
};

// Sauvegarde les données de l'utilisateur en JSON
export const sauvegarderUtilisateur = async (utilisateur: object): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CLE_UTILISATEUR, JSON.stringify(utilisateur));
  } catch (erreur) {
    console.error('Erreur lors de la sauvegarde utilisateur :', erreur);
    throw erreur;
  }
};

// Récupère les données de l'utilisateur depuis le stockage sécurisé
export const recupererUtilisateur = async <T>(): Promise<T | null> => {
  try {
    const donnees = await SecureStore.getItemAsync(CLE_UTILISATEUR);
    return donnees ? JSON.parse(donnees) as T : null;
  } catch (erreur) {
    console.error('Erreur lors de la récupération utilisateur :', erreur);
    return null;
  }
};

// Supprime toutes les données de session (token + utilisateur)
export const supprimerSession = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CLE_TOKEN_JWT);
    await SecureStore.deleteItemAsync(CLE_UTILISATEUR);
  } catch (erreur) {
    console.error('Erreur lors de la suppression de session :', erreur);
    throw erreur;
  }
};
