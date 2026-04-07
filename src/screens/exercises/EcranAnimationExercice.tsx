// src/screens/exercises/EcranAnimationExercice.tsx
// Écran d'animation de respiration.
//
// Fonctionnement :
//   1. Reçoit l'exercice en paramètre de navigation (déjà chargé par la liste)
//   2. L'utilisateur appuie sur "Commencer"
//   3. Un cercle animé guide la respiration (inspiration → apnée → expiration)
//   4. Si connecté : une session est créée en BD et mise à jour à la fin
//   5. L'exercice se répète pour le nombre de cycles défini

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import {
  demarrerSession,
  terminerSession,
  type BreathingExercise,
} from '../../services/exerciseService';
import type { ParamListeRoutesExercices } from '../../navigation/NavigateurExercices';

// ─── Types ────────────────────────────────────────────────────────────────────
type RouteAnimationExercice = RouteProp<ParamListeRoutesExercices, 'AnimationExercice'>;
type NavigationAnimationExercice = StackNavigationProp<ParamListeRoutesExercices, 'AnimationExercice'>;

// Les 5 phases possibles de l'animation
type Phase = 'pret' | 'inspiration' | 'apnee' | 'expiration' | 'termine';

// Texte affiché dans le cercle selon la phase en cours
const LABELS_PHASES: Record<Phase, string> = {
  pret: 'Prêt',
  inspiration: 'Inspirez',
  apnee: 'Retenez',
  expiration: 'Expirez',
  termine: 'Terminé !',
};

// Couleur du cercle selon la phase
const COULEURS_PHASES: Record<Phase, string> = {
  pret: '#9CA3AF',
  inspiration: '#16A34A',
  apnee: '#3B82F6',
  expiration: '#0891B2',
  termine: '#16A34A',
};

// ─── Composant principal ──────────────────────────────────────────────────────
const EcranAnimationExercice: React.FC = () => {
  const route = useRoute<RouteAnimationExercice>();
  const navigation = useNavigation<NavigationAnimationExercice>();
  const { estConnecte } = useAuth();
  // L'exercice est passé directement depuis la liste → aucune requête API supplémentaire
  const { exercice: exerciceParams } = route.params;

  // ─── L'exercice vient directement des params, pas besoin de le stocker en state ──
  // On garde une const simple : la valeur ne change pas pendant la durée de l'écran.
  const exercice: BreathingExercise = exerciceParams;

  // ─── États : affichage de l'animation ─────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('pret');
  const [compteur, setCompteur] = useState<number>(0);      // Secondes restantes dans la phase
  const [cycleCourant, setCycleCourant] = useState<number>(0); // Cycle actuel (commence à 0)

  // ─── Références ───────────────────────────────────────────────────────────
  // Les refs permettent à la fonction setInterval de lire les VALEURS ACTUELLES
  // des variables sans être piégée par le "stale closure" (capture de la valeur
  // au moment où la fonction a été créée, sans voir les mises à jour).

  const exerciceRef = useRef<BreathingExercise | null>(null);
  const phaseRef = useRef<Phase>('pret');
  const compteurRef = useRef<number>(0);
  const cycleRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<number | null>(null);  // ID de la session en BD

  // ─── Animation du cercle (Animated API) ──────────────────────────────────
  // echelle représente la taille du cercle (0.6 = petit, 1.4 = grand)
  const echelle = useRef(new Animated.Value(0.7)).current;

  // ─── Helpers : met à jour état ET ref en même temps ──────────────────────
  // On doit synchroniser les deux car :
  // - useState → déclenche le re-render (mise à jour de l'affichage)
  // - useRef → donne la valeur actuelle à l'intérieur de setInterval
  const mettreAJourPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const mettreAJourCompteur = (n: number) => {
    compteurRef.current = n;
    setCompteur(n);
  };
  const mettreAJourCycle = (n: number) => {
    cycleRef.current = n;
    setCycleCourant(n);
  };

  // ─── Initialisation au montage : populate la ref et le titre du header ───
  // Pas de requête API : l'exercice vient des params de navigation.
  useEffect(() => {
    if (exerciceParams) {
      exerciceRef.current = exerciceParams;
      // Met à jour le titre du header avec le nom de l'exercice
      navigation.setOptions({ title: exerciceParams.nom });
    }
  }, [exerciceParams]);

  // ─── Nettoyage quand l'écran est fermé ───────────────────────────────────
  useEffect(() => {
    return () => {
      // Arrête le ticker pour éviter une fuite mémoire
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Abandonne la session si l'exercice était en cours
      if (sessionIdRef.current && phaseRef.current !== 'pret' && phaseRef.current !== 'termine') {
        terminerSession(sessionIdRef.current, 'abandoned').catch(console.error);
      }
    };
  }, []);

  // ─── Animation du cercle quand la phase change ───────────────────────────
  useEffect(() => {
    const ex = exerciceRef.current;
    if (!ex || phase === 'pret') return;

    // Termine = cercle revient à taille neutre
    if (phase === 'termine') {
      Animated.timing(echelle, {
        toValue: 1.0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      return;
    }

    // Inspiration et apnée → grand cercle, expiration → petit cercle
    const versGrande = phase === 'inspiration' || phase === 'apnee';

    // La durée de l'animation visuelle = durée de la phase en cours
    const dureeSec = phase === 'inspiration' ? ex.inspirationDuration
      : phase === 'apnee' ? ex.apneaDuration
      : ex.expirationDuration;

    // Lance l'animation (synchronisée avec le ticker 1 seconde)
    Animated.timing(echelle, {
      toValue: versGrande ? 1.4 : 0.6,
      duration: dureeSec * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [phase]);

  // ─── Ticker : s'exécute toutes les secondes pendant l'exercice ───────────
  const lancerTicker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const nouvelleValeur = compteurRef.current - 1;

      if (nouvelleValeur > 0) {
        // Décrémente le compteur
        mettreAJourCompteur(nouvelleValeur);
      } else {
        // Fin de la phase → transition vers la phase suivante
        const ex = exerciceRef.current!;
        const phaseActuelle = phaseRef.current;
        const cycle = cycleRef.current;

        if (phaseActuelle === 'inspiration') {
          if (ex.apneaDuration > 0) {
            // Il y a une phase d'apnée → on y passe
            mettreAJourPhase('apnee');
            mettreAJourCompteur(ex.apneaDuration);
          } else {
            // Pas d'apnée → directement à l'expiration
            mettreAJourPhase('expiration');
            mettreAJourCompteur(ex.expirationDuration);
          }
        } else if (phaseActuelle === 'apnee') {
          // Apnée terminée → expiration
          mettreAJourPhase('expiration');
          mettreAJourCompteur(ex.expirationDuration);

        } else if (phaseActuelle === 'expiration') {
          const prochainCycle = cycle + 1;

          if (prochainCycle >= ex.cycles) {
            // Tous les cycles sont faits → exercice terminé !
            mettreAJourPhase('termine');
            clearInterval(intervalRef.current!);

            // Enregistre la complétion en BD
            if (sessionIdRef.current) {
              terminerSession(sessionIdRef.current, 'completed').catch(console.error);
              sessionIdRef.current = null;
            }
          } else {
            // Passe au cycle suivant
            mettreAJourCycle(prochainCycle);
            mettreAJourPhase('inspiration');
            mettreAJourCompteur(ex.inspirationDuration);
          }
        }
      }
    }, 1000);
  };

  // ─── Démarrer l'exercice ──────────────────────────────────────────────────
  const commencer = async () => {
    const ex = exerciceRef.current;
    if (!ex) return;

    // Si l'utilisateur est connecté, crée une session en base de données
    // En cas d'erreur API : l'animation continue sans session (mode dégradé)
    if (estConnecte) {
      try {
        const session = await demarrerSession(ex.id);
        sessionIdRef.current = session.id;
      } catch (e) {
        console.error('Impossible de créer la session :', e);
      }
    }

    // Initialise l'état et lance l'animation
    mettreAJourCycle(0);
    mettreAJourPhase('inspiration');
    mettreAJourCompteur(ex.inspirationDuration);
    lancerTicker();
  };

  // ─── Arrêter l'exercice avant la fin ──────────────────────────────────────
  const arreter = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Marque la session comme abandonnée
    if (sessionIdRef.current) {
      try {
        await terminerSession(sessionIdRef.current, 'abandoned');
      } catch (e) {
        console.error('Erreur abandon session :', e);
      }
      sessionIdRef.current = null;
    }

    // Remet le cercle à sa taille neutre
    Animated.timing(echelle, {
      toValue: 0.7,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Réinitialise l'état
    mettreAJourPhase('pret');
    mettreAJourCompteur(0);
    mettreAJourCycle(0);
  };

  // ─── Recommencer après la fin ─────────────────────────────────────────────
  const recommencer = () => {
    sessionIdRef.current = null;
    Animated.timing(echelle, {
      toValue: 0.7,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    mettreAJourPhase('pret');
    mettreAJourCompteur(0);
    mettreAJourCycle(0);
  };

  // Couleur actuelle du cercle selon la phase
  const couleurActuelle = COULEURS_PHASES[phase];

  // ─── Affichage principal ──────────────────────────────────────────────────
  return (
    <ScrollView
      contentContainerStyle={styles.conteneur}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Informations de l'exercice ── */}
      {phase === 'pret' && (
        <View style={styles.infoExercice}>
          {exercice.description ? (
            <Text style={styles.description}>{exercice.description}</Text>
          ) : null}
          {/* Résumé des phases */}
          <View style={styles.resume}>
            <Text style={styles.resumeItem}>🌬️ {exercice.inspirationDuration}s inspirez</Text>
            {exercice.apneaDuration > 0 && (
              <Text style={styles.resumeItem}>⏸ {exercice.apneaDuration}s retenez</Text>
            )}
            <Text style={styles.resumeItem}>💨 {exercice.expirationDuration}s expirez</Text>
            <Text style={styles.resumeItem}>🔁 {exercice.cycles} cycles</Text>
          </View>
          {!estConnecte && (
            <Text style={styles.avertissement}>
              ℹ️ Connectez-vous pour enregistrer vos sessions.
            </Text>
          )}
        </View>
      )}

      {/* ── Cercle animé ── */}
      <View style={styles.conteneurCercle}>
        <Animated.View
          style={[
            styles.cercle,
            {
              backgroundColor: couleurActuelle,
              transform: [{ scale: echelle }],
            },
          ]}
        >
          {/* Texte à l'intérieur du cercle */}
          <Text style={styles.labelPhase}>{LABELS_PHASES[phase]}</Text>
          {/* Compteur (affiché seulement quand l'exercice est en cours) */}
          {compteur > 0 && (
            <Text style={styles.compteur}>{compteur}</Text>
          )}
        </Animated.View>
      </View>

      {/* ── Indicateur de cycle (visible seulement pendant l'exercice) ── */}
      {phase !== 'pret' && phase !== 'termine' && (
        <Text style={styles.indicateurCycle}>
          Cycle {cycleCourant + 1} / {exercice.cycles}
        </Text>
      )}

      {/* ── Boutons d'action ── */}
      <View style={styles.boutons}>
        {phase === 'pret' && (
          // Bouton "Commencer" → visible uniquement avant de démarrer
          <TouchableOpacity style={styles.bouton} onPress={commencer} activeOpacity={0.8}>
            <Text style={styles.texteBouton}>▶  Commencer l'exercice</Text>
          </TouchableOpacity>
        )}

        {(phase === 'inspiration' || phase === 'apnee' || phase === 'expiration') && (
          // Bouton "Arrêter" → visible pendant l'exercice
          <TouchableOpacity
            style={[styles.bouton, styles.boutonArreter]}
            onPress={arreter}
            activeOpacity={0.8}
          >
            <Text style={styles.texteBouton}>⏹  Arrêter l'exercice</Text>
          </TouchableOpacity>
        )}

        {phase === 'termine' && (
          // Boutons après la fin
          <>
            <Text style={styles.messageSucces}>
              🎉 Exercice complété !{estConnecte ? '\nSession enregistrée.' : ''}
            </Text>
            <TouchableOpacity style={styles.bouton} onPress={recommencer} activeOpacity={0.8}>
              <Text style={styles.texteBouton}>🔄  Recommencer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bouton, styles.boutonSecondaire]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.texteBoutonSecondaire}>← Retour à la liste</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flexGrow: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  // Infos avant démarrage
  infoExercice: {
    width: '100%',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  resume: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resumeItem: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  avertissement: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Cercle animé
  conteneurCercle: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  cercle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    // Ombre douce
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  labelPhase: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  compteur: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  // Compteur de cycles
  indicateurCycle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  // Boutons
  boutons: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  bouton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  boutonArreter: {
    backgroundColor: '#DC2626',
  },
  boutonSecondaire: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  texteBoutonSecondaire: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '600',
  },
  messageSucces: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
});

export default EcranAnimationExercice;
