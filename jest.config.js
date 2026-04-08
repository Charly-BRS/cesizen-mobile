module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  // Coverage thresholds pour la pipeline CI/CD
  // Global: bas car inclut les composants UI non testés
  // Services testés: adminService, articleService, authService, exerciseService, storage
  // Services non testés: profilService, secureStorage (utilitaires)
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 10,
      lines: 8,
      statements: 8,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        lib: ['es2015', 'dom'],
        target: 'es2015',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-secure-store|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-secure-store$': '<rootDir>/jest.mocks/expo-secure-store.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/jest.mocks/react-native-async-storage.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
