// src/context/AuthContext.tsx
// Contexte React Native pour la gestion globale de l'authentification.
// Charge le token depuis SecureStore au démarrage de l'app
// et partage l'état d'authentification à tous les écrans.

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  recupererToken,
  recupererUtilisateur,
  sauvegarderToken,
  sauvegarderUtilisateur,
  supprimerSession,
} from '../services/storage';
// Import de la fonction qui synchronise le cache mémoire du token dans api.ts
// Cela évite que l'intercepteur lise SecureStore à chaque requête (source de timeouts)
import { definirToken } from '../services/api';

// Type représentant un utilisateur authentifié
// Les champs correspondent au payload du token JWT décodé
interface Utilisateur {
  id: number;
  email: string;
  roles: string[];
  prenom: string;
  nom: string;
}

// Type du contexte d'authentification
interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  chargement: boolean;
  connecter: (utilisateur: Utilisateur, token: string) => Promise<void>;
  deconnecter: () => Promise<void>;
  mettreAJourUtilisateur: (donnees: Partial<Utilisateur>) => Promise<void>;
  estConnecte: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// ─── Utilitaire : vérification d'expiration du token JWT ─────────────────────
// Décode le payload du JWT (base64) et compare la date d'expiration avec l'heure actuelle.
// Retourne true si le token est expiré OU illisible.
const estTokenExpire = (token: string): boolean => {
  try {
    const partiePayload = token.split('.')[1];
    // Convertit le base64url en base64 standard avant le décodage
    const base64Standard = partiePayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Standard));
    // Le champ "exp" du JWT est en secondes, Date.now() est en millisecondes
    return payload.exp * 1000 < Date.now();
  } catch {
    // Si le token est mal formé, on le considère comme expiré par sécurité
    return true;
  }
};

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // État de chargement pendant la vérification du token au démarrage
  const [chargement, setChargement] = useState<boolean>(true);

  // Au démarrage de l'app : vérifie si un token existe dans SecureStore
  useEffect(() => {
    const verifierSession = async () => {
      try {
        const tokenSauvegarde = await recupererToken();
        const utilisateurSauvegarde = await recupererUtilisateur<Utilisateur>();

        if (tokenSauvegarde && utilisateurSauvegarde) {
          // Vérifie que le token n'est pas expiré avant de restaurer la session
          if (estTokenExpire(tokenSauvegarde)) {
            // Token périmé : on nettoie le stockage et on redirige vers le login
            console.log('[Auth] Token expiré au démarrage → session supprimée');
            await supprimerSession();
          } else {
            // Token valide : alimente le cache mémoire AVANT de mettre à jour le state
            // → les requêtes Axios pourront lire le token immédiatement
            definirToken(tokenSauvegarde);
            setToken(tokenSauvegarde);
            setUtilisateur(utilisateurSauvegarde);
          }
        }
      } catch (erreur) {
        console.error('Erreur lors de la vérification de session :', erreur);
      } finally {
        // Termine le chargement dans tous les cas
        setChargement(false);
      }
    };

    verifierSession();
  }, []);

  // Connexion : sauvegarde token et utilisateur dans SecureStore
  const connecter = async (nouvelUtilisateur: Utilisateur, nouveauToken: string) => {
    await sauvegarderToken(nouveauToken);
    await sauvegarderUtilisateur(nouvelUtilisateur);
    // Met à jour le cache mémoire → les prochaines requêtes Axios auront le token
    definirToken(nouveauToken);
    setToken(nouveauToken);
    setUtilisateur(nouvelUtilisateur);
  };

  // Déconnexion : supprime toutes les données de session
  const deconnecter = async () => {
    await supprimerSession();
    // Vide le cache mémoire → les prochaines requêtes ne seront plus authentifiées
    definirToken(null);
    setToken(null);
    setUtilisateur(null);
  };

  // Met à jour partiellement les données utilisateur dans l'état ET dans SecureStore.
  // Utilisé après une modification de profil (prénom/nom) pour éviter une re-connexion.
  const mettreAJourUtilisateur = async (donnees: Partial<Utilisateur>) => {
    if (!utilisateur) return;
    // Fusionne les nouvelles données avec l'utilisateur existant
    const utilisateurMisAJour = { ...utilisateur, ...donnees };
    await sauvegarderUtilisateur(utilisateurMisAJour);
    setUtilisateur(utilisateurMisAJour);
  };

  const valeurContexte: AuthContextType = {
    utilisateur,
    token,
    chargement,
    connecter,
    deconnecter,
    mettreAJourUtilisateur,
    estConnecte: token !== null,
  };

  return (
    <AuthContext.Provider value={valeurContexte}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'auth dans n'importe quel écran
export const useAuth = (): AuthContextType => {
  const contexte = useContext(AuthContext);

  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return contexte;
};

export default AuthContext;
