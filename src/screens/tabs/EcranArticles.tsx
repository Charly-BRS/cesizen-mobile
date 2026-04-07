// src/screens/tabs/EcranArticles.tsx
// Liste des articles publiés sur CESIZen.
// Charge les articles depuis l'API au montage de l'écran,
// affiche un indicateur de chargement puis la liste, ou un message d'erreur.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getArticles, type Article } from '../../services/articleService';
import type { ParamListeRoutesArticles } from '../../navigation/NavigateurArticles';

// Type de navigation : permet d'appeler navigation.navigate('DetailArticle', ...)
type NavigationArticles = StackNavigationProp<ParamListeRoutesArticles, 'ListeArticles'>;

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

// Formate une date ISO en date lisible en français : "15 janvier 2024"
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

// Tronque un texte à maxCaracteres caractères en ajoutant "..." si nécessaire
const tronquer = (texte: string, maxCaracteres: number): string => {
  if (texte.length <= maxCaracteres) return texte;
  return texte.substring(0, maxCaracteres).trimEnd() + '…';
};

// ─── Composant carte d'article ────────────────────────────────────────────────
// Représente une ligne dans la liste des articles
interface CarteArticleProps {
  article: Article;
  onAppuyer: () => void;
}

const CarteArticle: React.FC<CarteArticleProps> = ({ article, onAppuyer }) => (
  <TouchableOpacity style={styles.carte} onPress={onAppuyer} activeOpacity={0.75}>
    {/* Badge catégorie */}
    <View style={styles.badgeCategorie}>
      <Text style={styles.texteCategorie}>{article.categorie.nom}</Text>
    </View>

    {/* Titre de l'article */}
    <Text style={styles.titreCarte}>{article.titre}</Text>

    {/* Aperçu du contenu (120 premiers caractères) */}
    <Text style={styles.apercu}>{tronquer(article.contenu, 120)}</Text>

    {/* Ligne auteur + date */}
    <View style={styles.piedCarte}>
      <Text style={styles.auteur}>
        ✍️ {article.auteur.prenom} {article.auteur.nom}
      </Text>
      <Text style={styles.date}>{formaterDate(article.createdAt)}</Text>
    </View>
  </TouchableOpacity>
);

// ─── Écran principal ──────────────────────────────────────────────────────────
const EcranArticles: React.FC = () => {
  const navigation = useNavigation<NavigationArticles>();

  // Liste des articles chargés depuis l'API
  const [articles, setArticles] = useState<Article[]>([]);
  // true pendant le premier chargement (affiche le spinner central)
  const [chargement, setChargement] = useState<boolean>(true);
  // true pendant le pull-to-refresh (affiche le spinner en haut)
  const [rafraichissement, setRafraichissement] = useState<boolean>(false);
  // Message d'erreur (chaîne vide = pas d'erreur)
  const [erreur, setErreur] = useState<string>('');

  // Charge les articles depuis l'API
  const chargerArticles = async (estRafraichissement = false) => {
    // Si c'est un pull-to-refresh, utilise l'état rafraichissement au lieu de chargement
    if (estRafraichissement) {
      setRafraichissement(true);
    } else {
      setChargement(true);
    }
    setErreur('');

    try {
      const donnees = await getArticles();
      setArticles(donnees);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Impossible de charger les articles. Réessayez.');
      }
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  // Charge les articles une seule fois au montage de l'écran
  useEffect(() => {
    chargerArticles();
  }, []);

  // Navigue vers le détail de l'article sélectionné
  const ouvrirArticle = (idArticle: number) => {
    navigation.navigate('DetailArticle', { idArticle });
  };

  // ── Écran de chargement initial ──
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.texteChargement}>Chargement des articles…</Text>
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
          style={styles.boutonReessayer}
          onPress={() => chargerArticles()}
        >
          <Text style={styles.texteBoutonReessayer}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Écran sans articles ──
  if (articles.length === 0) {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeVide}>📭</Text>
        <Text style={styles.texteVide}>Aucun article disponible pour le moment.</Text>
      </View>
    );
  }

  // ── Liste des articles ──
  return (
    <FlatList
      style={styles.liste}
      data={articles}
      // keyExtractor indique à FlatList comment identifier chaque élément
      keyExtractor={(article) => article.id.toString()}
      // renderItem crée la carte pour chaque article
      renderItem={({ item: article }) => (
        <CarteArticle
          article={article}
          onAppuyer={() => ouvrirArticle(article.id)}
        />
      )}
      // Pull-to-refresh : l'utilisateur tire la liste vers le bas pour recharger
      refreshControl={
        <RefreshControl
          refreshing={rafraichissement}
          onRefresh={() => chargerArticles(true)}
          colors={['#16A34A']}
          tintColor="#16A34A"
        />
      }
      contentContainerStyle={styles.contenuListe}
      showsVerticalScrollIndicator={false}
    />
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Liste ──
  liste: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  contenuListe: {
    padding: 16,
    paddingBottom: 24,
  },
  // ── Carte article ──
  carte: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCategorie: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  texteCategorie: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  titreCarte: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 22,
  },
  apercu: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  piedCarte: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  auteur: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // ── États (chargement / erreur / vide) ──
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
    marginBottom: 20,
    lineHeight: 22,
  },
  boutonReessayer: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  texteBoutonReessayer: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  iconeVide: {
    fontSize: 48,
    marginBottom: 12,
  },
  texteVide: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EcranArticles;
