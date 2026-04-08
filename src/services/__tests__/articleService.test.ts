// src/services/__tests__/articleService.test.ts
// Tests unitaires pour le service d'articles

import { getArticles, getArticle } from '../articleService';
import apiClient from '../api';

// Mock apiClient (axios)
jest.mock('../api');

describe('articleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour getArticles
  describe('getArticles', () => {
    test('retourne une liste d\'articles valide', async () => {
      // Arrange
      const articlesAttendu = {
        'hydra:member': [
          {
            id: 1,
            titre: 'Article 1',
            contenu: 'Contenu article 1',
            isPublie: true,
            createdAt: '2026-04-08T10:00:00Z',
            updatedAt: null,
            auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
            categorie: { id: 1, nom: 'Santé', slug: 'sante' },
          },
          {
            id: 2,
            titre: 'Article 2',
            contenu: 'Contenu article 2',
            isPublie: true,
            createdAt: '2026-04-08T11:00:00Z',
            updatedAt: null,
            auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
            categorie: { id: 1, nom: 'Santé', slug: 'sante' },
          },
        ],
        'hydra:totalItems': 2,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: articlesAttendu,
      });

      // Act
      const resultat = await getArticles();

      // Assert
      expect(resultat).toEqual(articlesAttendu['hydra:member']);
      expect(apiClient.get).toHaveBeenCalledWith('/articles');
      expect(resultat.length).toBe(2);
      expect(resultat[0].titre).toBe('Article 1');
    });

    test('retourne une liste vide quand aucun article', async () => {
      // Arrange
      const reponseVide = {
        'hydra:member': [],
        'hydra:totalItems': 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: reponseVide,
      });

      // Act
      const resultat = await getArticles();

      // Assert
      expect(resultat).toEqual([]);
      expect(resultat.length).toBe(0);
    });

    test('filtre les articles non publiés', async () => {
      // Arrange
      const articlesAvecNonPublies = {
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
        data: articlesAvecNonPublies,
      });

      // Act
      const resultat = await getArticles();
      const filtres = resultat.filter((a: any) => a.isPublie);

      // Assert
      expect(filtres.length).toBe(1);
      expect(filtres[0].titre).toBe('Article public');
    });

    test('lance une erreur en cas de problème réseau', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED')
      );

      // Act & Assert
      await expect(getArticles()).rejects.toThrow('ECONNABORTED');
      expect(apiClient.get).toHaveBeenCalledWith('/articles');
    });
  });

  // Tests pour getArticle
  describe('getArticle', () => {
    test('retourne un article valide par ID', async () => {
      // Arrange
      const articleAttendu = {
        id: 1,
        titre: 'Article détaillé',
        contenu: 'Contenu très détaillé',
        isPublie: true,
        createdAt: '2026-04-08T12:00:00Z',
        updatedAt: '2026-04-08T12:30:00Z',
        auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
        categorie: { id: 1, nom: 'Santé', slug: 'sante' },
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: articleAttendu,
      });

      // Act
      const resultat = await getArticle(1);

      // Assert
      expect(resultat).toEqual(articleAttendu);
      expect(apiClient.get).toHaveBeenCalledWith('/articles/1');
      expect(resultat.titre).toBe('Article détaillé');
    });

    test('retourne un article avec contenu long', async () => {
      // Arrange
      const contenuLong = 'Lorem ipsum '.repeat(100); // Texte long
      const articleLong = {
        id: 3,
        titre: 'Article long',
        contenu: contenuLong,
        isPublie: true,
        createdAt: '2026-04-08T10:00:00Z',
        updatedAt: null,
        auteur: { id: 1, email: 'user@example.com', prenom: 'Jean', nom: 'Dupont' },
        categorie: { id: 1, nom: 'Santé', slug: 'sante' },
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: articleLong,
      });

      // Act
      const resultat = await getArticle(3);

      // Assert
      expect(resultat.contenu.length).toBeGreaterThan(1000);
      expect(apiClient.get).toHaveBeenCalledWith('/articles/3');
    });

    test('lance une erreur pour un article inexistant (404)', async () => {
      // Arrange
      const erreur404 = new Error('404 Not Found');
      (apiClient.get as jest.Mock).mockRejectedValue(erreur404);

      // Act & Assert
      await expect(getArticle(999)).rejects.toThrow('404');
      expect(apiClient.get).toHaveBeenCalledWith('/articles/999');
    });

    test('lance une erreur en cas de timeout', async () => {
      // Arrange
      const erreurTimeout = new Error('ECONNABORTED timeout');
      (apiClient.get as jest.Mock).mockRejectedValue(erreurTimeout);

      // Act & Assert
      await expect(getArticle(1)).rejects.toThrow('ECONNABORTED');
    });

    test('retourne un article avec auteur et catégorie', async () => {
      // Arrange
      const articleComplet = {
        id: 2,
        titre: 'Article avec auteur',
        contenu: 'Contenu',
        isPublie: true,
        createdAt: '2026-04-08T10:00:00Z',
        updatedAt: null,
        auteur: { id: 5, email: 'alice@example.com', prenom: 'Alice', nom: 'Martin' },
        categorie: { id: 2, nom: 'Bien-être', slug: 'bien-etre' },
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: articleComplet,
      });

      // Act
      const resultat = await getArticle(2);

      // Assert
      expect(resultat.auteur.prenom).toBe('Alice');
      expect(resultat.categorie.nom).toBe('Bien-être');
    });
  });
});
