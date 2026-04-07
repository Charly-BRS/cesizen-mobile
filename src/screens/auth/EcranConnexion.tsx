// src/screens/auth/EcranConnexion.tsx
// Écran de connexion : formulaire avec email et mot de passe.
// Appelle l'API de login, décode le JWT et stocke la session si réussi.
// Affiche les erreurs clairement et désactive le formulaire pendant le chargement.

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
import { useAuth } from '../../context/AuthContext';
import { seConnecter } from '../../services/authService';
import type { ParamListeRoutesAuth } from '../../navigation/AppNavigator';

// Type de navigation pour cet écran (permet d'accéder à navigation.navigate)
type NavigationConnexion = StackNavigationProp<ParamListeRoutesAuth, 'Connexion'>;

const EcranConnexion: React.FC = () => {
  // Hook de navigation pour aller vers l'écran d'inscription
  const navigation = useNavigation<NavigationConnexion>();

  // Accès au contexte d'authentification global (pour appeler connecter())
  const { connecter } = useAuth();

  // ─── États du formulaire ──────────────────────────────────────────────────
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');

  // ─── États de l'interface ─────────────────────────────────────────────────
  // chargement : true pendant l'appel API → désactive le bouton et les champs
  const [chargement, setChargement] = useState<boolean>(false);
  // erreur : chaîne vide = pas d'erreur, sinon message affiché en rouge
  const [erreur, setErreur] = useState<string>('');

  // ─── Gestion de la soumission ─────────────────────────────────────────────
  const gererConnexion = async () => {
    // Validation basique : vérifie que les champs ne sont pas vides
    if (!email.trim() || !motDePasse.trim()) {
      setErreur('Veuillez remplir tous les champs.');
      return;
    }

    setChargement(true);
    setErreur(''); // Réinitialise l'erreur précédente

    try {
      // Appel au service d'authentification
      const { token, utilisateur } = await seConnecter({
        email: email.trim(),
        password: motDePasse,
      });

      // Sauvegarde le token + utilisateur dans SecureStore ET dans le contexte global
      // → AppNavigator détecte le changement d'état et affiche automatiquement l'accueil
      await connecter(utilisateur, token);

    } catch (err: any) {
      // Affiche un message d'erreur adapté au code HTTP reçu
      if (err.response?.status === 401) {
        setErreur('Email ou mot de passe incorrect.');
      } else if (err.response?.status === 422) {
        setErreur('Format d\'email invalide.');
      } else if (err.code === 'ECONNABORTED') {
        setErreur('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setErreur('Connexion impossible. Vérifiez votre réseau.');
      }
    } finally {
      // Réactive le formulaire dans tous les cas (succès ou erreur)
      setChargement(false);
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    // KeyboardAvoidingView pousse le contenu vers le haut quand le clavier s'ouvre
    <KeyboardAvoidingView
      style={styles.conteneur}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── En-tête avec logo et titre ── */}
        <View style={styles.entete}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.titre}>CESIZen</Text>
          <Text style={styles.sousTitre}>Connectez-vous à votre compte</Text>
        </View>

        {/* ── Carte formulaire ── */}
        <View style={styles.carte}>

          {/* Champ email */}
          <Text style={styles.etiquette}>Email</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"  // Empêche la majuscule automatique sur l'email
            autoCorrect={false}
            editable={!chargement}  // Désactivé pendant le chargement
          />

          {/* Champ mot de passe */}
          <Text style={styles.etiquette}>Mot de passe</Text>
          <TextInput
            style={styles.champTexte}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={motDePasse}
            onChangeText={setMotDePasse}
            secureTextEntry  // Masque le texte (points)
            editable={!chargement}
          />

          {/* Message d'erreur (visible uniquement si erreur !== '') */}
          {erreur !== '' && (
            <View style={styles.boiteErreur}>
              <Text style={styles.messageErreur}>⚠️ {erreur}</Text>
            </View>
          )}

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.bouton, chargement && styles.boutonDesactive]}
            onPress={gererConnexion}
            disabled={chargement}
            activeOpacity={0.8}
          >
            {chargement ? (
              // Indicateur de chargement pendant l'appel API
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.texteBouton}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Lien vers l'écran d'inscription */}
          <TouchableOpacity
            style={styles.lienSecondaire}
            onPress={() => navigation.navigate('Inscription')}
            disabled={chargement}
          >
            <Text style={styles.texteSecondaire}>
              Pas encore de compte ?{' '}
              <Text style={styles.texteAccent}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Conteneur principal (fond vert très clair)
  conteneur: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  // ScrollView centré verticalement
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  // Zone logo + titre au-dessus du formulaire
  entete: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    fontSize: 60,
    marginBottom: 8,
  },
  titre: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 6,
  },
  sousTitre: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Carte blanche avec ombre
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
  // Étiquette au-dessus d'un champ
  etiquette: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  // Champ de saisie
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
  // Zone d'erreur rouge pâle
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
  // Bouton principal vert
  bouton: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  // Bouton grisé quand désactivé
  boutonDesactive: {
    backgroundColor: '#86EFAC',
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Lien secondaire (inscription)
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
});

export default EcranConnexion;
