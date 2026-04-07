// src/services/articleService.ts
// Service pour récupérer les articles depuis l'API Symfony.
// Les articles sont publics : pas besoin d'être connecté pour les lire.

import apiClient from './api';

// ─── Types des données reçues de l'API ───────────────────────────────────────

// Catégorie d'un article
export interface Categorie {
  id: number;
  nom: string;
  slug: string;
}

// Auteur d'un article (données publiques uniquement)
export interface AuteurArticle {
  id: number;
  email: string;
  prenom: string;
  nom: string;
}

// Un article complet tel que retourné par l'API
export interface Article {
  id: number;
  titre: string;
  contenu: string;       // Texte complet (peut contenir des \n pour les paragraphes)
  isPublie: boolean;
  createdAt: string;     // Date ISO 8601 : "2024-01-15T10:30:00+00:00"
  updatedAt: string | null;
  auteur: AuteurArticle;
  categorie: Categorie;
}

// Format de réponse de l'API Platform pour les collections
interface ReponseCollection {
  'hydra:member': Article[];
  'hydra:totalItems': number;
}

// ─── Fonctions du service ─────────────────────────────────────────────────────

// Récupère la liste de tous les articles publiés
export const getArticles = async (): Promise<Article[]> => {
  // GET /articles → retourne { "hydra:member": [...], "hydra:totalItems": N }
  const reponse = await apiClient.get<ReponseCollection>('/articles');
  // On retourne uniquement le tableau d'articles (la clé "hydra:member")
  return reponse.data['hydra:member'];
};

// Récupère le détail d'un article par son identifiant
export const getArticle = async (id: number): Promise<Article> => {
  // GET /articles/{id} → retourne un seul article
  const reponse = await apiClient.get<Article>(`/articles/${id}`);
  return reponse.data;
};
