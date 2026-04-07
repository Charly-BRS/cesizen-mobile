// src/navigation/AppNavigator.tsx
// Navigateur principal de l'application CESIZen.
//
// Fonctionnement :
//   1. Pendant le démarrage : affiche un écran de chargement (vérification du token stocké)
//   2. Si connecté  → affiche les écrans de l'application (onglets en Phase 3)
//   3. Si non connecté → affiche les écrans d'authentification (Login + Register)
//
// La redirection est automatique : quand connecter() ou deconnecter() est appelé
// dans AuthContext, estConnecte change et React Navigation rebascule aussitôt.

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Importation des vrais écrans d'authentification
import EcranConnexion from '../screens/auth/EcranConnexion';
import EcranInscription from '../screens/auth/EcranInscription';

// ─── Types des paramètres de routes ──────────────────────────────────────────
// Exporté pour que les écrans puissent typer leur navigation correctement

// Routes accessibles sans être connecté
export type ParamListeRoutesAuth = {
  Connexion: undefined;   // undefined = pas de paramètres
  Inscription: undefined;
};

// Routes accessibles après connexion (sera étendu en Phase 3 avec les onglets)
type ParamListeRoutesConnecte = {
  Accueil: undefined;
};

// ─── Création des navigateurs Stack ──────────────────────────────────────────
const StackAuth = createStackNavigator<ParamListeRoutesAuth>();
const StackConnecte = createStackNavigator<ParamListeRoutesConnecte>();

// ─── Écran temporaire d'accueil (sera remplacé en Phase 3 par les onglets) ───
const EcranAccueilTemporaire: React.FC = () => (
  <View style={styles.centrer}>
    <Text style={styles.texteAccueil}>🌿 Bienvenue sur CESIZen</Text>
    <Text style={styles.sousTitreAccueil}>
      La navigation par onglets sera ajoutée en Phase 3
    </Text>
  </View>
);

// ─── Navigateur pour les utilisateurs NON connectés ──────────────────────────
// Regroupe les écrans Login et Register sans header (headerShown: false)
const NavigateurAuth: React.FC = () => (
  <StackAuth.Navigator
    initialRouteName="Connexion"
    screenOptions={{
      headerShown: false,  // Pas de barre de navigation dans les écrans auth
    }}
  >
    <StackAuth.Screen name="Connexion" component={EcranConnexion} />
    <StackAuth.Screen name="Inscription" component={EcranInscription} />
  </StackAuth.Navigator>
);

// ─── Navigateur pour les utilisateurs connectés ───────────────────────────────
// Sera enrichi en Phase 3 avec les onglets (tabs)
const NavigateurConnecte: React.FC = () => (
  <StackConnecte.Navigator
    screenOptions={{
      // Barre de navigation verte pour les écrans connectés
      headerStyle: { backgroundColor: '#16A34A' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <StackConnecte.Screen
      name="Accueil"
      component={EcranAccueilTemporaire}
      options={{ title: 'CESIZen' }}
    />
  </StackConnecte.Navigator>
);

// ─── Navigateur racine ────────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  // Récupère l'état d'authentification depuis le contexte global
  const { estConnecte, chargement } = useAuth();

  // Pendant la vérification du token stocké (au démarrage de l'app)
  // → affiche un écran de chargement pour éviter un flash d'écran
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    // NavigationContainer est le conteneur racine requis par React Navigation
    <NavigationContainer>
      {/* Affiche le bon navigateur selon l'état de connexion */}
      {estConnecte ? <NavigateurConnecte /> : <NavigateurAuth />}
    </NavigationContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Écran de chargement et accueil temporaire
  centrer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 24,
  },
  texteAccueil: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
    textAlign: 'center',
  },
  sousTitreAccueil: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AppNavigator;
