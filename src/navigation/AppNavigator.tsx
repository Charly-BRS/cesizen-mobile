// src/navigation/AppNavigator.tsx
// Navigateur principal de l'application CESIZen.
//
// Fonctionnement :
//   1. Démarrage → écran de chargement (vérification du token JWT stocké)
//   2. Connecté  → NavigateurOnglets (4 onglets : Accueil, Articles, Exercices, Profil)
//   3. Non connecté → NavigateurAuth (Connexion + Inscription)
//
// La bascule entre les deux navigateurs est automatique :
// quand connecter() ou deconnecter() est appelé dans AuthContext,
// estConnecte change et React Navigation rebascule instantanément.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Importation des écrans d'authentification
import EcranConnexion from '../screens/auth/EcranConnexion';
import EcranInscription from '../screens/auth/EcranInscription';

// Importation du navigateur par onglets (utilisateurs connectés)
import NavigateurOnglets from './NavigateurOnglets';

// ─── Types des routes d'authentification ─────────────────────────────────────
// Exporté pour être utilisé dans EcranConnexion et EcranInscription
export type ParamListeRoutesAuth = {
  Connexion: undefined;
  Inscription: undefined;
};

// Création du navigateur Stack pour l'authentification
const StackAuth = createStackNavigator<ParamListeRoutesAuth>();

// ─── Navigateur pour les utilisateurs NON connectés ──────────────────────────
// Deux écrans sans header : Connexion et Inscription
const NavigateurAuth: React.FC = () => (
  <StackAuth.Navigator
    initialRouteName="Connexion"
    screenOptions={{ headerShown: false }}
  >
    <StackAuth.Screen name="Connexion" component={EcranConnexion} />
    <StackAuth.Screen name="Inscription" component={EcranInscription} />
  </StackAuth.Navigator>
);

// ─── Navigateur principal ─────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const { estConnecte, chargement } = useAuth();

  // Pendant la vérification du token au démarrage → écran de chargement
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Si connecté : affiche les 4 onglets, sinon : affiche login/register */}
      {estConnecte ? <NavigateurOnglets /> : <NavigateurAuth />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centrer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
});

export default AppNavigator;
