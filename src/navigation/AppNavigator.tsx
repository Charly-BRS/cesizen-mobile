// src/navigation/AppNavigator.tsx
// Navigateur principal de l'application CESIZen.
// Affiche un écran de chargement pendant la vérification du token,
// puis redirige vers l'écran approprié selon l'état d'authentification.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Écran d'accueil temporaire (sera remplacé en Phase 2)
const EcranAccueil = () => (
  <View style={styles.centrer}>
    {/* Contenu de l'écran d'accueil - Phase 2 */}
  </View>
);

// Écran de connexion temporaire (sera remplacé en Phase 2)
const EcranConnexion = () => (
  <View style={styles.centrer}>
    {/* Formulaire de connexion - Phase 2 */}
  </View>
);

// Définition des types de routes pour TypeScript
type ParamListeRoutes = {
  Accueil: undefined;
  Connexion: undefined;
};

// Création du navigateur Stack
const Stack = createStackNavigator<ParamListeRoutes>();

// Navigateur principal de l'application
const AppNavigator: React.FC = () => {
  const { estConnecte, chargement } = useAuth();

  // Affiche un indicateur de chargement pendant la vérification du token
  if (chargement) {
    return (
      <View style={styles.centrer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Affiche l'écran d'accueil si connecté, sinon la connexion
        initialRouteName={estConnecte ? 'Accueil' : 'Connexion'}
        screenOptions={{
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {estConnecte ? (
          // Écrans accessibles uniquement après connexion
          <Stack.Screen
            name="Accueil"
            component={EcranAccueil}
            options={{ title: 'CESIZen' }}
          />
        ) : (
          // Écran de connexion (non authentifié)
          <Stack.Screen
            name="Connexion"
            component={EcranConnexion}
            options={{ title: 'Connexion', headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centrer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default AppNavigator;
