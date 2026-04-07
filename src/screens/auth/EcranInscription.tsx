// src/screens/auth/EcranInscription.tsx
// Écran d'inscription : formulaire prénom, nom, email, mot de passe + confirmation.
// Valide les champs côté client puis appelle l'API.
// Affiche un écran de succès avant de rediriger vers la connexion.

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
import type { StackNavigationProp } from '@react-navigation/stack';
import { sInscrire } from '../../services/authService';
import type { ParamListeRoutesAuth } from '../../navigation/AppNavigator';

// Type de navigation pour cet écran
type NavigationInscription = StackNavigationProp<ParamListeRoutesAuth, 'Inscription'>;

const EcranInscription: React.FC = () => {
  // Hook de navigation pour revenir vers la connexion
  const navigation = useNavigation<NavigationInscription>();

  // ─── États du formulaire ──────────────────────────────────────────────────
  const [prenom, setPrenom] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState<string>('');

  // ─── États de l'interface ─────────────────────────────────────────────────
  // chargement : true pendant l'appel API
  const [chargement, setChargement] = useState<boolean>(false);
  // erreur : chaîne vide = pas d'erreur, sinon message affiché en rouge
  const [erreur, setErreur] = useState<string>('');
  // succes : true quand l'inscription a réussi (affiche l'écran de confirmation)
  const [succes, setSucces] = useState<boolean>(false);

  // ─── Validation des champs ────────────────────────────────────────────────
  // Retourne un message d'erreur si les données sont invalides, sinon null
  const validerFormulaire = (): string | null => {
    if (!prenom.trim() || !nom.trim() || !email.trim() || !motDePasse.trim()) {
      return 'Veuillez remplir tous les champs.';
    }
    if (motDePasse.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (motDePasse !== confirmationMotDePasse) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null; // Tout est valide
  };

  // ─── Gestion de la soumission ─────────────────────────────────────────────
  const gererInscription = async () => {
    // Validation côté client avant d'appeler l'API
    const messageErreur = validerFormulaire();
    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }

    setChargement(true);
    setErreur(''); // Réinitialise l'erreur précédente

    try {
      // Appel au service d'inscription
      await sInscrire({
        email: email.trim(),
        password: motDePasse,
        prenom: prenom.trim(),
        nom: nom.trim(),
      });

      // Inscription réussie → affiche l'écran de confirmation
      setSucces(true);

    } catch (err: any) {
      // Affiche un message adapté selon le code d'erreur HTTP
      if (err.response?.status === 422 || err.response?.status === 400) {
        setErreur('Cet email est déjà utilisé ou les données sont invalides.');
      } else if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Inscription impossible. Vérifiez votre réseau.');
      }
    } finally {
      setChargement(false);
    }
  };

  // ─── Écran de succès (affiché après une inscription réussie) ─────────────
  if (succes) {
    return (
      <View style={styles.conteneurSucces}>
        <Text style={styles.iconSucces}>✅</Text>
        <Text style={styles.titreSucces}>Compte créé !</Text>
        <Text style={styles.texteSucces}>
          Votre compte a bien été créé.{'\n'}
          Vous pouvez maintenant vous connecter avec vos identifiants.
        </Text>
        <TouchableOpacity
          style={styles.bouton}
          onPress={() => navigation.navigate('Connexion')}
          activeOpacity={0.8}
        >
          <Text style={styles.texteBouton}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Rendu principal (formulaire d'inscription) ───────────────────────────
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
        {/* ── En-tête ── */}
        <View style={styles.entete}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.titre}>Créer un compte</Text>
          <Text style={styles.sousTitre}>Rejoignez CESIZen</Text>
        </View>

        {/* ── Carte formulaire ── */}
        <View style={styles.carte}>

          {/* Prénom et Nom sur la même ligne */}
          <View style={styles.rangee}>
            <View style={styles.moitie}>
              <Text style={styles.etiquette}>Prénom</Text>
              <TextInput
                style={styles.champTexte}
                placeholder="Jean"
                placeholderTextColor="#9CA3AF"
                value={prenom}
                onChangeText={setPrenom}
                autoCapitalize="words"
                editable={!chargement}
              />
            </View>
            <View style={styles.moitie}>
              <Text style={styles.etiquette}>Nom</Text>
              <TextInput
                style={styles.champTexte}
                placeholder="Dupont"
                placeholderTextColor="#9CA3AF"
                value={nom}
                onChangeText={setNom}
                autoCapitalize="words"
                editable={!chargement}
              />
            </View>
          </View>

          {/* Email */}
          <Text style={styles.etiquette}>Email</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!chargement}
          />

          {/* Mot de passe */}
          <Text style={styles.etiquette}>Mot de passe</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="Au moins 6 caractères"
            placeholderTextColor="#9CA3AF"
            value={motDePasse}
            onChangeText={setMotDePasse}
            secureTextEntry
            editable={!chargement}
          />

          {/* Confirmation du mot de passe */}
          <Text style={styles.etiquette}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="Répétez votre mot de passe"
            placeholderTextColor="#9CA3AF"
            value={confirmationMotDePasse}
            onChangeText={setConfirmationMotDePasse}
            secureTextEntry
            editable={!chargement}
          />

          {/* Message d'erreur */}
          {erreur !== '' && (
            <View style={styles.boiteErreur}>
              <Text style={styles.messageErreur}>⚠️ {erreur}</Text>
            </View>
          )}

          {/* Bouton d'inscription */}
          <TouchableOpacity
            style={[styles.bouton, chargement && styles.boutonDesactive]}
            onPress={gererInscription}
            disabled={chargement}
            activeOpacity={0.8}
          >
            {chargement ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.texteBouton}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          {/* Lien retour vers la connexion */}
          <TouchableOpacity
            style={styles.lienSecondaire}
            onPress={() => navigation.navigate('Connexion')}
            disabled={chargement}
          >
            <Text style={styles.texteSecondaire}>
              Déjà un compte ?{' '}
              <Text style={styles.texteAccent}>Se connecter</Text>
            </Text>
          </TouchableOpacity>

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
    justifyContent: 'center',
    padding: 24,
  },
  entete: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 52,
    marginBottom: 8,
  },
  titre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  sousTitre: {
    fontSize: 15,
    color: '#4B5563',
  },
  carte: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  // Rangée pour prénom + nom côte à côte
  rangee: {
    flexDirection: 'row',
    gap: 12,
  },
  moitie: {
    flex: 1,
  },
  etiquette: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
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
  boiteErreur: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
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
  lienSecondaire: {
    marginTop: 18,
    alignItems: 'center',
  },
  texteSecondaire: {
    fontSize: 14,
    color: '#6B7280',
  },
  texteAccent: {
    color: '#16A34A',
    fontWeight: '600',
  },
  // ── Styles de l'écran de succès ──
  conteneurSucces: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconSucces: {
    fontSize: 72,
    marginBottom: 20,
  },
  titreSucces: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
    textAlign: 'center',
  },
  texteSucces: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
});

export default EcranInscription;
