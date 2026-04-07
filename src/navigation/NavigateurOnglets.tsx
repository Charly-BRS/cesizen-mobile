// src/navigation/NavigateurOnglets.tsx
// Barre de navigation du bas avec 4 onglets : Accueil, Articles, Exercices, Profil.
// Chaque onglet est un écran principal de l'application.
// Les icônes changent selon l'onglet actif (plein) ou inactif (contour).

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importation des 4 écrans principaux
import EcranAccueil from '../screens/tabs/EcranAccueil';
import EcranArticles from '../screens/tabs/EcranArticles';
import EcranExercices from '../screens/tabs/EcranExercices';
import EcranProfil from '../screens/tabs/EcranProfil';

// Type des routes disponibles dans les onglets (undefined = pas de paramètres)
// Exporté pour que les écrans puissent typer leur navigation
export type ParamListeOnglets = {
  Accueil: undefined;
  Articles: undefined;
  Exercices: undefined;
  Profil: undefined;
};

// Création du navigateur par onglets
const Tab = createBottomTabNavigator<ParamListeOnglets>();

const NavigateurOnglets: React.FC = () => {
  return (
    <Tab.Navigator
      // Options communes à tous les onglets
      screenOptions={({ route }) => ({
        // Définit l'icône de chaque onglet selon son nom et son état actif/inactif
        tabBarIcon: ({ focused, color, size }) => {
          // Nom de l'icône Ionicons à afficher (plein si actif, contour sinon)
          let nomIcone: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Accueil') {
            nomIcone = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Articles') {
            nomIcone = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Exercices') {
            nomIcone = focused ? 'leaf' : 'leaf-outline';
          } else {
            // Profil
            nomIcone = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={nomIcone} size={size} color={color} />;
        },

        // Couleur de l'onglet actif (vert) et inactif (gris)
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#9CA3AF',

        // Style de la barre du bas
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },

        // Style du header (barre du haut)
        headerStyle: { backgroundColor: '#16A34A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      })}
    >
      {/* Onglet 1 : Accueil / Dashboard */}
      <Tab.Screen
        name="Accueil"
        component={EcranAccueil}
        options={{ title: 'CESIZen', tabBarLabel: 'Accueil' }}
      />

      {/* Onglet 2 : Liste des articles */}
      <Tab.Screen
        name="Articles"
        component={EcranArticles}
        options={{ title: 'Articles', tabBarLabel: 'Articles' }}
      />

      {/* Onglet 3 : Exercices de respiration */}
      <Tab.Screen
        name="Exercices"
        component={EcranExercices}
        options={{ title: 'Exercices', tabBarLabel: 'Exercices' }}
      />

      {/* Onglet 4 : Profil utilisateur */}
      <Tab.Screen
        name="Profil"
        component={EcranProfil}
        options={{ title: 'Mon Profil', tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default NavigateurOnglets;
