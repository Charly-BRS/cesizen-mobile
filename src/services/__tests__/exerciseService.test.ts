// src/services/__tests__/exerciseService.test.ts
// Tests unitaires pour le service d'exercices respiratoires

import {
  getExercices,
  getExercice,
  demarrerSession,
  terminerSession,
} from '../exerciseService';
import apiClient from '../api';

// Mock apiClient (axios)
jest.mock('../api');

describe('exerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour getExercices
  describe('getExercices', () => {
    test('retourne une liste d\'exercices valide', async () => {
      // Arrange
      const exercicesAttendu = {
        'hydra:member': [
          {
            id: 1,
            nom: 'Respiration calme',
            slug: 'respiration-calme',
            description: 'Exercice de respiration lente',
            inspirationDuration: 4,
            apneaDuration: 0,
            expirationDuration: 4,
            cycles: 10,
            isPreset: true,
            isActive: true,
          },
          {
            id: 2,
            nom: 'Respiration rapide',
            slug: 'respiration-rapide',
            description: 'Exercice de respiration rapide',
            inspirationDuration: 1,
            apneaDuration: 0,
            expirationDuration: 1,
            cycles: 20,
            isPreset: true,
            isActive: true,
          },
        ],
        'hydra:totalItems': 2,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: exercicesAttendu,
      });

      // Act
      const resultat = await getExercices();

      // Assert
      expect(resultat).toEqual(exercicesAttendu['hydra:member']);
      expect(apiClient.get).toHaveBeenCalledWith('/breathing_exercises');
      expect(resultat.length).toBe(2);
      expect(resultat[0].nom).toBe('Respiration calme');
    });

    test('retourne une liste vide quand aucun exercice', async () => {
      // Arrange
      const reponseVide = {
        'hydra:member': [],
        'hydra:totalItems': 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: reponseVide,
      });

      // Act
      const resultat = await getExercices();

      // Assert
      expect(resultat).toEqual([]);
      expect(resultat.length).toBe(0);
    });

    test('filtre les exercices inactifs', async () => {
      // Arrange
      const exercicesAvecInactifs = {
        'hydra:member': [
          {
            id: 1,
            nom: 'Exercice actif',
            slug: 'actif',
            description: 'Description',
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
            description: 'Description',
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
        data: exercicesAvecInactifs,
      });

      // Act
      const resultat = await getExercices();
      const actifs = resultat.filter((e: any) => e.isActive);

      // Assert
      expect(actifs.length).toBe(1);
      expect(actifs[0].nom).toBe('Exercice actif');
    });

    test('lance une erreur en cas de problème réseau', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED')
      );

      // Act & Assert
      await expect(getExercices()).rejects.toThrow('ECONNABORTED');
    });
  });

  // Tests pour getExercice
  describe('getExercice', () => {
    test('retourne un exercice valide par ID', async () => {
      // Arrange
      const exerciceAttendu = {
        id: 1,
        nom: 'Respiration 4-7-8',
        slug: 'respiration-4-7-8',
        description: 'Technique de respiration alternée',
        inspirationDuration: 4,
        apneaDuration: 7,
        expirationDuration: 8,
        cycles: 5,
        isPreset: true,
        isActive: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: exerciceAttendu,
      });

      // Act
      const resultat = await getExercice(1);

      // Assert
      expect(resultat).toEqual(exerciceAttendu);
      expect(apiClient.get).toHaveBeenCalledWith('/breathing_exercises/1');
      expect(resultat.nom).toBe('Respiration 4-7-8');
    });

    test('retourne un exercice avec durées complètes', async () => {
      // Arrange
      const exerciceComplet = {
        id: 5,
        nom: 'Respiration avancée',
        slug: 'respiration-avancee',
        description: 'Exercice avancé avec rétention',
        inspirationDuration: 5,
        apneaDuration: 10,
        expirationDuration: 6,
        cycles: 8,
        isPreset: false,
        isActive: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: exerciceComplet,
      });

      // Act
      const resultat = await getExercice(5);

      // Assert
      expect(resultat.apneaDuration).toBe(10);
      expect(resultat.cycles).toBe(8);
    });

    test('lance une erreur pour un exercice inexistant (404)', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('404 Not Found')
      );

      // Act & Assert
      await expect(getExercice(999)).rejects.toThrow('404');
      expect(apiClient.get).toHaveBeenCalledWith('/breathing_exercises/999');
    });

    test('gère timeout lors de la récupération', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED timeout of 10000ms exceeded')
      );

      // Act & Assert
      await expect(getExercice(1)).rejects.toThrow('ECONNABORTED');
    });
  });

  // Tests pour demarrerSession
  describe('demarrerSession', () => {
    test('crée une session valide pour un exercice', async () => {
      // Arrange
      const sessionCreee = {
        id: 100,
        status: 'started' as const,
        startedAt: '2026-04-08T10:00:00Z',
        endedAt: null,
        breathingExercise: {
          id: 1,
          nom: 'Respiration calme',
          slug: 'respiration-calme',
          description: 'Exercice de respiration lente',
          inspirationDuration: 4,
          apneaDuration: 0,
          expirationDuration: 4,
          cycles: 10,
          isPreset: true,
          isActive: true,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: sessionCreee,
      });

      // Act
      const resultat = await demarrerSession(1);

      // Assert
      expect(resultat).toEqual(sessionCreee);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/user_sessions',
        { breathingExercise: '/api/breathing_exercises/1' },
        { headers: { 'Content-Type': 'application/ld+json' } }
      );
      expect(resultat.id).toBe(100);
      expect(resultat.status).toBe('started');
    });

    test('lance une erreur si l\'exercice n\'existe pas', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('404 Exercise not found')
      );

      // Act & Assert
      await expect(demarrerSession(999)).rejects.toThrow('404');
    });

    test('lance une erreur en cas d\'authentification échouée (401)', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('401 Unauthorized')
      );

      // Act & Assert
      await expect(demarrerSession(1)).rejects.toThrow('401');
    });

    test('crée plusieurs sessions pour le même exercice', async () => {
      // Arrange
      const session1 = {
        id: 100,
        status: 'started' as const,
        startedAt: '2026-04-08T10:00:00Z',
        endedAt: null,
        breathingExercise: { id: 1, nom: 'Test', slug: 'test', description: null, inspirationDuration: 4, apneaDuration: 0, expirationDuration: 4, cycles: 10, isPreset: true, isActive: true },
      };
      const session2 = {
        id: 101,
        status: 'started' as const,
        startedAt: '2026-04-08T10:10:00Z',
        endedAt: null,
        breathingExercise: { id: 1, nom: 'Test', slug: 'test', description: null, inspirationDuration: 4, apneaDuration: 0, expirationDuration: 4, cycles: 10, isPreset: true, isActive: true },
      };

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: session1 })
        .mockResolvedValueOnce({ data: session2 });

      // Act
      const res1 = await demarrerSession(1);
      const res2 = await demarrerSession(1);

      // Assert
      expect(res1.id).toBe(100);
      expect(res2.id).toBe(101);
      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });
  });

  // Tests pour terminerSession
  describe('terminerSession', () => {
    test('termine une session avec succès (completed)', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await terminerSession(100, 'completed');

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/user_sessions/100',
        {
          status: 'completed',
          endedAt: expect.any(String), // Date ISO string
        },
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('termine une session abandonnée', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await terminerSession(100, 'abandoned');

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/user_sessions/100',
        {
          status: 'abandoned',
          endedAt: expect.any(String),
        },
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );
    });

    test('lance une erreur si la session n\'existe pas', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('404 Session not found')
      );

      // Act & Assert
      await expect(terminerSession(999, 'completed')).rejects.toThrow('404');
    });

    test('envoie la date actuelle au format ISO', async () => {
      // Arrange
      const dateAvant = new Date();
      (apiClient.patch as jest.Mock).mockResolvedValue({});

      // Act
      await terminerSession(100, 'completed');

      // Assert
      const appel = (apiClient.patch as jest.Mock).mock.calls[0];
      const endedAt = appel[1].endedAt;
      const dateEnvoyee = new Date(endedAt);

      expect(dateEnvoyee.getTime()).toBeGreaterThanOrEqual(dateAvant.getTime());
      expect(endedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('lance une erreur en cas de timeout', async () => {
      // Arrange
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('ECONNABORTED timeout')
      );

      // Act & Assert
      await expect(terminerSession(100, 'completed')).rejects.toThrow('ECONNABORTED');
    });
  });
});
