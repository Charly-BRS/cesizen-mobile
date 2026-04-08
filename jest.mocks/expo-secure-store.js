// jest.mocks/expo-secure-store.js
// Mock pour expo-secure-store utilisé dans les tests Jest

module.exports = {
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
};
