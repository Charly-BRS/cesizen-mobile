// src/services/profilService.ts
// Service pour la gestion du profil utilisateur.
// Modification du prénom/nom : PATCH /users/{id} avec merge-patch+json.

import apiClient from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

// Données envoyées lors d'une modification de profil (prénom et/ou nom)
interface DonneesModificationProfil {
  prenom: string;
  nom: string;
}

// Réponse de l'API après modification du profil
export interface ReponseModificationProfil {
  id: number;
  email: string;
  prenom: string;
  nom: string;
}

// ─── Fonctions ────────────────────────────────────────────────────────────────

// Met à jour le prénom et le nom de l'utilisateur connecté.
// Utilise PATCH avec Content-Type merge-patch+json (standard API Platform).
export const modifierProfil = async (
  idUtilisateur: number,
  donnees: DonneesModificationProfil
): Promise<ReponseModificationProfil> => {
  const reponse = await apiClient.patch<ReponseModificationProfil>(
    `/users/${idUtilisateur}`,
    donnees,
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
  return reponse.data;
};
