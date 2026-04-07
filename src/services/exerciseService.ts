// src/services/exerciseService.ts
// Service pour les exercices de respiration et les sessions utilisateur.
// Les exercices sont publics (lecture sans token).
// Les sessions nécessitent d'être connecté.

import apiClient from './api';

// ─── Types des données reçues de l'API ───────────────────────────────────────

// Un exercice de respiration (durées en secondes)
export interface BreathingExercise {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  inspirationDuration: number;  // Durée d'inspiration en secondes
  apneaDuration: number;        // Durée de rétention (peut être 0)
  expirationDuration: number;   // Durée d'expiration en secondes
  cycles: number;               // Nombre de cycles à effectuer
  isPreset: boolean;            // true = exercice système, false = exercice personnalisé
  isActive: boolean;            // true = visible par les utilisateurs
}

// Une session d'exercice enregistrée en base de données
export interface UserSession {
  id: number;
  status: 'started' | 'completed' | 'abandoned';
  startedAt: string;                        // Date ISO 8601
  endedAt: string | null;                   // null si la session est encore en cours
  breathingExercise: BreathingExercise;     // L'exercice lié à cette session
}

// Format de réponse des collections API Platform
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// ─── Fonctions du service ─────────────────────────────────────────────────────

// Récupère la liste de tous les exercices actifs
export const getExercices = async (): Promise<BreathingExercise[]> => {
  const reponse = await apiClient.get<ReponseCollection<BreathingExercise>>('/breathing_exercises');
  return reponse.data['hydra:member'];
};

// Récupère le détail d'un exercice par son id
export const getExercice = async (id: number): Promise<BreathingExercise> => {
  const reponse = await apiClient.get<BreathingExercise>(`/breathing_exercises/${id}`);
  return reponse.data;
};

// Démarre une nouvelle session pour un exercice (nécessite d'être connecté).
// L'API attend l'IRI de l'exercice (format API Platform) : "/api/breathing_exercises/{id}"
export const demarrerSession = async (exerciceId: number): Promise<UserSession> => {
  const reponse = await apiClient.post<UserSession>(
    '/user_sessions',
    { breathingExercise: `/api/breathing_exercises/${exerciceId}` },
    { headers: { 'Content-Type': 'application/ld+json' } }
  );
  return reponse.data;
};

// Termine une session existante en lui donnant un statut final.
// statut : "completed" si l'exercice a été fait en entier, "abandoned" si arrêté avant la fin.
// L'API attend Content-Type: merge-patch+json pour les mises à jour partielles.
export const terminerSession = async (
  sessionId: number,
  statut: 'completed' | 'abandoned'
): Promise<void> => {
  await apiClient.patch(
    `/user_sessions/${sessionId}`,
    {
      status: statut,
      endedAt: new Date().toISOString(), // Horodatage actuel au format ISO 8601
    },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// Récupère l'historique des sessions de l'utilisateur connecté
export const getMesSessions = async (): Promise<UserSession[]> => {
  const reponse = await apiClient.get<ReponseCollection<UserSession>>('/user_sessions');
  return reponse.data['hydra:member'];
};
