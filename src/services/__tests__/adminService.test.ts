// src/services/__tests__/adminService.test.ts
// Tests unitaires pour le service d'administration

import {
  toggleVisibiliteArticle,
  toggleVisibiliteExercice,
  getArticlesAdmin,
  getExercicesAdmin,
} from '../adminService';
import apiClient from '../api';

// Mock apiClient (axios)
jest.mock('../api');

describe('adminService - Gestion administrative', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour toggleVisibiliteArticle
  describe('toggleVisibiliteArticle', () => {
    test('bascule un article de publié à privé', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteArticle(1, true); // estActuellementPublie = true → devient false

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/articles/1',
        { isPublie: false }, // inverse de true
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('bascule un article de privé à public', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteArticle(2, false); // estActuellementPublie = false → devient true

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/articles/2',
        { isPublie: true }, // inverse de false
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('bascule plusieurs articles indépendamment', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteArticle(1, true);
      await toggleVisibiliteArticle(2, false);
      await toggleVisibiliteArticle(3, true);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(3);
      expect(apiClient.patch).toHaveBeenNthCalledWith(
        1,
        '/articles/1',
        { isPublie: false },
        expect.any(Object)
      );
      expect(apiClient.patch).toHaveBeenNthCalledWith(
        2,
        '/articles/2',
        { isPublie: true },
        expect.any(Object)
      );
    });

    test('lance une erreur 404 si article inexistant', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('404 Article not found')
      );

      // Act & Assert
      await expect(toggleVisibiliteArticle(999, true)).rejects.toThrow('404');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/articles/999',
        { isPublie: false },
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('lance une erreur 403 si permission insuffisante', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('403 Forbidden')
      );

      // Act & Assert
      await expect(toggleVisibiliteArticle(1, true)).rejects.toThrow('403');
    });

    test('gère un timeout réseau', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED timeout')
      );

      // Act & Assert
      await expect(toggleVisibiliteArticle(1, true)).rejects.toThrow(
        'ECONNABORTED'
      );
    });

    test('envoie le format correct pour isPublie', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteArticle(1, true);

      // Assert
      const appel = (apiClient.patch as jest.Mock).mock.calls[0];
      expect(appel[1]).toEqual({ isPublie: false });
      expect(appel[1]).toHaveProperty('isPublie');
      expect(typeof appel[1].isPublie).toBe('boolean');
    });
  });

  // Tests pour toggleVisibiliteExercice
  describe('toggleVisibiliteExercice', () => {
    test('active un exercice inactif', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteExercice(5, false); // estActuellementActif = false → devient true

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/breathing_exercises/5',
        { isActive: true }, // inverse de false
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('désactive un exercice actif', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteExercice(6, true); // estActuellementActif = true → devient false

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/breathing_exercises/6',
        { isActive: false }, // inverse de true
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('bascule plusieurs exercices indépendamment', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteExercice(1, true);
      await toggleVisibiliteExercice(2, false);
      await toggleVisibiliteExercice(3, true);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(3);
    });

    test('lance une erreur 404 si exercice inexistant', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('404 Exercise not found')
      );

      // Act & Assert
      await expect(toggleVisibiliteExercice(999, true)).rejects.toThrow('404');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/breathing_exercises/999',
        { isActive: false },
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('lance une erreur 403 si non-admin', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('403 Admin access required')
      );

      // Act & Assert
      await expect(toggleVisibiliteExercice(5, true)).rejects.toThrow('403');
    });

    test('gère un timeout lors du changement', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED')
      );

      // Act & Assert
      await expect(toggleVisibiliteExercice(5, true)).rejects.toThrow(
        'ECONNABORTED'
      );
    });

    test('envoie le format correct pour isActive', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteExercice(5, true);

      // Assert
      const appel = (apiClient.patch as jest.Mock).mock.calls[0];
      expect(appel[1]).toEqual({ isActive: false });
      expect(appel[1]).toHaveProperty('isActive');
      expect(typeof appel[1].isActive).toBe('boolean');
    });
  });

  // Tests pour getArticlesAdmin
  describe('getArticlesAdmin', () => {
    test('retourne tous les articles (publiés ET privés)', async () => {
      // Arrange
      const articles = {
        'hydra:member': [
          {
            id: 1,
            titre: 'Article public',
            contenu: 'Contenu',
            isPublie: true,
            createdAt: '2026-04-08T10:00:00Z',
            updatedAt: null,
            auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
            categorie: { id: 1, nom: 'Santé', slug: 'sante' },
          },
          {
            id: 2,
            titre: 'Article privé',
            contenu: 'Contenu',
            isPublie: false,
            createdAt: '2026-04-08T11:00:00Z',
            updatedAt: null,
            auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
            categorie: { id: 1, nom: 'Santé', slug: 'sante' },
          },
        ],
        'hydra:totalItems': 2,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: articles,
      });

      // Act
      const resultat = await getArticlesAdmin();

      // Assert
      expect(resultat.length).toBe(2);
      expect(resultat.some((a: any) => !a.isPublie)).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/articles');
    });
  });

  // Tests pour getExercicesAdmin
  describe('getExercicesAdmin', () => {
    test('retourne tous les exercices (actifs ET inactifs)', async () => {
      // Arrange
      const exercices = {
        'hydra:member': [
          {
            id: 1,
            nom: 'Exercice actif',
            slug: 'actif',
            description: null,
            inspirationDuration: 4,
            apneaDuration: 0,
            expirationDuration: 4,
            cycles: 10,
            isPreset: true,
            isActive: true,
          },
          {
            id: 2,
            nom: 'Exercice inactif',
            slug: 'inactif',
            description: null,
            inspirationDuration: 2,
            apneaDuration: 0,
            expirationDuration: 2,
            cycles: 5,
            isPreset: true,
            isActive: false,
          },
        ],
        'hydra:totalItems': 2,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: exercices,
      });

      // Act
      const resultat = await getExercicesAdmin();

      // Assert
      expect(resultat.length).toBe(2);
      expect(resultat.some((e: any) => !e.isActive)).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/breathing_exercises');
    });
  });

  // Tests d'intégration : scénarios réalistes d'admin
  describe('Scénarios d\'administration réalistes', () => {
    test('admin désactive temporairement plusieurs articles', async () => {
      // Arrange
      const ids = [1, 2, 3];
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      for (const id of ids) {
        await toggleVisibiliteArticle(id, true); // tous publics → privés
      }

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(3);
      ids.forEach((id) => {
        expect(apiClient.patch).toHaveBeenCalledWith(
          `/articles/${id}`,
          { isPublie: false },
          expect.any(Object)
        );
      });
    });

    test('admin réactive les exercices après maintenance', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await toggleVisibiliteExercice(1, false); // inactifs → actifs
      await toggleVisibiliteExercice(2, false);
      await toggleVisibiliteExercice(3, false);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledTimes(3);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/breathing_exercises/1',
        { isActive: true },
        expect.any(Object)
      );
    });

    test('gère les erreurs de réseau lors de modifications multiples', async () => {
      // Arrange
      (apiClient.patch as jest.Mock)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('ECONNABORTED'))
        .mockResolvedValueOnce({});

      // Act & Assert
      await expect(toggleVisibiliteArticle(1, true)).resolves.not.toThrow();
      await expect(toggleVisibiliteArticle(2, true)).rejects.toThrow('ECONNABORTED');
      await expect(toggleVisibiliteArticle(3, true)).resolves.not.toThrow();
    });
  });
});
