// jest.setup.js
// Configuration globale pour les tests Jest

// Mock pour AsyncStorage (utilisé par SecureStore)
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Supprime les avertissements "act" dans les tests React
jest.spyOn(global.console, 'warn').mockImplementation(() => {});
jest.spyOn(global.console, 'error').mockImplementation(() => {});
