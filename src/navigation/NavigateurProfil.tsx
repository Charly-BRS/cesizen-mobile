// src/navigation/NavigateurProfil.tsx
// Navigateur Stack pour la section Profil.
// L'onglet "Profil" affiche EcranProfil, depuis lequel l'utilisateur
// peut naviguer vers les sous-écrans : modifier profil, changer mdp, historique,
// et (si admin) vers le panneau d'administration.

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import EcranProfil from '../screens/tabs/EcranProfil';
import EcranModifierProfil from '../screens/profil/EcranModifierProfil';
import EcranChangerMotDePasse from '../screens/profil/EcranChangerMotDePasse';
import EcranHistoriqueSessions from '../screens/profil/EcranHistoriqueSessions';
import EcranAdmin from '../screens/admin/EcranAdmin';

// Types des routes de ce navigateur Stack
// Exporté pour être utilisé dans les écrans enfants
export type ParamListeRoutesProfil = {
  VueProfil: undefined;
  ModifierProfil: undefined;
  ChangerMotDePasse: undefined;
  HistoriqueSessions: undefined;
  PanneauAdmin: undefined;
};

const Stack = createStackNavigator<ParamListeRoutesProfil>();

const NavigateurProfil: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#16A34A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen
        name="VueProfil"
        component={EcranProfil}
        options={{ title: 'Mon Profil' }}
      />
      <Stack.Screen
        name="ModifierProfil"
        component={EcranModifierProfil}
        options={{ title: 'Modifier le profil' }}
      />
      <Stack.Screen
        name="ChangerMotDePasse"
        component={EcranChangerMotDePasse}
        options={{ title: 'Changer le mot de passe' }}
      />
      <Stack.Screen
        name="HistoriqueSessions"
        component={EcranHistoriqueSessions}
        options={{ title: 'Historique des sessions' }}
      />
      <Stack.Screen
        name="PanneauAdmin"
        component={EcranAdmin}
        options={{ title: 'Administration' }}
      />
    </Stack.Navigator>
  );
};

export default NavigateurProfil;
