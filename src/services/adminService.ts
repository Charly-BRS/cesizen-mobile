// src/services/adminService.ts
// Service réservé aux administrateurs.
//
// SÉCURITÉ INTENTIONNELLE : ce service ne contient VOLONTAIREMENT que des
// actions de visibilité (toggle isPublie / isActive). Aucun DELETE, aucune
// création, aucune modification de contenu. Si le téléphone d'un admin est
// volé avec une session active, le pire dommage possible est de masquer
// ou d'afficher temporairement du contenu — rien d'irréversible.

import apiClient from './api';
import type { Article } from './articleService';
import type { BreathingExercise } from './exerciseService';

// Format de réponse des collections API Platform
interface ReponseCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

// ─── Articles ─────────────────────────────────────────────────────────────────

// Récupère TOUS les articles (publiés ET non publiés) pour l'admin.
// L'API Platform retourne tous les articles quand la requête est faite
// par un utilisateur authentifié avec ROLE_ADMIN.
export const getArticlesAdmin = async (): Promise<Article[]> => {
  const reponse = await apiClient.get<ReponseCollection<Article>>('/articles');
  return reponse.data['hydra:member'];
};

// Bascule la visibilité d'un article (publié ↔ non publié).
// Utilise PATCH (mise à jour partielle) avec merge-patch+json :
// seul le champ "isPublie" est envoyé, le reste du contenu est inchangé.
export const toggleVisibiliteArticle = async (
  id: number,
  estActuellementPublie: boolean
): Promise<void> => {
  await apiClient.patch(
    `/articles/${id}`,
    { isPublie: !estActuellementPublie },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};

// ─── Exercices ────────────────────────────────────────────────────────────────

// Récupère TOUS les exercices (actifs ET inactifs) pour l'admin.
export const getExercicesAdmin = async (): Promise<BreathingExercise[]> => {
  const reponse = await apiClient.get<ReponseCollection<BreathingExercise>>('/breathing_exercises');
  return reponse.data['hydra:member'];
};

// Bascule la visibilité d'un exercice (actif ↔ inactif).
// Seul le champ "isActive" est modifié, le reste est intact.
export const toggleVisibiliteExercice = async (
  id: number,
  estActuellementActif: boolean
): Promise<void> => {
  await apiClient.patch(
    `/breathing_exercises/${id}`,
    { isActive: !estActuellementActif },
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
};
