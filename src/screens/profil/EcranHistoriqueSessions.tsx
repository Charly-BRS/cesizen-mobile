// src/screens/profil/EcranHistoriqueSessions.tsx
// Historique des sessions d'exercices de respiration de l'utilisateur connecté.
// Affiche la liste des sessions avec : exercice, date, durée et statut.
// En haut : stats rapides (total + complétées).

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getMesSessions, type UserSession } from '../../services/exerciseService';
import type { ParamListeRoutesProfil } from '../../navigation/NavigateurProfil';

type NavigationHistorique = StackNavigationProp<ParamListeRoutesProfil, 'HistoriqueSessions'>;

// ─── Configuration des statuts ────────────────────────────────────────────────
// Définit l'affichage (label + couleurs) pour chaque statut de session possible
const STATUTS: Record<string, { label: string; couleurFond: string; couleurTexte: string }> = {
  completed: {
    label: '✅ Complétée',
    couleurFond: '#F0FDF4',
    couleurTexte: '#166534',
  },
  abandoned: {
    label: '⛔ Abandonnée',
    couleurFond: '#FEF2F2',
    couleurTexte: '#DC2626',
  },
  started: {
    label: '🔄 En cours',
    couleurFond: '#EFF6FF',
    couleurTexte: '#1D4ED8',
  },
};

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

// Formate une date ISO en : "15 janvier 2024 à 14h30"
const formaterDateHeure = (dateIso: string): string => {
  const date = new Date(dateIso);
  const partieDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const partieHeure = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${partieDate} à ${partieHeure}`;
};

// Calcule et formate la durée d'une session (endedAt - startedAt)
// Retourne une chaîne vide si la session n'est pas encore terminée
const formaterDureeSession = (startedAt: string, endedAt: string | null): string => {
  if (!endedAt) return '';
  const dureeSecondes = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
  );
  if (dureeSecondes < 60) return `${dureeSecondes}s`;
  const minutes = Math.floor(dureeSecondes / 60);
  const secondes = dureeSecondes % 60;
  return secondes > 0 ? `${minutes}min ${secondes}s` : `${minutes}min`;
};

// ─── Composant carte de session ───────────────────────────────────────────────
const CarteSession: React.FC<{ session: UserSession }> = ({ session }) => {
  const statut = STATUTS[session.status] ?? STATUTS.started;
  const duree = formaterDureeSession(session.startedAt, session.endedAt);

  return (
    <View style={styles.carte}>
      {/* Nom de l'exercice */}
      <Text style={styles.nomExercice}>{session.breathingExercise.nom}</Text>

      {/* Date et durée */}
      <Text style={styles.dateHeure}>
        {formaterDateHeure(session.startedAt)}
        {duree ? `  ·  ${duree}` : ''}
      </Text>

      {/* Badge de statut */}
      <View style={[styles.badge, { backgroundColor: statut.couleurFond }]}>
        <Text style={[styles.texteBadge, { color: statut.couleurTexte }]}>
          {statut.label}
        </Text>
      </View>
    </View>
  );
};

// ─── Écran principal ──────────────────────────────────────────────────────────
const EcranHistoriqueSessions: React.FC = () => {
  const navigation = useNavigation<NavigationHistorique>();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [rafraichissement, setRafraichissement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string>('');

  const chargerSessions = async (estRafraichissement = false) => {
    if (estRafraichissement) {
      setRafraichissement(true);
    } else {
      setChargement(true);
    }
    setErreur('');

    try {
      const donnees = await getMesSessions();
      // Tri par date décroissante : sessions les plus récentes en premier
      donnees.sort((a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      setSessions(donnees);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Impossible de charger l\'historique. Réessayez.');
      }
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  useEffect(() => {
    chargerSessions();
  }, []);

  // Nombre de sessions complétées (pour les stats)
  const nombreCompletees = sessions.filter((s) => s.status === 'completed').length;

  // ── Chargement ──
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.texteChargement}>Chargement de l'historique…</Text>
      </View>
    );
  }

  // ── Erreur ──
  if (erreur !== '') {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeEtat}>⚠️</Text>
        <Text style={styles.texteErreur}>{erreur}</Text>
        <TouchableOpacity style={styles.bouton} onPress={() => chargerSessions()}>
          <Text style={styles.texteBouton}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Aucune session ──
  if (sessions.length === 0) {
    return (
      <View style={styles.centrer}>
        <Text style={styles.iconeEtat}>🌬️</Text>
        <Text style={styles.texteVide}>Aucune session pour le moment.</Text>
        <Text style={styles.sousTitreVide}>Lancez votre premier exercice de respiration !</Text>
        <TouchableOpacity
          style={[styles.bouton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.texteBouton}>Voir les exercices</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Liste des sessions ──
  return (
    <FlatList
      style={styles.liste}
      data={sessions}
      keyExtractor={(session) => session.id.toString()}
      // En-tête avec statistiques
      ListHeaderComponent={
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNombre}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions totales</Text>
          </View>
          <View style={styles.separateurStat} />
          <View style={styles.statItem}>
            <Text style={[styles.statNombre, styles.statNombreVert]}>{nombreCompletees}</Text>
            <Text style={styles.statLabel}>Complétées</Text>
          </View>
        </View>
      }
      renderItem={({ item: session }) => (
        <CarteSession session={session} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={rafraichissement}
          onRefresh={() => chargerSessions(true)}
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
    paddingBottom: 32,
  },
  // Stats en haut de liste
  stats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  separateurStat: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNombre: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
  },
  statNombreVert: {
    color: '#16A34A',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Carte de session
  carte: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nomExercice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dateHeure: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  texteBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  // États (chargement / erreur / vide)
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
  iconeEtat: {
    fontSize: 52,
    marginBottom: 12,
  },
  texteErreur: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  texteVide: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  sousTitreVide: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bouton: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  texteBouton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default EcranHistoriqueSessions;
