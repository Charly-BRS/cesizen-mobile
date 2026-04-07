// src/screens/admin/EcranAdmin.tsx
// Panneau d'administration : permet de basculer la visibilité des articles
// et des exercices sans aucune action destructive.
//
// SÉCURITÉ : seules les actions PATCH (toggle visibilité) sont disponibles.
// Chaque action demande une confirmation explicite via Alert.alert.
// En cas de vol du téléphone, le pire scénario est du contenu masqué/affiché.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  getArticlesAdmin,
  getExercicesAdmin,
  toggleVisibiliteArticle,
  toggleVisibiliteExercice,
} from '../../services/adminService';
import type { Article } from '../../services/articleService';
import type { BreathingExercise } from '../../services/exerciseService';

// ─── Types ────────────────────────────────────────────────────────────────────

// Les deux onglets disponibles dans ce panneau
type OngletActif = 'articles' | 'exercices';

// ─── Composant ligne article ──────────────────────────────────────────────────
interface LigneArticleProps {
  article: Article;
  onToggle: (article: Article) => void;
  enCours: boolean; // true si un toggle est en cours de traitement pour cet article
}

const LigneArticle: React.FC<LigneArticleProps> = ({ article, onToggle, enCours }) => (
  <View style={styles.ligne}>
    <View style={styles.ligneTexte}>
      {/* Titre de l'article */}
      <Text style={styles.ligneNom} numberOfLines={2}>{article.titre}</Text>
      {/* Badge de catégorie */}
      <Text style={styles.ligneDetail}>{article.categorie.nom}</Text>
    </View>

    {/* Switch de visibilité (ou spinner si action en cours) */}
    <View style={styles.ligneControle}>
      {enCours ? (
        <ActivityIndicator size="small" color="#16A34A" />
      ) : (
        <Switch
          value={article.isPublie}
          onValueChange={() => onToggle(article)}
          trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
          thumbColor={article.isPublie ? '#16A34A' : '#9CA3AF'}
          // ios_backgroundColor évite le gris par défaut sur iOS
          ios_backgroundColor="#D1D5DB"
        />
      )}
    </View>
  </View>
);

// ─── Composant ligne exercice ─────────────────────────────────────────────────
interface LigneExerciceProps {
  exercice: BreathingExercise;
  onToggle: (exercice: BreathingExercise) => void;
  enCours: boolean;
}

const LigneExercice: React.FC<LigneExerciceProps> = ({ exercice, onToggle, enCours }) => (
  <View style={styles.ligne}>
    <View style={styles.ligneTexte}>
      <Text style={styles.ligneNom} numberOfLines={1}>{exercice.nom}</Text>
      <Text style={styles.ligneDetail}>
        {exercice.inspirationDuration}s · {exercice.expirationDuration}s · {exercice.cycles} cycles
      </Text>
    </View>

    <View style={styles.ligneControle}>
      {enCours ? (
        <ActivityIndicator size="small" color="#16A34A" />
      ) : (
        <Switch
          value={exercice.isActive}
          onValueChange={() => onToggle(exercice)}
          trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
          thumbColor={exercice.isActive ? '#16A34A' : '#9CA3AF'}
          ios_backgroundColor="#D1D5DB"
        />
      )}
    </View>
  </View>
);

// ─── Écran principal ──────────────────────────────────────────────────────────
const EcranAdmin: React.FC = () => {
  // Onglet actuellement affiché
  const [onglet, setOnglet] = useState<OngletActif>('articles');

  // ─── État : articles ──────────────────────────────────────────────────────
  const [articles, setArticles] = useState<Article[]>([]);
  const [chargementArticles, setChargementArticles] = useState<boolean>(true);
  const [erreurArticles, setErreurArticles] = useState<string>('');
  const [rafraichissementArticles, setRafraichissementArticles] = useState<boolean>(false);
  // Set des IDs d'articles dont le toggle est en cours (évite les doubles-clics)
  const [togglesArticlesEnCours, setTogglesArticlesEnCours] = useState<Set<number>>(new Set());

  // ─── État : exercices ─────────────────────────────────────────────────────
  const [exercices, setExercices] = useState<BreathingExercise[]>([]);
  const [chargementExercices, setChargementExercices] = useState<boolean>(true);
  const [erreurExercices, setErreurExercices] = useState<string>('');
  const [rafraichissementExercices, setRafraichissementExercices] = useState<boolean>(false);
  const [togglesExercicesEnCours, setTogglesExercicesEnCours] = useState<Set<number>>(new Set());

  // ─── Chargement des articles ──────────────────────────────────────────────
  const chargerArticles = useCallback(async (estRafraichissement = false) => {
    if (estRafraichissement) {
      setRafraichissementArticles(true);
    } else {
      setChargementArticles(true);
    }
    setErreurArticles('');

    try {
      const donnees = await getArticlesAdmin();
      setArticles(donnees);
    } catch {
      setErreurArticles('Impossible de charger les articles.');
    } finally {
      setChargementArticles(false);
      setRafraichissementArticles(false);
    }
  }, []);

  // ─── Chargement des exercices ─────────────────────────────────────────────
  const chargerExercices = useCallback(async (estRafraichissement = false) => {
    if (estRafraichissement) {
      setRafraichissementExercices(true);
    } else {
      setChargementExercices(true);
    }
    setErreurExercices('');

    try {
      const donnees = await getExercicesAdmin();
      setExercices(donnees);
    } catch {
      setErreurExercices('Impossible de charger les exercices.');
    } finally {
      setChargementExercices(false);
      setRafraichissementExercices(false);
    }
  }, []);

  // Charge les deux listes au montage de l'écran
  useEffect(() => {
    chargerArticles();
    chargerExercices();
  }, []);

  // ─── Toggle visibilité article ────────────────────────────────────────────
  const toggleArticle = (article: Article) => {
    // Message de confirmation adapté à l'action (afficher ou masquer)
    const action = article.isPublie ? 'masquer' : 'afficher';
    const futurEtat = article.isPublie ? 'masqué des utilisateurs' : 'visible par tous';

    Alert.alert(
      'Confirmer la modification',
      `Voulez-vous ${action} l'article "${article.titre}" ?\n\nIl sera ${futurEtat}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          // Pas de style "destructive" car l'action est réversible
          onPress: async () => {
            // Marque cet article comme "en cours de traitement"
            setTogglesArticlesEnCours((prev) => new Set(prev).add(article.id));

            try {
              await toggleVisibiliteArticle(article.id, article.isPublie);

              // Mise à jour locale immédiate sans recharger toute la liste
              setArticles((prev) =>
                prev.map((a) =>
                  a.id === article.id ? { ...a, isPublie: !a.isPublie } : a
                )
              );
            } catch {
              Alert.alert('Erreur', 'La modification a échoué. Réessayez.');
            } finally {
              // Retire cet article de la liste "en cours"
              setTogglesArticlesEnCours((prev) => {
                const suivant = new Set(prev);
                suivant.delete(article.id);
                return suivant;
              });
            }
          },
        },
      ]
    );
  };

  // ─── Toggle visibilité exercice ───────────────────────────────────────────
  const toggleExercice = (exercice: BreathingExercise) => {
    const action = exercice.isActive ? 'masquer' : 'afficher';
    const futurEtat = exercice.isActive ? 'masqué des utilisateurs' : 'visible par tous';

    Alert.alert(
      'Confirmer la modification',
      `Voulez-vous ${action} l'exercice "${exercice.nom}" ?\n\nIl sera ${futurEtat}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setTogglesExercicesEnCours((prev) => new Set(prev).add(exercice.id));

            try {
              await toggleVisibiliteExercice(exercice.id, exercice.isActive);

              setExercices((prev) =>
                prev.map((e) =>
                  e.id === exercice.id ? { ...e, isActive: !e.isActive } : e
                )
              );
            } catch {
              Alert.alert('Erreur', 'La modification a échoué. Réessayez.');
            } finally {
              setTogglesExercicesEnCours((prev) => {
                const suivant = new Set(prev);
                suivant.delete(exercice.id);
                return suivant;
              });
            }
          },
        },
      ]
    );
  };

  // ─── Rendu de l'onglet Articles ───────────────────────────────────────────
  const renderArticles = () => {
    if (chargementArticles) {
      return (
        <View style={styles.centrer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.texteChargement}>Chargement des articles…</Text>
        </View>
      );
    }

    if (erreurArticles !== '') {
      return (
        <View style={styles.centrer}>
          <Text style={styles.iconeErreur}>⚠️</Text>
          <Text style={styles.texteErreur}>{erreurArticles}</Text>
          <TouchableOpacity style={styles.boutonReessayer} onPress={() => chargerArticles()}>
            <Text style={styles.texteBoutonReessayer}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id.toString()}
        renderItem={({ item }) => (
          <LigneArticle
            article={item}
            onToggle={toggleArticle}
            enCours={togglesArticlesEnCours.has(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissementArticles}
            onRefresh={() => chargerArticles(true)}
            colors={['#16A34A']}
            tintColor="#16A34A"
          />
        }
        ListEmptyComponent={
          <View style={styles.centrer}>
            <Text style={styles.texteVide}>Aucun article.</Text>
          </View>
        }
        // En-tête explicatif sur la sécurité
        ListHeaderComponent={<BanniereSecurite />}
        contentContainerStyle={styles.contenuListe}
      />
    );
  };

  // ─── Rendu de l'onglet Exercices ──────────────────────────────────────────
  const renderExercices = () => {
    if (chargementExercices) {
      return (
        <View style={styles.centrer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.texteChargement}>Chargement des exercices…</Text>
        </View>
      );
    }

    if (erreurExercices !== '') {
      return (
        <View style={styles.centrer}>
          <Text style={styles.iconeErreur}>⚠️</Text>
          <Text style={styles.texteErreur}>{erreurExercices}</Text>
          <TouchableOpacity style={styles.boutonReessayer} onPress={() => chargerExercices()}>
            <Text style={styles.texteBoutonReessayer}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={exercices}
        keyExtractor={(e) => e.id.toString()}
        renderItem={({ item }) => (
          <LigneExercice
            exercice={item}
            onToggle={toggleExercice}
            enCours={togglesExercicesEnCours.has(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissementExercices}
            onRefresh={() => chargerExercices(true)}
            colors={['#16A34A']}
            tintColor="#16A34A"
          />
        }
        ListEmptyComponent={
          <View style={styles.centrer}>
            <Text style={styles.texteVide}>Aucun exercice.</Text>
          </View>
        }
        ListHeaderComponent={<BanniereSecurite />}
        contentContainerStyle={styles.contenuListe}
      />
    );
  };

  return (
    <View style={styles.conteneur}>
      {/* ── Sélecteur d'onglet ── */}
      <View style={styles.onglets}>
        <TouchableOpacity
          style={[styles.onglet, onglet === 'articles' && styles.ongletActif]}
          onPress={() => setOnglet('articles')}
          activeOpacity={0.7}
        >
          <Text style={[styles.texteOnglet, onglet === 'articles' && styles.texteOngletActif]}>
            📰 Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.onglet, onglet === 'exercices' && styles.ongletActif]}
          onPress={() => setOnglet('exercices')}
          activeOpacity={0.7}
        >
          <Text style={[styles.texteOnglet, onglet === 'exercices' && styles.texteOngletActif]}>
            🌬️ Exercices
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Contenu de l'onglet actif ── */}
      <View style={styles.contenuOnglet}>
        {onglet === 'articles' ? renderArticles() : renderExercices()}
      </View>
    </View>
  );
};

// ─── Bannière d'information sécurité ─────────────────────────────────────────
// Rappelle à l'admin ce qu'il peut et ne peut PAS faire depuis le mobile
const BanniereSecurite: React.FC = () => (
  <View style={styles.banniere}>
    <Text style={styles.banniereTitre}>🔒 Actions disponibles</Text>
    <Text style={styles.banniereTexte}>
      Depuis l'application mobile, vous pouvez uniquement afficher ou masquer
      du contenu. Pour créer, modifier ou supprimer, utilisez l'interface web.
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  // ── Sélecteur d'onglets ──
  onglets: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  onglet: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  ongletActif: {
    borderBottomColor: '#16A34A',
  },
  texteOnglet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  texteOngletActif: {
    color: '#16A34A',
  },
  // ── Contenu ──
  contenuOnglet: {
    flex: 1,
  },
  contenuListe: {
    padding: 16,
    paddingBottom: 32,
  },
  // ── Ligne article / exercice ──
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ligneTexte: {
    flex: 1,
    marginRight: 12,
  },
  ligneNom: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  ligneDetail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ligneControle: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Bannière sécurité ──
  banniere: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  banniereTitre: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  banniereTexte: {
    fontSize: 13,
    color: '#1D4ED8',
    lineHeight: 19,
  },
  // ── États ──
  centrer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  texteChargement: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  iconeErreur: {
    fontSize: 40,
    marginBottom: 10,
  },
  texteErreur: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  boutonReessayer: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  texteBoutonReessayer: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  texteVide: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default EcranAdmin;
