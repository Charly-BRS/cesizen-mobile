# CESIZen — Application Mobile

Application mobile de bien-être mental **CESIZen**, construite avec **React Native** et **Expo 54**.

## Stack technique

| Composant | Version |
|---|---|
| React Native | 0.81 |
| Expo | 54.x |
| TypeScript | 5.9 |
| React Navigation | 7.x |
| Reanimated | 4.x |
| Axios | 1.x |
| Jest + jest-expo | 29 + 54.x |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL de l'API
# Éditer src/services/api.ts → changer BASE_URL
# ⚠️  Utiliser l'IP locale de votre machine, PAS localhost
# Exemple : http://192.168.1.42:8080/api  (trouver l'IP avec ipconfig)

# 3. Lancer Expo
npx expo start
```

Ensuite, scanner le QR code avec l'application **Expo Go** (Android/iOS) ou lancer sur un émulateur.

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npx expo start` | Démarre le serveur de développement Expo |
| `npx expo start --android` | Lance sur Android (émulateur ou appareil) |
| `npx expo start --ios` | Lance sur iOS (simulateur ou appareil) |
| `npm run type-check` | Vérification TypeScript |
| `npm test` | Lancer les tests unitaires (Jest) |

---

## Structure des écrans (onglets)

| Onglet | Écran | Description |
|---|---|---|
| Accueil | `EcranAccueil` | Tableau de bord personnel |
| Articles | `EcranArticles` | Liste des articles bien-être |
| Exercices | `EcranExercices` | Liste des exercices de respiration |
| Profil | `EcranProfil` | Profil utilisateur + déconnexion |

### Écrans supplémentaires

| Écran | Description |
|---|---|
| `EcranConnexion` | Formulaire de connexion |
| `EcranInscription` | Formulaire d'inscription |
| `EcranDetailArticle` | Détail d'un article |
| `EcranAnimationExercice` | Animation de respiration guidée |
| `EcranModifierProfil` | Modifier son prénom/nom |
| `EcranChangerMotDePasse` | Changer son mot de passe |
| `EcranHistoriqueSessions` | Historique des séances |
| `EcranAdmin` | Panel admin (toggle visibilité exercices) |

---

## Architecture `src/`

```
src/
├── __tests__/         # Tests unitaires Jest
├── context/           # AuthContext (état d'authentification global)
├── navigation/        # Navigateurs React Navigation (onglets, stacks)
├── screens/           # Écrans de l'application
│   ├── admin/         # Écran d'administration
│   ├── articles/      # Écran détail article
│   ├── auth/          # Connexion et inscription
│   ├── exercises/     # Animation d'exercice
│   ├── profil/        # Profil, historique, changement MDP
│   └── tabs/          # 4 onglets principaux
└── services/          # Appels API (Axios + SecureStore pour le JWT)
```

---

## Tests unitaires

```bash
npm test
# 10 tests dans 2 fichiers — tous verts ✅
```

| Fichier | Ce qui est testé |
|---|---|
| `authService.test.ts` | seConnecter() décodage JWT, sInscrire() appels API |
| `AuthContext.test.tsx` | estConnecte, connecter(), deconnecter(), mettreAJourUtilisateur() |

---

## Note importante sur l'URL de l'API

Sur mobile, `localhost` pointe vers l'appareil lui-même, **pas** votre ordinateur.
Il faut utiliser l'adresse IP locale de votre machine sur le réseau Wi-Fi :

```bash
# Sur Windows : trouver votre IP locale
ipconfig
# Chercher "Adresse IPv4" sous "Carte réseau sans fil Wi-Fi"
# Exemple : 192.168.1.42

# Dans src/services/api.ts
const BASE_URL = 'http://192.168.1.42:8080/api';
```
