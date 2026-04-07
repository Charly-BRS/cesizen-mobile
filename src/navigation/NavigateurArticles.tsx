// src/navigation/NavigateurArticles.tsx
// Navigateur Stack pour la section Articles.
// Permet d'aller de la liste → vers le détail d'un article,
// avec une flèche "retour" automatique dans le header.
//
// Ce navigateur est utilisé comme composant de l'onglet "Articles"
// dans NavigateurOnglets. Le header de cet onglet est désactivé
// pour laisser ce Stack gérer son propre header.

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import EcranArticles from '../screens/tabs/EcranArticles';
import EcranDetailArticle from '../screens/articles/EcranDetailArticle';

// Types des routes disponibles dans ce navigateur Stack
// Exporté pour être utilisé dans EcranArticles et EcranDetailArticle
export type ParamListeRoutesArticles = {
  ListeArticles: undefined;                // Pas de paramètres pour la liste
  DetailArticle: { idArticle: number };    // L'id de l'article à afficher
};

// Création du navigateur Stack
const Stack = createStackNavigator<ParamListeRoutesArticles>();

const NavigateurArticles: React.FC = () => {
  return (
    <Stack.Navigator
      // Style du header commun aux deux écrans
      screenOptions={{
        headerStyle: { backgroundColor: '#16A34A' },
        headerTintColor: '#FFFFFF',         // Couleur du titre et de la flèche retour
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Retour',          // Texte de la flèche retour (iOS)
      }}
    >
      {/* Écran 1 : liste des articles */}
      <Stack.Screen
        name="ListeArticles"
        component={EcranArticles}
        options={{ title: 'Articles' }}
      />

      {/* Écran 2 : détail d'un article (le titre sera mis à jour dynamiquement) */}
      <Stack.Screen
        name="DetailArticle"
        component={EcranDetailArticle}
        options={{ title: 'Article' }}
      />
    </Stack.Navigator>
  );
};

export default NavigateurArticles;
