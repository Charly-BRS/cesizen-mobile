// src/__tests__/AuthContext.test.tsx
// Tests unitaires pour AuthContext.tsx (mobile)
//
// Ce que l'on teste :
//   - estConnecte vaut false au démarrage si SecureStore est vide
//   - connecter() met estConnecte à true et sauvegarde les données
//   - deconnecter() remet l'état à zéro et supprime la session
//   - mettreAJourUtilisateur() met à jour partiellement les données
//
// Stratégie :
//   - On mocke le module storage (SecureStore) pour éviter les dépendances natives
//   - On mocke le module api.ts pour éviter les imports natifs Axios/intercepteurs
//   - On utilise renderHook de @testing-library/react-native

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ─── Mock du service de stockage (SecureStore) ────────────────────────────────
// Remplace les appels à expo-secure-store par des mocks simples
jest.mock('../services/storage', () => ({
  recupererToken: jest.fn().mockResolvedValue(null),
  recupererUtilisateur: jest.fn().mockResolvedValue(null),
  sauvegarderToken: jest.fn().mockResolvedValue(undefined),
  sauvegarderUtilisateur: jest.fn().mockResolvedValue(undefined),
  supprimerSession: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock du module api.ts ────────────────────────────────────────────────────
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  definirToken: jest.fn(),
  definirCallbackDeconnexion: jest.fn(),
}));

// ─── Wrapper ──────────────────────────────────────────────────────────────────
// Enveloppe les tests avec AuthProvider pour que useAuth() fonctionne
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ─── Données de test ──────────────────────────────────────────────────────────
const utilisateurTest = {
  id: 1,
  email: 'jean@example.com',
  roles: ['ROLE_USER'],
  prenom: 'Jean',
  nom: 'Dupont',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthContext (mobile)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── État initial ─────────────────────────────────────────────────────────

  it('estConnecte vaut false au démarrage si aucune session n\'est sauvegardée', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Attend que le useEffect de vérification de session se termine (async)
    await act(async () => {});

    expect(result.current.estConnecte).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.utilisateur).toBeNull();
  });

  it('chargement passe à false après la vérification de session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Pendant le chargement, chargement vaut true
    // Après le useEffect, il passe à false
    await act(async () => {});

    expect(result.current.chargement).toBe(false);
  });

  // ─── connecter() ──────────────────────────────────────────────────────────

  it('connecter() met estConnecte à true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    expect(result.current.estConnecte).toBe(true);
    expect(result.current.token).toBe('mon-token-jwt');
    expect(result.current.utilisateur?.email).toBe('jean@example.com');
  });

  it('connecter() sauvegarde les rôles utilisateur', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.connecter(
        { ...utilisateurTest, roles: ['ROLE_ADMIN'] },
        'token-admin'
      );
    });

    expect(result.current.utilisateur?.roles).toContain('ROLE_ADMIN');
  });

  // ─── deconnecter() ────────────────────────────────────────────────────────

  it('deconnecter() remet estConnecte à false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    // Connexion préalable
    await act(async () => {
      await result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    // Déconnexion
    await act(async () => {
      await result.current.deconnecter();
    });

    expect(result.current.estConnecte).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.utilisateur).toBeNull();
  });

  // ─── mettreAJourUtilisateur() ─────────────────────────────────────────────

  it('mettreAJourUtilisateur() modifie uniquement les champs fournis', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    // Connexion préalable
    await act(async () => {
      await result.current.connecter(utilisateurTest, 'mon-token-jwt');
    });

    // Mise à jour du nom seulement
    await act(async () => {
      await result.current.mettreAJourUtilisateur({ nom: 'Martin' });
    });

    // Le nom a changé
    expect(result.current.utilisateur?.nom).toBe('Martin');
    // Le prénom est intact
    expect(result.current.utilisateur?.prenom).toBe('Jean');
    // L'email est intact
    expect(result.current.utilisateur?.email).toBe('jean@example.com');
  });
});
