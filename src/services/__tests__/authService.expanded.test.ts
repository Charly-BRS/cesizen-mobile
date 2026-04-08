// src/services/__tests__/authService.expanded.test.ts
// Tests unitaires étendus pour le service d'authentification

import {
  seConnecter,
  sInscrire,
  changerMotDePasse,
} from '../authService';
import apiClient from '../api';

// Mock apiClient (axios)
jest.mock('../api');

describe('authService - Authentification complète', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour seConnecter (login)
  describe('seConnecter', () => {
    test('connecte un utilisateur avec identifiants valides', async () => {
      // Arrange
      const donneesConnexion = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
      };

      // JWT décidable: header.payload.signature où payload = {"id":1,"email":"user@example.com","roles":["ROLE_USER"],"prenom":"Jean","nom":"Dupont"}
      const tokenValide = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInByZW5vbSI6IkplYW4iLCJub20iOiJEdXBvbnQifQ.fake-sig';
      const reponseLogin = {
        token: tokenValide,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: reponseLogin,
      });

      // Act
      const resultat = await seConnecter(donneesConnexion);

      // Assert
      expect(resultat).toHaveProperty('token');
      expect(resultat).toHaveProperty('utilisateur');
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', donneesConnexion);
      expect(resultat.utilisateur.id).toBe(1);
      expect(resultat.utilisateur.prenom).toBe('Jean');
    });

    test('retourne les rôles de l\'utilisateur lors de la connexion', async () => {
      // Arrange
      const tokenAdmin = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiIsIlJPTEVfQURNSU4iXSwicHJlbm9tIjoiQWxpY2UiLCJub20iOiJNYXJ0aW4ifQ.fake-sig';
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { token: tokenAdmin },
      });

      // Act
      const resultat = await seConnecter({
        email: 'admin@example.com',
        password: 'AdminPass123!',
      });

      // Assert
      expect(resultat.utilisateur.roles).toContain('ROLE_ADMIN');
      expect(resultat.utilisateur.roles).toContain('ROLE_USER');
    });

    test('lance une erreur 401 avec identifiants incorrects', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('401 Invalid credentials')
      );

      // Act & Assert
      await expect(
        seConnecter({
          email: 'user@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('401');
    });

    test('gère un timeout réseau lors de la connexion', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED timeout of 10000ms exceeded')
      );

      // Act & Assert
      await expect(
        seConnecter({
          email: 'user@example.com',
          password: 'password',
        })
      ).rejects.toThrow('ECONNABORTED');
    });
  });

  // Tests pour sInscrire (register)
  describe('sInscrire', () => {
    test('inscrit un nouvel utilisateur', async () => {
      // Arrange
      const donneesInscription = {
        email: 'newuser@example.com',
        password: 'NewPass123!',
        prenom: 'Alice',
        nom: 'Martin',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({});

      // Act
      await sInscrire(donneesInscription);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', donneesInscription);
    });

    test('refuse un email déjà enregistré', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('400 Email already registered')
      );

      // Act & Assert
      await expect(
        sInscrire({
          email: 'existing@example.com',
          password: 'password',
          prenom: 'Jean',
          nom: 'Dupont',
        })
      ).rejects.toThrow('400');
    });

    test('refuse un mot de passe trop faible', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('400 Password too weak')
      );

      // Act & Assert
      await expect(
        sInscrire({
          email: 'user@example.com',
          password: '123',
          prenom: 'Jean',
          nom: 'Dupont',
        })
      ).rejects.toThrow('400');
    });

    test('gère les noms avec caractères spéciaux', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockResolvedValue({});

      const donnees = {
        email: 'user@example.com',
        password: 'password',
        prenom: 'Jean-Pierre',
        nom: 'D\'Alembert',
      };

      // Act
      await sInscrire(donnees);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', donnees);
    });

    test('gère un timeout lors de l\'inscription', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED')
      );

      // Act & Assert
      await expect(
        sInscrire({
          email: 'user@example.com',
          password: 'password',
          prenom: 'Jean',
          nom: 'Dupont',
        })
      ).rejects.toThrow('ECONNABORTED');
    });
  });

  // Tests pour changerMotDePasse
  describe('changerMotDePasse', () => {
    test('change le mot de passe avec succès', async () => {
      // Arrange
      const ancienMdp = 'OldPassword123!';
      const nouveauMdp = 'NewPassword456!';

      (apiClient.post as jest.Mock).mockResolvedValue({});

      // Act
      await changerMotDePasse(ancienMdp, nouveauMdp);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', {
        ancienMotDePasse: ancienMdp,
        nouveauMotDePasse: nouveauMdp,
      });
    });

    test('refuse si l\'ancien mot de passe est incorrect', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('401 Old password incorrect')
      );

      // Act & Assert
      await expect(
        changerMotDePasse('WrongPassword', 'NewPassword456!')
      ).rejects.toThrow('401');
    });

    test('refuse un nouveau mot de passe trop faible', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('400 New password too weak')
      );

      // Act & Assert
      await expect(
        changerMotDePasse('OldPass123!', '123')
      ).rejects.toThrow('400');
    });

    test('gère un timeout lors du changement', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED timeout')
      );

      // Act & Assert
      await expect(
        changerMotDePasse('OldPass123!', 'NewPass456!')
      ).rejects.toThrow('ECONNABORTED');
    });

    test('envoie les deux mots de passe au serveur', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockResolvedValue({});

      // Act
      await changerMotDePasse('old123', 'new456');

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', {
        ancienMotDePasse: 'old123',
        nouveauMotDePasse: 'new456',
      });
    });
  });

  // Tests de sécurité
  describe('Sécurité', () => {
    test('ne retourne pas le mot de passe après connexion', async () => {
      // Arrange
      const tokenValide = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInByZW5vbSI6IkplYW4iLCJub20iOiJEdXBvbnQifQ.fake-sig';
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { token: tokenValide },
      });

      // Act
      const resultat = await seConnecter({
        email: 'user@example.com',
        password: 'password123',
      });

      // Assert
      expect(resultat.utilisateur).not.toHaveProperty('password');
      expect(resultat.utilisateur).not.toHaveProperty('motDePasse');
    });

    test('valide que le token est un JWT valide', async () => {
      // Arrange
      const tokenJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInByZW5vbSI6IkplYW4iLCJub20iOiJEdXBvbnQifQ.fake-sig';
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { token: tokenJWT },
      });

      // Act
      const resultat = await seConnecter({
        email: 'user@example.com',
        password: 'password',
      });

      // Assert
      expect(resultat.token).toMatch(/^[\w\-._]+\.[\w\-._]+\.[\w\-._]+$/);
    });
  });

  // Tests d'intégration : flux complets
  describe('Flux complets d\'authentification', () => {
    test('flux complet : inscription puis connexion', async () => {
      // Arrange
      const tokenValide = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInByZW5vbSI6IkplYW4iLCJub20iOiJEdXBvbnQifQ.fake-sig';

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({}) // sInscrire
        .mockResolvedValueOnce({ data: { token: tokenValide } }); // seConnecter

      // Act
      await sInscrire({
        email: 'newuser@example.com',
        password: 'password123',
        prenom: 'Jean',
        nom: 'Dupont',
      });
      const resConnexion = await seConnecter({
        email: 'newuser@example.com',
        password: 'password123',
      });

      // Assert
      expect(resConnexion.utilisateur.email).toBe('newuser@example.com');
      expect(resConnexion.token).toBeDefined();
    });

    test('flux complet : connexion puis changement de mot de passe', async () => {
      // Arrange
      const tokenValide = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInByZW5vbSI6IkplYW4iLCJub20iOiJEdXBvbnQifQ.fake-sig';
      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: { token: tokenValide } }) // seConnecter
        .mockResolvedValueOnce({}); // changerMotDePasse

      // Act
      const resConnexion = await seConnecter({
        email: 'user@example.com',
        password: 'oldpass',
      });
      await changerMotDePasse('oldpass', 'newpass');

      // Assert
      expect(resConnexion.token).toBeDefined();
      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });
  });
});
