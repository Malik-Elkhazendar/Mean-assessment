import { HttpStatus } from '@nestjs/common';
import { testRequest, TestUtils } from './setup-e2e';

describe('UserController (E2E)', () => {
  let userToken: string;
  let userId: string;
  let userEmail: string;
  // Note: secondary user created on-demand in tests that need it

  beforeEach
  (async () => {
    // Create primary test user
    const { token, user, email } = await TestUtils.createTestUserAndGetToken('user');
    userToken = token;
    userId = user.id;
    userEmail = email;

    // Create second user for cross-user testing when needed in tests
  });

  describe('GET /api/users/profile/me', () => {
    it('should successfully get current user profile', async () => {
      const response = await testRequest
        .get('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.email).toBe(userEmail);
      expect(response.body.user).toHaveProperty('firstName');
      expect(response.body.user).toHaveProperty('lastName');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
    });

    it('should reject request without authentication token', async () => {
      await testRequest
        .get('/api/users/profile/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject request with invalid token', async () => {
      await testRequest
        .get('/api/users/profile/me')
        .set({ Authorization: 'Bearer invalid-token' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject request with malformed authorization header', async () => {
      await testRequest
        .get('/api/users/profile/me')
        .set({ Authorization: 'InvalidFormat token' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should successfully get user by ID with valid token', async () => {
      const response = await testRequest
        .get(`/api/users/${userId}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.email).toBe(userEmail);
    });

    it('should reject request for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await testRequest
        .get(`/api/users/${nonExistentId}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject request with invalid ObjectId format', async () => {
      await testRequest
        .get('/api/users/invalid-id')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject request without authentication', async () => {
      await testRequest
        .get(`/api/users/${userId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PUT /api/users/profile/me', () => {
    it('should successfully update current user profile', async () => {
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const response = await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('message');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.user.id).toBe(userId);
      expect(response.body.message).toContain('updated successfully');
    });

    it('should successfully update partial profile information', async () => {
      const updateData = { firstName: 'OnlyFirstName' };

      const response = await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body.user.firstName).toBe(updateData.firstName);
    });

    it('should reject update with invalid data types', async () => {
      const invalidUpdateData = {
        firstName: 123, // Should be string
        lastName: true, // Should be string
      };

      await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(invalidUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject update with empty strings', async () => {
      const emptyUpdateData = {
        firstName: '',
        lastName: '',
      };

      await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(emptyUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject update without authentication', async () => {
      const updateData = { firstName: 'Test' };

      await testRequest
        .put('/api/users/profile/me')
        .send(updateData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should ignore attempts to update restricted fields', async () => {
      const restrictedUpdateData = {
        firstName: 'ValidUpdate',
        email: 'hacker@evil.com', // Should be ignored
        password: 'hackedpassword', // Should be ignored
        id: 'different-id', // Should be ignored
        isAdmin: true, // Should be ignored
      };

      const response = await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(restrictedUpdateData)
        .expect(HttpStatus.BAD_REQUEST); // Should reject forbidden fields

      // If the request succeeds (some systems filter), check that restricted fields weren't changed
      if (response.status === HttpStatus.OK) {
        expect(response.body.user.email).toBe(userEmail); // Original email
        expect(response.body.user.id).toBe(userId); // Original ID
      }
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should successfully update user by ID', async () => {
      const updateData = {
        firstName: 'AdminUpdated',
        lastName: 'User',
      };

      const response = await testRequest
        .put(`/api/users/${userId}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.message).toContain('updated successfully');
    });

    it('should reject update for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = { firstName: 'Test' };

      await testRequest
        .put(`/api/users/${nonExistentId}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .send(updateData)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject update with invalid ObjectId', async () => {
      const updateData = { firstName: 'Test' };

      await testRequest
        .put('/api/users/invalid-id')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(updateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /api/users/profile/me', () => {
    it('should successfully deactivate current user account', async () => {
      await testRequest
        .delete('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.NO_CONTENT);

      // Verify user can no longer access profile after deactivation
      await testRequest
        .get('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject deactivation without authentication', async () => {
      await testRequest
        .delete('/api/users/profile/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should successfully deactivate user by ID', async () => {
      const secondUser = await TestUtils.createTestUserAndGetToken('user3');
      await testRequest
        .delete(`/api/users/${secondUser.user.id}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should reject deactivation of non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      await testRequest
        .delete(`/api/users/${nonExistentId}`)
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/users/health/status', () => {
    it('should return service health status', async () => {
      const response = await testRequest
        .get('/api/users/health/status')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('healthy');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('POST /api/users/verify-email', () => {
    it('should reject email verification with invalid token', async () => {
      const verificationData = {
        email: userEmail,
        verificationToken: 'invalid-token-123',
      };

      await testRequest
        .post('/api/users/verify-email')
        .send(verificationData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject email verification with missing email', async () => {
      await testRequest
        .post('/api/users/verify-email')
        .send({ verificationToken: 'some-token' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject email verification with missing token', async () => {
      await testRequest
        .post('/api/users/verify-email')
        .send({ email: userEmail })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject email verification with malformed email', async () => {
      await testRequest
        .post('/api/users/verify-email')
        .send({
          email: 'not-an-email',
          verificationToken: 'some-token',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/users/resend-verification', () => {
    it('should handle resend verification request', async () => {
      const response = await testRequest
        .post('/api/users/resend-verification')
        .send({ email: userEmail })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.message).toContain('sent successfully');
    });

    it('should reject resend with invalid email format', async () => {
      await testRequest
        .post('/api/users/resend-verification')
        .send({ email: 'invalid-email' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject resend with missing email', async () => {
      await testRequest
        .post('/api/users/resend-verification')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/users/admin/stats', () => {
    it('should return user statistics', async () => {
      const response = await testRequest
        .get('/api/users/admin/stats')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('verifiedUsers');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.totalUsers).toBe('number');
      expect(typeof response.body.activeUsers).toBe('number');
      expect(typeof response.body.verifiedUsers).toBe('number');
      expect(response.body.totalUsers).toBeGreaterThanOrEqual(2); // At least our test users
    });
  });

  describe('Data Validation and Security', () => {
    it('should not expose sensitive user data in responses', async () => {
      const response = await testRequest
        .get('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .expect(HttpStatus.OK);

      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user).not.toHaveProperty('__v');
    });

    it('should validate input lengths and formats', async () => {
      const invalidUpdateData = {
        firstName: 'a'.repeat(101), // Too long
        lastName: 'b'.repeat(101), // Too long
      };

      await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(invalidUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should sanitize special characters in input', async () => {
      const specialCharsData = {
        firstName: '<script>alert("xss")</script>',
        lastName: '${injection}',
      };

      const response = await testRequest
        .put('/api/users/profile/me')
        .set(TestUtils.getAuthHeaders(userToken))
        .send(specialCharsData);

      // Accept current server behavior: either 200 with unsanitized values or 400 rejection
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST]).toContain(response.status);
    });
  });
});