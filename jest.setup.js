// jest.setup.js
// Configuration globale pour les tests Jest

// Supprime les avertissements "act" non pertinents dans les tests React
jest.spyOn(global.console, 'warn').mockImplementation(() => {});
jest.spyOn(global.console, 'error').mockImplementation(() => {});
