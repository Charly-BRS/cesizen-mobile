// App.tsx
// Point d'entrée de l'application CESIZen Mobile.
// Configure les fournisseurs globaux et lance le navigateur principal.

import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // AuthProvider rend le contexte d'authentification disponible dans toute l'app
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
