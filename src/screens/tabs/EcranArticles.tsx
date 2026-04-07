// src/screens/tabs/EcranArticles.tsx
// Liste des articles de bien-être publiés sur CESIZen.
// ⚠️ Contenu à implémenter en Phase 4.
// La structure avec les états chargement/erreur/données est déjà préparée.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EcranArticles: React.FC = () => {
  // Ces états seront activés en Phase 4 lors du vrai appel API :
  // const [chargement, setChargement] = useState<boolean>(false);
  // const [erreur, setErreur] = useState<string>('');
  // const [articles, setArticles] = useState<Article[]>([]);

  return (
    <View style={styles.conteneur}>
      <Text style={styles.icone}>📰</Text>
      <Text style={styles.titre}>Articles</Text>
      <Text style={styles.texte}>
        La liste des articles sera disponible en Phase 4.
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

export default EcranArticles;
