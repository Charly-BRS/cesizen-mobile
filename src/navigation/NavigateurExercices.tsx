// src/navigation/NavigateurExercices.tsx
// Navigateur Stack pour la section Exercices.
// Gère la navigation : liste des exercices → écran d'animation.
// Même structure que NavigateurArticles.

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import EcranExercices from '../screens/tabs/EcranExercices';
import EcranAnimationExercice from '../screens/exercises/EcranAnimationExercice';
import type { BreathingExercise } from '../services/exerciseService';

// Types des routes disponibles dans ce navigateur Stack
// Exporté pour être utilisé dans les deux écrans
export type ParamListeRoutesExercices = {
  ListeExercices: undefined;
  // On passe l'objet exercice complet (déjà chargé par la liste) plutôt que l'id seul.
  // Cela évite une deuxième requête API dans l'écran d'animation.
  AnimationExercice: { exercice: BreathingExercise };
};

const Stack = createStackNavigator<ParamListeRoutesExercices>();

const NavigateurExercices: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#16A34A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Retour',
      }}
    >
      {/* Écran 1 : liste des exercices */}
      <Stack.Screen
        name="ListeExercices"
        component={EcranExercices}
        options={{ title: 'Exercices' }}
      />

      {/* Écran 2 : animation de respiration (titre mis à jour dynamiquement) */}
      <Stack.Screen
        name="AnimationExercice"
        component={EcranAnimationExercice}
        options={{ title: 'Exercice' }}
      />
    </Stack.Navigator>
  );
};

export default NavigateurExercices;
