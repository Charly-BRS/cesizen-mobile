// src/screens/tabs/EcranProfil.tsx
// Écran de profil : affiche les informations de l'utilisateur connecté
// et propose un bouton de déconnexion.
// La modification du profil et le changement de mot de passe seront en Phase 6.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const EcranProfil: React.FC = () => {
  // Récupère les infos utilisateur et la fonction de déconnexion depuis le contexte
  const { utilisateur, deconnecter } = useAuth();

  // État de chargement pendant la déconnexion
  const [deconnexionEnCours, setDeconnexionEnCours] = useState<boolean>(false);

  // Gère la déconnexion avec une confirmation préalable
  const gererDeconnexion = () => {
    // Affiche une boîte de dialogue de confirmation avant de déconnecter
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            setDeconnexionEnCours(true);
            try {
              // Supprime le token du SecureStore et réinitialise le contexte
              // → AppNavigator détecte estConnecte = false et affiche l'écran de connexion
              await deconnecter();
            } catch (erreur) {
              console.error('Erreur lors de la déconnexion :', erreur);
            } finally {
              setDeconnexionEnCours(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.conteneur} showsVerticalScrollIndicator={false}>

      {/* ── Entête avec avatar et nom ── */}
      <View style={styles.entete}>
        {/* Avatar avec les initiales de l'utilisateur */}
        <View style={styles.avatar}>
          <Text style={styles.initiales}>
            {utilisateur?.prenom?.charAt(0).toUpperCase()}
            {utilisateur?.nom?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nomComplet}>
          {utilisateur?.prenom} {utilisateur?.nom}
        </Text>
        <Text style={styles.email}>{utilisateur?.email}</Text>
      </View>

      {/* ── Informations du compte ── */}
      <View style={styles.section}>
        <Text style={styles.titreSectionn}>Informations</Text>

        {/* Ligne prénom */}
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Prénom</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.prenom}</Text>
        </View>

        {/* Ligne nom */}
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Nom</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.nom}</Text>
        </View>

        {/* Ligne email */}
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Email</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.email}</Text>
        </View>

        {/* Ligne rôle */}
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Rôle</Text>
          <Text style={styles.valeurInfo}>
            {utilisateur?.roles?.includes('ROLE_ADMIN') ? '👑 Administrateur' : '👤 Utilisateur'}
          </Text>
        </View>
      </View>

      {/* ── Actions (à compléter en Phase 6) ── */}
      <View style={styles.section}>
        <Text style={styles.titreSectionn}>Actions</Text>

        {/* Bouton modifier le profil (Phase 6) */}
        <TouchableOpacity style={styles.boutonSecondaire} disabled>
          <Text style={styles.texteBoutonSecondaire}>
            ✏️  Modifier le profil{' '}
            <Text style={styles.texteBadge}>(Phase 6)</Text>
          </Text>
        </TouchableOpacity>

        {/* Bouton changer le mot de passe (Phase 6) */}
        <TouchableOpacity style={styles.boutonSecondaire} disabled>
          <Text style={styles.texteBoutonSecondaire}>
            🔑  Changer le mot de passe{' '}
            <Text style={styles.texteBadge}>(Phase 6)</Text>
          </Text>
        </TouchableOpacity>

        {/* Bouton historique des sessions (Phase 6) */}
        <TouchableOpacity style={styles.boutonSecondaire} disabled>
          <Text style={styles.texteBoutonSecondaire}>
            📊  Historique des sessions{' '}
            <Text style={styles.texteBadge}>(Phase 6)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Déconnexion ── */}
      <View style={styles.sectionDeconnexion}>
        <TouchableOpacity
          style={[styles.boutonDeconnexion, deconnexionEnCours && styles.boutonDesactive]}
          onPress={gererDeconnexion}
          disabled={deconnexionEnCours}
          activeOpacity={0.8}
        >
          {deconnexionEnCours ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.texteBoutonDeconnexion}>Se déconnecter</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  // En-tête vert avec avatar
  entete: {
    backgroundColor: '#16A34A',
    paddingVertical: 32,
    alignItems: 'center',
  },
  // Cercle avec les initiales
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initiales: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
  },
  nomComplet: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#DCFCE7',
  },
  // Section d'informations ou d'actions
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titreSectionn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  // Ligne d'information (étiquette + valeur)
  ligneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  etiquetteInfo: {
    fontSize: 15,
    color: '#6B7280',
  },
  valeurInfo: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  // Boutons d'action désactivés (Phase 6)
  boutonSecondaire: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    opacity: 0.5,
  },
  texteBoutonSecondaire: {
    fontSize: 15,
    color: '#374151',
  },
  texteBadge: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // Section et bouton de déconnexion
  sectionDeconnexion: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 32,
  },
  boutonDeconnexion: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  boutonDesactive: {
    backgroundColor: '#FCA5A5',
  },
  texteBoutonDeconnexion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EcranProfil;
