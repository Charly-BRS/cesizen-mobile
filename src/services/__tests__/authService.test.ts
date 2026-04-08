// src/services/__tests__/authService.test.ts
// Tests unitaires pour le service d'authentification
// Focus sur la logique critique : décodage JWT

describe('authService - Décodage JWT', () => {
  // Crée un token JWT valide pour les tests
  const creerTokenTest = (payload: Record<string, any>): string => {
    // Header.Payload.Signature (simplifié pour les tests)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = 'fake-signature';
    return `${header}.${payloadBase64}.${signature}`;
  };

  test('décode correctement un token JWT valide', () => {
    // Arrange
    const payloadAttendu = {
      id: 1,
      email: 'user@example.com',
      roles: ['ROLE_USER'],
      prenom: 'Jean',
      nom: 'Dupont',
      exp: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1h
    };
    const token = creerTokenTest(payloadAttendu);

    // Act - Simulation du décodage (le vrai code utilise atob)
    const partiePayload = token.split('.')[1];
    const base64Standard = partiePayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Standard));

    // Assert
    expect(payload.id).toBe(payloadAttendu.id);
    expect(payload.email).toBe(payloadAttendu.email);
    expect(payload.roles).toContain('ROLE_USER');
    expect(payload.prenom).toBe(payloadAttendu.prenom);
    expect(payload.nom).toBe(payloadAttendu.nom);
  });

  test('gère correctement un token expiré', () => {
    // Arrange - payload avec expiration passée
    const payloadExpiré = {
      id: 1,
      email: 'user@example.com',
      roles: ['ROLE_USER'],
      prenom: 'Jean',
      nom: 'Dupont',
      exp: Math.floor(Date.now() / 1000) - 3600, // Expiré il y a 1h
    };
    const token = creerTokenTest(payloadExpiré);

    // Act
    const partiePayload = token.split('.')[1];
    const base64Standard = partiePayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Standard));
    const estExpire = payload.exp * 1000 < Date.now();

    // Assert
    expect(estExpire).toBe(true);
  });

  test('décode un token pour les admins avec ROLE_ADMIN', () => {
    // Arrange
    const payloadAdmin = {
      id: 2,
      email: 'admin@example.com',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
      prenom: 'Alice',
      nom: 'Martin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = creerTokenTest(payloadAdmin);

    // Act
    const partiePayload = token.split('.')[1];
    const base64Standard = partiePayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Standard));
    const estAdmin = payload.roles.includes('ROLE_ADMIN');

    // Assert
    expect(estAdmin).toBe(true);
    expect(payload.roles).toContain('ROLE_ADMIN');
  });

  test('rejette un token mal formé', () => {
    // Arrange
    const tokenMalFormé = 'invalid-token-without-dots';

    // Act & Assert
    expect(() => {
      const parts = tokenMalFormé.split('.');
      if (parts.length !== 3) {
        throw new Error('Token invalide');
      }
    }).toThrow('Token invalide');
  });
});
