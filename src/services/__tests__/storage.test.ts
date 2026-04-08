// src/services/__tests__/storage.test.ts
// Tests unitaires pour le service de stockage sécurisé

import * as SecureStore from 'expo-secure-store';
import {
  sauvegarderToken,
  recupererToken,
  supprimerToken,
  sauvegarderUtilisateur,
  recupererUtilisateur,
  supprimerSession,
} from '../storage';

// Mock expo-secure-store
jest.mock('expo-secure-store');

describe('storage - Gestion sécurisée des données', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour sauvegarderToken
  describe('sauvegarderToken', () => {
    test('sauvegarde un token JWT valide', async () => {
      // Arrange
      const tokenValide = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.fake-signature';
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderToken(tokenValide);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'jwt_token',
        tokenValide
      );
    });

    test('sauvegarde un long token', async () => {
      // Arrange
      const longToken = 'x'.repeat(5000); // Token très long
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderToken(longToken);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'jwt_token',
        longToken
      );
    });

    test('remplace un ancien token', async () => {
      // Arrange
      const ancienToken = 'ancien-token';
      const nouveauToken = 'nouveau-token';
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderToken(ancienToken);
      await sauvegarderToken(nouveauToken);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.setItemAsync).toHaveBeenLastCalledWith(
        'jwt_token',
        nouveauToken
      );
    });
  });

  // Tests pour recupererToken
  describe('recupererToken', () => {
    test('récupère un token sauvegardé', async () => {
      // Arrange
      const tokenAttendu = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.fake-signature';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(tokenAttendu);

      // Act
      const resultat = await recupererToken();

      // Assert
      expect(resultat).toBe(tokenAttendu);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('jwt_token');
    });

    test('retourne null si pas de token sauvegardé', async () => {
      // Arrange
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      // Act
      const resultat = await recupererToken();

      // Assert
      expect(resultat).toBeNull();
    });

    test('gère les erreurs SecureStore gracieusement', async () => {
      // Arrange
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore unavailable')
      );

      // Act
      const resultat = await recupererToken();

      // Assert
      expect(resultat).toBeNull();
    });
  });

  // Tests pour supprimerToken
  describe('supprimerToken', () => {
    test('supprime un token', async () => {
      // Arrange
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await supprimerToken();

      // Assert
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('jwt_token');
    });

    test('gère les erreurs lors de la suppression', async () => {
      // Arrange
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore failed')
      );

      // Act & Assert
      await expect(supprimerToken()).rejects.toThrow('SecureStore failed');
    });
  });

  // Tests pour sauvegarderUtilisateur
  describe('sauvegarderUtilisateur', () => {
    test('sauvegarde un utilisateur valide', async () => {
      // Arrange
      const utilisateur = {
        id: 1,
        email: 'user@example.com',
        prenom: 'Jean',
        nom: 'Dupont',
        roles: ['ROLE_USER'],
      };
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderUtilisateur(utilisateur);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'utilisateur_data',
        JSON.stringify(utilisateur)
      );
    });

    test('sauvegarde un utilisateur admin', async () => {
      // Arrange
      const admin = {
        id: 2,
        email: 'admin@example.com',
        prenom: 'Alice',
        nom: 'Martin',
        roles: ['ROLE_USER', 'ROLE_ADMIN'],
      };
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderUtilisateur(admin);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
      const appel = (SecureStore.setItemAsync as jest.Mock).mock.calls[0];
      const donneesSauvegardees = JSON.parse(appel[1]);
      expect(donneesSauvegardees.roles).toContain('ROLE_ADMIN');
    });

    test('remplace les données utilisateur existantes', async () => {
      // Arrange
      const user1 = { id: 1, email: 'user1@example.com' };
      const user2 = { id: 2, email: 'user2@example.com' };
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await sauvegarderUtilisateur(user1);
      await sauvegarderUtilisateur(user2);

      // Assert
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    });
  });

  // Tests pour recupererUtilisateur
  describe('recupererUtilisateur', () => {
    test('récupère un utilisateur sauvegardé', async () => {
      // Arrange
      const utilisateurAttendu = {
        id: 1,
        email: 'user@example.com',
        prenom: 'Jean',
        nom: 'Dupont',
        roles: ['ROLE_USER'],
      };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(utilisateurAttendu)
      );

      // Act
      const resultat = await recupererUtilisateur<typeof utilisateurAttendu>();

      // Assert
      expect(resultat).toEqual(utilisateurAttendu);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('utilisateur_data');
    });

    test('retourne null si pas d\'utilisateur sauvegardé', async () => {
      // Arrange
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      // Act
      const resultat = await recupererUtilisateur();

      // Assert
      expect(resultat).toBeNull();
    });

    test('gère les données JSON corrompues', async () => {
      // Arrange
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        'donnees-invalides-json'
      );

      // Act
      const resultat = await recupererUtilisateur();

      // Assert
      expect(resultat).toBeNull(); // Erreur JSON est attrapée et retourne null
    });

    test('gère les erreurs SecureStore gracieusement', async () => {
      // Arrange
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore unavailable')
      );

      // Act
      const resultat = await recupererUtilisateur();

      // Assert
      expect(resultat).toBeNull(); // Erreur est attrapée et retourne null
    });
  });

  // Tests pour supprimerSession (supprime token + utilisateur)
  describe('supprimerSession', () => {
    test('supprime le token et l\'utilisateur', async () => {
      // Arrange
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await supprimerSession();

      // Assert
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('jwt_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('utilisateur_data');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    });

    test('gère les erreurs lors de la suppression', async () => {
      // Arrange
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore failed')
      );

      // Act & Assert
      await expect(supprimerSession()).rejects.toThrow('SecureStore failed');
    });

    test('supprime dans le bon ordre', async () => {
      // Arrange
      const calls: string[] = [];
      (SecureStore.deleteItemAsync as jest.Mock).mockImplementation((key) => {
        calls.push(key);
        return Promise.resolve();
      });

      // Act
      await supprimerSession();

      // Assert
      expect(calls).toContain('jwt_token');
      expect(calls).toContain('utilisateur_data');
    });
  });

  // Tests d'intégration : flux complet
  describe('Flux complet de sauvegarde et récupération', () => {
    test('sauvegarde puis récupère un utilisateur avec token', async () => {
      // Arrange
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.fake';
      const utilisateur = {
        id: 1,
        email: 'user@example.com',
        roles: ['ROLE_USER'],
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'jwt_token') return Promise.resolve(token);
        if (key === 'utilisateur_data') return Promise.resolve(JSON.stringify(utilisateur));
        return Promise.resolve(null);
      });

      // Act
      await sauvegarderToken(token);
      await sauvegarderUtilisateur(utilisateur);
      const tokenRecupere = await recupererToken();
      const userRecupere = await recupererUtilisateur<typeof utilisateur>();

      // Assert
      expect(tokenRecupere).toBe(token);
      expect(userRecupere).toEqual(utilisateur);
    });

    test('supprime le token et utilisateur lors de la déconnexion', async () => {
      // Arrange
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      await supprimerSession();

      // Assert
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('jwt_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('utilisateur_data');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    });
  });
});
