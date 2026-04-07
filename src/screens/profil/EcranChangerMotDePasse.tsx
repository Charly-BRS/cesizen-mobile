// src/screens/profil/EcranChangerMotDePasse.tsx
// Formulaire de changement de mot de passe.
// Vérifie que les deux nouveaux mots de passe correspondent avant d'appeler l'API.
// L'API vérifie côté serveur que l'ancien mot de passe est correct.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { changerMotDePasse } from '../../services/authService';

const EcranChangerMotDePasse: React.FC = () => {
  const navigation = useNavigation();

  // ─── États du formulaire ──────────────────────────────────────────────────
  const [ancienMotDePasse, setAncienMotDePasse] = useState<string>('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState<string>('');
  const [confirmation, setConfirmation] = useState<string>('');

  // ─── États de l'interface ─────────────────────────────────────────────────
  const [chargement, setChargement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string>('');
  const [succes, setSucces] = useState<boolean>(false);

  const gererChangement = async () => {
    setErreur('');
    setSucces(false);

    // Validation côté client
    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmation) {
      setErreur('Veuillez remplir tous les champs.');
      return;
    }
    if (nouveauMotDePasse.length < 8) {
      setErreur('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      setErreur('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);

    try {
      // Appel API : POST /auth/change-password
      await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse);

      setSucces(true);
      // Vide les champs après succès
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmation('');
    } catch (err: any) {
      // L'API renvoie un message précis si l'ancien mot de passe est incorrect
      const messageApi = err.response?.data?.message;
      if (messageApi) {
        setErreur(messageApi);
      } else if (err.response?.status === 401) {
        setErreur('Session expirée. Veuillez vous reconnecter.');
      } else if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Impossible de changer le mot de passe. Réessayez.');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.conteneur}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carte}>

          {/* Mot de passe actuel */}
          <Text style={styles.etiquette}>Mot de passe actuel</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={ancienMotDePasse}
            onChangeText={setAncienMotDePasse}
            secureTextEntry
            editable={!chargement}
          />

          {/* Nouveau mot de passe */}
          <Text style={styles.etiquette}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="8 caractères minimum"
            placeholderTextColor="#9CA3AF"
            value={nouveauMotDePasse}
            onChangeText={setNouveauMotDePasse}
            secureTextEntry
            editable={!chargement}
          />

          {/* Confirmation */}
          <Text style={styles.etiquette}>Confirmer le nouveau mot de passe</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="Répétez le nouveau mot de passe"
            placeholderTextColor="#9CA3AF"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            editable={!chargement}
          />

          {/* Message de succès */}
          {succes && (
            <View style={styles.boiteSucces}>
              <Text style={styles.messageSucces}>✅ Mot de passe modifié avec succès !</Text>
            </View>
          )}

          {/* Message d'erreur */}
          {erreur !== '' && (
            <View style={styles.boiteErreur}>
              <Text style={styles.messageErreur}>⚠️ {erreur}</Text>
            </View>
          )}

          {/* Bouton changer */}
          <TouchableOpacity
            style={[styles.bouton, chargement && styles.boutonDesactive]}
            onPress={gererChangement}
            disabled={chargement}
            activeOpacity={0.8}
          >
            {chargement ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.texteBouton}>Changer le mot de passe</Text>
            )}
          </TouchableOpacity>

          {/* Bouton retour après succès */}
          {succes && (
            <TouchableOpacity
              style={styles.boutonSecondaire}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.texteBoutonSecondaire}>← Retour au profil</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  carte: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  etiquette: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
  },
  champTexte: {
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  boiteSucces: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  messageSucces: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  boiteErreur: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  messageErreur: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  bouton: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  boutonDesactive: {
    backgroundColor: '#86EFAC',
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonSecondaire: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 10,
  },
  texteBoutonSecondaire: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EcranChangerMotDePasse;
