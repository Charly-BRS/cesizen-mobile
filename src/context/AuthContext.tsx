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
  estConnecte: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

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
          setToken(tokenSauvegarde);
          setUtilisateur(utilisateurSauvegarde);
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
    setToken(nouveauToken);
    setUtilisateur(nouvelUtilisateur);
  };

  // Déconnexion : supprime toutes les données de session
  const deconnecter = async () => {
    await supprimerSession();
    setToken(null);
    setUtilisateur(null);
  };

  const valeurContexte: AuthContextType = {
    utilisateur,
    token,
    chargement,
    connecter,
    deconnecter,
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
