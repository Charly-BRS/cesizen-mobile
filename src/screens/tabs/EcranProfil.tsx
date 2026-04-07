// src/screens/tabs/EcranProfil.tsx
// Écran principal du profil : affiche les informations de l'utilisateur
// et propose des boutons de navigation vers les sous-écrans (modifier, mdp, historique).
// Contient aussi le bouton de déconnexion.

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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import type { ParamListeRoutesProfil } from '../../navigation/NavigateurProfil';

// Type de navigation pour accéder aux sous-écrans du profil
type NavigationProfil = StackNavigationProp<ParamListeRoutesProfil, 'VueProfil'>;

const EcranProfil: React.FC = () => {
  const navigation = useNavigation<NavigationProfil>();
  const { utilisateur, deconnecter } = useAuth();

  // État de chargement pendant la déconnexion
  const [deconnexionEnCours, setDeconnexionEnCours] = useState<boolean>(false);

  // Déconnexion avec confirmation
  const gererDeconnexion = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            setDeconnexionEnCours(true);
            try {
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

      {/* ── En-tête avec avatar et nom ── */}
      <View style={styles.entete}>
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

      {/* ── Section : Informations ── */}
      <View style={styles.section}>
        <Text style={styles.titreSection}>Informations</Text>

        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Prénom</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.prenom}</Text>
        </View>
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Nom</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.nom}</Text>
        </View>
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Email</Text>
          <Text style={styles.valeurInfo}>{utilisateur?.email}</Text>
        </View>
        <View style={styles.ligneInfo}>
          <Text style={styles.etiquetteInfo}>Rôle</Text>
          <Text style={styles.valeurInfo}>
            {utilisateur?.roles?.includes('ROLE_ADMIN') ? '👑 Administrateur' : '👤 Utilisateur'}
          </Text>
        </View>
      </View>

      {/* ── Section : Actions ── */}
      <View style={styles.section}>
        <Text style={styles.titreSection}>Actions</Text>

        {/* Bouton : Modifier le profil */}
        <TouchableOpacity
          style={styles.boutonAction}
          onPress={() => navigation.navigate('ModifierProfil')}
          activeOpacity={0.7}
        >
          <Text style={styles.texteBoutonAction}>✏️  Modifier le profil</Text>
          <Text style={styles.fleche}>›</Text>
        </TouchableOpacity>

        {/* Bouton : Changer le mot de passe */}
        <TouchableOpacity
          style={styles.boutonAction}
          onPress={() => navigation.navigate('ChangerMotDePasse')}
          activeOpacity={0.7}
        >
          <Text style={styles.texteBoutonAction}>🔑  Changer le mot de passe</Text>
          <Text style={styles.fleche}>›</Text>
        </TouchableOpacity>

        {/* Bouton : Historique des sessions */}
        <TouchableOpacity
          style={[styles.boutonAction, styles.dernierBouton]}
          onPress={() => navigation.navigate('HistoriqueSessions')}
          activeOpacity={0.7}
        >
          <Text style={styles.texteBoutonAction}>📊  Historique des sessions</Text>
          <Text style={styles.fleche}>›</Text>
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
  entete: {
    backgroundColor: '#16A34A',
    paddingVertical: 32,
    alignItems: 'center',
  },
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
  titreSection: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
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
  // Boutons de navigation vers les sous-écrans
  boutonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dernierBouton: {
    borderBottomWidth: 0,
  },
  texteBoutonAction: {
    fontSize: 15,
    color: '#374151',
  },
  fleche: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  // Déconnexion
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
