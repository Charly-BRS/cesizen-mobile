// src/screens/profil/EcranModifierProfil.tsx
// Formulaire de modification du prénom et du nom de l'utilisateur connecté.
// Pré-remplit les champs avec les valeurs actuelles.
// Après succès : met à jour le contexte global et affiche un message de confirmation.

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
import { useAuth } from '../../context/AuthContext';
import { modifierProfil } from '../../services/profilService';

const EcranModifierProfil: React.FC = () => {
  const navigation = useNavigation();
  const { utilisateur, mettreAJourUtilisateur } = useAuth();

  // ─── États du formulaire (pré-remplis avec les valeurs actuelles) ──────────
  const [prenom, setPrenom] = useState<string>(utilisateur?.prenom ?? '');
  const [nom, setNom] = useState<string>(utilisateur?.nom ?? '');

  // ─── États de l'interface ─────────────────────────────────────────────────
  const [chargement, setChargement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string>('');
  const [succes, setSucces] = useState<boolean>(false);

  const gererSauvegarde = async () => {
    if (!prenom.trim() || !nom.trim()) {
      setErreur('Le prénom et le nom ne peuvent pas être vides.');
      return;
    }
    if (!utilisateur) return;

    setChargement(true);
    setErreur('');
    setSucces(false);

    try {
      // Appel API : PATCH /users/{id}
      await modifierProfil(utilisateur.id, {
        prenom: prenom.trim(),
        nom: nom.trim(),
      });

      // Met à jour les données dans AuthContext ET dans SecureStore
      // → le header de l'app reflétera immédiatement les nouveaux prénom/nom
      await mettreAJourUtilisateur({ prenom: prenom.trim(), nom: nom.trim() });

      setSucces(true);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErreur('Session expirée. Veuillez vous reconnecter.');
      } else if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Impossible de mettre à jour le profil. Réessayez.');
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

          {/* Champ Prénom */}
          <Text style={styles.etiquette}>Prénom</Text>
          <TextInput
            style={styles.champTexte}
            value={prenom}
            onChangeText={setPrenom}
            autoCapitalize="words"
            editable={!chargement}
          />

          {/* Champ Nom */}
          <Text style={styles.etiquette}>Nom</Text>
          <TextInput
            style={styles.champTexte}
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
            editable={!chargement}
          />

          {/* Email (lecture seule, non modifiable) */}
          <Text style={styles.etiquette}>
            Email{' '}
            <Text style={styles.etiquetteLecture}>(non modifiable)</Text>
          </Text>
          <TextInput
            style={[styles.champTexte, styles.champLecture]}
            value={utilisateur?.email ?? ''}
            editable={false}
          />

          {/* Message de succès */}
          {succes && (
            <View style={styles.boiteSucces}>
              <Text style={styles.messageSucces}>✅ Profil mis à jour avec succès !</Text>
            </View>
          )}

          {/* Message d'erreur */}
          {erreur !== '' && (
            <View style={styles.boiteErreur}>
              <Text style={styles.messageErreur}>⚠️ {erreur}</Text>
            </View>
          )}

          {/* Bouton sauvegarder */}
          <TouchableOpacity
            style={[styles.bouton, chargement && styles.boutonDesactive]}
            onPress={gererSauvegarde}
            disabled={chargement}
            activeOpacity={0.8}
          >
            {chargement ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.texteBouton}>Sauvegarder</Text>
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
  etiquetteLecture: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontSize: 13,
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
  champLecture: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
    borderColor: '#E5E7EB',
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

export default EcranModifierProfil;
