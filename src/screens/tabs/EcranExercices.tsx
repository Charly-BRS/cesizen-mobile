// src/screens/tabs/EcranExercices.tsx
// Liste des exercices de respiration disponibles.
// Affiche pour chaque exercice : le nom, la description, les durées et le nombre de cycles.
// Un appui sur une carte ouvre l'écran d'animation.

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
import { getExercices, type BreathingExercise } from '../../services/exerciseService';
import type { ParamListeRoutesExercices } from '../../navigation/NavigateurExercices';

// Type de navigation pour aller vers l'écran d'animation
type NavigationExercices = StackNavigationProp<ParamListeRoutesExercices, 'ListeExercices'>;

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

// Calcule et formate la durée totale d'un exercice
// Exemple : 6 cycles × (4s + 0s + 6s) = 60 secondes → "1 min"
const formaterDureeTotal = (ex: BreathingExercise): string => {
  const secondesTotal = (ex.inspirationDuration + ex.apneaDuration + ex.expirationDuration) * ex.cycles;
  if (secondesTotal < 60) return `${secondesTotal} sec`;
  const minutes = Math.floor(secondesTotal / 60);
  const secondes = secondesTotal % 60;
  return secondes > 0 ? `${minutes} min ${secondes} sec` : `${minutes} min`;
};

// ─── Composant carte d'exercice ───────────────────────────────────────────────
interface CarteExerciceProps {
  exercice: BreathingExercise;
  onAppuyer: () => void;
}

const CarteExercice: React.FC<CarteExerciceProps> = ({ exercice, onAppuyer }) => (
  <TouchableOpacity style={styles.carte} onPress={onAppuyer} activeOpacity={0.75}>
    {/* En-tête : nom + durée totale */}
    <View style={styles.enteteCartes}>
      <Text style={styles.nomExercice}>{exercice.nom}</Text>
      <View style={styles.badgeDuree}>
        <Text style={styles.texteBadgeDuree}>⏱ {formaterDureeTotal(exercice)}</Text>
      </View>
    </View>

    {/* Description (si présente) */}
    {exercice.description ? (
      <Text style={styles.description}>{exercice.description}</Text>
    ) : null}

    {/* Détail des phases */}
    <View style={styles.phases}>
      <View style={styles.phase}>
        <Text style={styles.dureePhase}>{exercice.inspirationDuration}s</Text>
        <Text style={styles.labelPhase}>Inspirez</Text>
      </View>

      {/* Affiche la phase d'apnée seulement si sa durée est > 0 */}
      {exercice.apneaDuration > 0 && (
        <View style={styles.phase}>
          <Text style={styles.dureePhase}>{exercice.apneaDuration}s</Text>
          <Text style={styles.labelPhase}>Retenez</Text>
        </View>
      )}

      <View style={styles.phase}>
        <Text style={styles.dureePhase}>{exercice.expirationDuration}s</Text>
        <Text style={styles.labelPhase}>Expirez</Text>
      </View>

      <View style={[styles.phase, styles.phaseCycles]}>
        <Text style={styles.dureePhase}>{exercice.cycles}</Text>
        <Text style={styles.labelPhase}>Cycles</Text>
      </View>
    </View>

    {/* Bouton visuel */}
    <View style={styles.piedCarte}>
      <Text style={styles.texteCommencer}>Commencer →</Text>
    </View>
  </TouchableOpacity>
);

// ─── Écran principal ──────────────────────────────────────────────────────────
const EcranExercices: React.FC = () => {
  const navigation = useNavigation<NavigationExercices>();

  const [exercices, setExercices] = useState<BreathingExercise[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [rafraichissement, setRafraichissement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string>('');

  // Charge les exercices depuis l'API
  const chargerExercices = async (estRafraichissement = false) => {
    if (estRafraichissement) {
      setRafraichissement(true);
    } else {
      setChargement(true);
    }
    setErreur('');

    try {
      const donnees = await getExercices();
      setExercices(donnees);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Impossible de charger les exercices. Réessayez.');
      }
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  useEffect(() => {
    chargerExercices();
  }, []);

  const ouvrirExercice = (exercice: BreathingExercise) => {
    // On passe l'objet complet : l'écran d'animation n'a plus besoin de rappeler l'API
    navigation.navigate('AnimationExercice', { exercice });
  };

  // ── Chargement initial ──
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.texteChargement}>Chargement des exercices…</Text>
      </View>
    );
  }

  // ── Erreur ──
  if (erreur !== '') {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeErreur}>⚠️</Text>
        <Text style={styles.texteErreur}>{erreur}</Text>
        <TouchableOpacity style={styles.boutonReessayer} onPress={() => chargerExercices()}>
          <Text style={styles.texteBoutonReessayer}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Liste vide ──
  if (exercices.length === 0) {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeVide}>🌬️</Text>
        <Text style={styles.texteVide}>Aucun exercice disponible pour le moment.</Text>
      </View>
    );
  }

  // ── Liste des exercices ──
  return (
    <FlatList
      style={styles.liste}
      data={exercices}
      keyExtractor={(ex) => ex.id.toString()}
      renderItem={({ item: exercice }) => (
        <CarteExercice
          exercice={exercice}
          onAppuyer={() => ouvrirExercice(exercice)}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={rafraichissement}
          onRefresh={() => chargerExercices(true)}
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
  liste: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  contenuListe: {
    padding: 16,
    paddingBottom: 24,
  },
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
  enteteCartes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nomExercice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badgeDuree: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  texteBadgeDuree: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  // Ligne des phases (durées)
  phases: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  phase: {
    flex: 1,
    alignItems: 'center',
  },
  phaseCycles: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  dureePhase: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  labelPhase: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  piedCarte: {
    alignItems: 'flex-end',
  },
  texteCommencer: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  // États
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
  iconeErreur: { fontSize: 48, marginBottom: 12 },
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
  iconeVide: { fontSize: 48, marginBottom: 12 },
  texteVide: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EcranExercices;
