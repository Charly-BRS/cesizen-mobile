// src/screens/tabs/EcranAccueil.tsx
// Tableau de bord : accueille l'utilisateur par son prénom
// et propose des raccourcis vers les 3 autres sections de l'app.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../context/AuthContext';
import type { ParamListeOnglets } from '../../navigation/NavigateurOnglets';

// Type de navigation pour cet écran (permet navigation.navigate vers les autres onglets)
type NavigationAccueil = BottomTabNavigationProp<ParamListeOnglets, 'Accueil'>;

// Définition des cartes de raccourcis affichées sur le dashboard
// Chaque carte redirige vers un onglet différent
const CARTES_RACCOURCIS = [
  {
    cle: 'Articles',
    emoji: '📰',
    titre: 'Articles',
    description: 'Découvrez des articles sur le bien-être et la gestion du stress.',
    cible: 'Articles' as keyof ParamListeOnglets,
    couleurFond: '#EFF6FF',
    couleurBordure: '#BFDBFE',
  },
  {
    cle: 'Exercices',
    emoji: '🌬️',
    titre: 'Exercices de respiration',
    description: 'Pratiquez la cohérence cardiaque et réduisez votre anxiété.',
    cible: 'Exercices' as keyof ParamListeOnglets,
    couleurFond: '#F0FDF4',
    couleurBordure: '#BBF7D0',
  },
  {
    cle: 'Profil',
    emoji: '👤',
    titre: 'Mon profil',
    description: 'Consultez et modifiez vos informations personnelles.',
    cible: 'Profil' as keyof ParamListeOnglets,
    couleurFond: '#FFF7ED',
    couleurBordure: '#FED7AA',
  },
];

const EcranAccueil: React.FC = () => {
  // Hook de navigation pour aller vers les autres onglets
  const navigation = useNavigation<NavigationAccueil>();

  // Récupère les infos de l'utilisateur connecté depuis le contexte global
  const { utilisateur } = useAuth();

  return (
    <ScrollView style={styles.conteneur} showsVerticalScrollIndicator={false}>

      {/* ── Bannière de bienvenue ── */}
      <View style={styles.banniere}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.titreBienvenue}>
          Bonjour, {utilisateur?.prenom} !
        </Text>
        <Text style={styles.sousTitreBienvenue}>
          Que souhaitez-vous faire aujourd'hui ?
        </Text>
      </View>

      {/* ── Cartes de raccourcis ── */}
      <View style={styles.section}>
        <Text style={styles.titreSectionn}>Accès rapide</Text>

        {/* Génère une carte pour chaque section */}
        {CARTES_RACCOURCIS.map((carte) => (
          <TouchableOpacity
            key={carte.cle}
            style={[
              styles.carte,
              {
                backgroundColor: carte.couleurFond,
                borderColor: carte.couleurBordure,
              },
            ]}
            onPress={() => navigation.navigate(carte.cible)}
            activeOpacity={0.75}
          >
            {/* Contenu de la carte */}
            <View style={styles.conteneurCarte}>
              <Text style={styles.emojiCarte}>{carte.emoji}</Text>
              <View style={styles.texteCarte}>
                <Text style={styles.titreCarte}>{carte.titre}</Text>
                <Text style={styles.descriptionCarte}>{carte.description}</Text>
              </View>
              {/* Flèche indicatrice */}
              <Text style={styles.fleche}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  // Bannière verte du haut
  banniere: {
    backgroundColor: '#16A34A',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  titreBienvenue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  sousTitreBienvenue: {
    fontSize: 15,
    color: '#DCFCE7',
    textAlign: 'center',
  },
  // Section cartes
  section: {
    padding: 20,
  },
  titreSectionn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  // Carte de raccourci
  carte: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  conteneurCarte: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiCarte: {
    fontSize: 32,
    marginRight: 14,
  },
  texteCarte: {
    flex: 1,
  },
  titreCarte: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  descriptionCarte: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  fleche: {
    fontSize: 26,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

export default EcranAccueil;
