// src/__tests__/authService.test.ts
// Tests unitaires pour authService.ts (mobile)
//
// Ce que l'on teste :
//   - seConnecter() appelle l'API, décode le JWT et retourne les infos utilisateur
//   - seConnecter() propage l'erreur si l'API répond avec une erreur
//   - sInscrire() appelle l'API avec les bonnes données
//
// Stratégie : on mocke apiClient (Axios) pour ne pas envoyer de vraies requêtes.
// On forge un token JWT avec un payload base64 valide pour tester le décodage.

import { seConnecter, sInscrire } from '../services/authService';
import apiClient from '../services/api';

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

// ─── Utilitaire : crée un token JWT fictif avec un payload donné ──────────────
// Format JWT : header.payload.signature — seule la partie payload nous intéresse.
// On encode le payload en base64 standard pour que atob() puisse le décoder.
const creerTokenFictif = (payload: object): string => {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `eyJhbGciOiJSUzI1NiJ9.${payloadBase64}.fakesignature`;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authService (mobile)', () => {

  // Réinitialise les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Tests de seConnecter() ───────────────────────────────────────────────

  it('seConnecter() retourne le token JWT et les infos utilisateur décodées', async () => {
    // Prépare un payload JWT fictif avec toutes les infos utilisateur
    const payloadFictif = {
      id: 1,
      email: 'jean@example.com',
      roles: ['ROLE_USER'],
      prenom: 'Jean',
      nom: 'Test',
      exp: 9999999999,
    };
    const tokenFictif = creerTokenFictif(payloadFictif);

    // Configure le mock pour simuler une réponse réussie de l'API
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { token: tokenFictif },
    });

    // Appelle la fonction à tester
    const resultat = await seConnecter({
      email: 'jean@example.com',
      password: 'MotDePasse123!',
    });

    // Vérifie que le token brut est bien retourné
    expect(resultat.token).toBe(tokenFictif);

    // Vérifie que le payload du JWT a bien été décodé
    expect(resultat.utilisateur.id).toBe(1);
    expect(resultat.utilisateur.email).toBe('jean@example.com');
    expect(resultat.utilisateur.roles).toContain('ROLE_USER');
    expect(resultat.utilisateur.prenom).toBe('Jean');
    expect(resultat.utilisateur.nom).toBe('Test');

    // Vérifie l'appel API
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'jean@example.com',
      password: 'MotDePasse123!',
    });
  });

  it('seConnecter() propage l\'erreur si l\'API retourne une erreur', async () => {
    // Simule une erreur 401
    (apiClient.post as jest.Mock).mockRejectedValueOnce(
      new Error('Identifiants invalides')
    );

    await expect(
      seConnecter({ email: 'jean@example.com', password: 'mauvais' })
    ).rejects.toThrow('Identifiants invalides');
  });

  // ─── Tests de sInscrire() ─────────────────────────────────────────────────

  it('sInscrire() appelle /auth/register avec les bonnes données', async () => {
    // L'API retourne 201 sans corps (void)
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: {} });

    // Doit se résoudre sans erreur ni valeur de retour
    await expect(
      sInscrire({
        email: 'jean@example.com',
        password: 'MotDePasse123!',
        prenom: 'Jean',
        nom: 'Test',
      })
    ).resolves.toBeUndefined();

    // Vérifie l'appel API
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'jean@example.com',
      password: 'MotDePasse123!',
      prenom: 'Jean',
      nom: 'Test',
    });
  });

  it('sInscrire() propage l\'erreur si l\'email est déjà utilisé', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(
      new Error('Email déjà utilisé')
    );

    await expect(
      sInscrire({ email: 'doublon@example.com', password: 'Mdp123!', prenom: 'A', nom: 'B' })
    ).rejects.toThrow('Email déjà utilisé');
  });
});
