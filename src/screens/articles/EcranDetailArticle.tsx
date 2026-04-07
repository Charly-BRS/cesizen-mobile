// src/screens/articles/EcranDetailArticle.tsx
// Affiche le détail complet d'un article sélectionné dans la liste.
// Reçoit l'id de l'article en paramètre de navigation,
// charge les données depuis l'API et les affiche.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getArticle, type Article } from '../../services/articleService';
import type { ParamListeRoutesArticles } from '../../navigation/NavigateurArticles';

// Types pour accéder aux paramètres de route et à la navigation
type RouteDetailArticle = RouteProp<ParamListeRoutesArticles, 'DetailArticle'>;
type NavigationDetailArticle = StackNavigationProp<ParamListeRoutesArticles, 'DetailArticle'>;

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

// Formate une date ISO en français : "15 janvier 2024"
const formaterDate = (dateIso: string): string => {
  try {
    return new Date(dateIso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

// ─── Écran de détail ──────────────────────────────────────────────────────────
const EcranDetailArticle: React.FC = () => {
  // Récupère les paramètres de la route (idArticle passé par EcranArticles)
  const route = useRoute<RouteDetailArticle>();
  const navigation = useNavigation<NavigationDetailArticle>();
  const { idArticle } = route.params;

  // L'article chargé depuis l'API (null tant qu'il n'est pas chargé)
  const [article, setArticle] = useState<Article | null>(null);
  // true pendant le chargement
  const [chargement, setChargement] = useState<boolean>(true);
  // Message d'erreur (chaîne vide = pas d'erreur)
  const [erreur, setErreur] = useState<string>('');

  // Charge l'article depuis l'API dès que l'écran s'ouvre
  useEffect(() => {
    const chargerArticle = async () => {
      setChargement(true);
      setErreur('');

      try {
        const donnees = await getArticle(idArticle);
        setArticle(donnees);

        // Met à jour le titre du header avec le titre de l'article
        navigation.setOptions({ title: donnees.titre });
      } catch (err: any) {
        if (err.response?.status === 404) {
          setErreur('Cet article n\'existe plus.');
        } else if (err.code === 'ECONNABORTED') {
          setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
        } else {
          setErreur('Impossible de charger cet article.');
        }
      } finally {
        setChargement(false);
      }
    };

    chargerArticle();
  }, [idArticle]); // Se relance si l'id change

  // ── Écran de chargement ──
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.texteChargement}>Chargement de l'article…</Text>
      </View>
    );
  }

  // ── Écran d'erreur ──
  if (erreur !== '') {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeErreur}>⚠️</Text>
        <Text style={styles.texteErreur}>{erreur}</Text>
        <TouchableOpacity
          style={styles.boutonRetour}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.texteBoutonRetour}>← Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sécurité : ne devrait pas arriver si chargement = false et erreur = ''
  if (!article) return null;

  // ── Affichage de l'article ──
  return (
    <ScrollView style={styles.conteneur} showsVerticalScrollIndicator={false}>

      {/* ── En-tête de l'article ── */}
      <View style={styles.entete}>
        {/* Badge catégorie */}
        <View style={styles.badgeCategorie}>
          <Text style={styles.texteCategorie}>{article.categorie.nom}</Text>
        </View>

        {/* Titre */}
        <Text style={styles.titre}>{article.titre}</Text>

        {/* Ligne auteur + date */}
        <View style={styles.metadonnees}>
          <Text style={styles.auteur}>
            ✍️ {article.auteur.prenom} {article.auteur.nom}
          </Text>
          <Text style={styles.date}>{formaterDate(article.createdAt)}</Text>
        </View>
      </View>

      {/* ── Séparateur ── */}
      <View style={styles.separateur} />

      {/* ── Contenu de l'article ── */}
      {/* Le contenu peut contenir des sauts de ligne (\n) pour les paragraphes.
          On sépare le texte sur les \n et on affiche chaque paragraphe. */}
      <View style={styles.corpsArticle}>
        {article.contenu.split('\n').map((paragraphe, index) => {
          // On ignore les lignes vides
          if (paragraphe.trim() === '') return null;
          return (
            <Text key={index} style={styles.paragraphe}>
              {paragraphe}
            </Text>
          );
        })}
      </View>

      {/* ── Pied de page ── */}
      {article.updatedAt && (
        <Text style={styles.misAJour}>
          Mis à jour le {formaterDate(article.updatedAt)}
        </Text>
      )}

    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // ── En-tête ──
  entete: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#F0FDF4',
  },
  badgeCategorie: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  texteCategorie: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 14,
  },
  metadonnees: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auteur: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // ── Séparateur ──
  separateur: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  // ── Corps de l'article ──
  corpsArticle: {
    padding: 20,
  },
  paragraphe: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,        // Espacement généreux pour faciliter la lecture
    marginBottom: 16,
  },
  // ── Pied de page ──
  misAJour: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 32,
    fontStyle: 'italic',
  },
  // ── États (chargement / erreur) ──
  centrer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0FDF4',
  },
  texteChargement: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  iconeErreur: {
    fontSize: 48,
    marginBottom: 12,
  },
  texteErreur: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  boutonRetour: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  texteBoutonRetour: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default EcranDetailArticle;
