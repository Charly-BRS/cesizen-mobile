// src/screens/tabs/EcranExercices.tsx
// Liste des exercices de respiration disponibles sur CESIZen.
// ⚠️ Contenu à implémenter en Phase 5 (liste + animation de respiration).
// La structure avec les états chargement/erreur/données est déjà préparée.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EcranExercices: React.FC = () => {
  // Ces états seront activés en Phase 5 lors du vrai appel API :
  // const [chargement, setChargement] = useState<boolean>(false);
  // const [erreur, setErreur] = useState<string>('');
  // const [exercices, setExercices] = useState<Exercice[]>([]);

  return (
    <View style={styles.conteneur}>
      <Text style={styles.icone}>🌬️</Text>
      <Text style={styles.titre}>Exercices de respiration</Text>
      <Text style={styles.texte}>
        La liste des exercices et l'animation de respiration seront disponibles en Phase 5.
      </Text>
      <View style={styles.badge}>
        <Text style={styles.texteBadge}>🚧 À venir</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icone: {
    fontSize: 72,
    marginBottom: 16,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 10,
    textAlign: 'center',
  },
  texte: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#FEF9C3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  texteBadge: {
    fontSize: 13,
    color: '#854D0E',
    fontWeight: '600',
  },
});

export default EcranExercices;
