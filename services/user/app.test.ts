import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Mock user data for tests
const TEST_USERS = {
  user1: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  },
  user2: {
    id: 'user2',
    name: 'Another User',
    email: 'another@example.com',
    role: 'user'
  }
};

// Create a test-specific user.json file
const TEST_USER_JSON_PATH = path.join(__dirname, 'test-user.json');

// Import modules directly
import { Logger } from '@monorepo/logger';
import { registerHealthChecks, healthLoggingMiddleware } from '@monorepo/health';

describe('User Service', () => {
  // Save original environment variables to restore them later
  const originalEnv = { ...process.env };
  // Create an app instance for testing
  const app = express();
  let server: any;
  
  before(() => {
    // Write test user data to file
    fs.writeFileSync(TEST_USER_JSON_PATH, JSON.stringify(TEST_USERS), 'utf-8');
    
    // Set up a basic Express app with similar functionality to our app.ts
    // but without actually starting the server
    
    // Create a logger
    const logger = new Logger('test-user-service');
    
    // Add JSON middleware
    app.use(express.json());
    
    // Register health checks
    registerHealthChecks(app);
    
    // Add health logging middleware
    app.use(healthLoggingMiddleware());
    
    // Load user data from test file
    let users: Record<string, any>;
    try {
      const userData = fs.readFileSync(TEST_USER_JSON_PATH, 'utf-8');
      users = JSON.parse(userData);
    } catch (error) {
      console.error('Failed to load test user data', error);
      users = {};
    }
    
    // API routes - mimicking the ones in app.ts
    app.get('/', (req, res) => {
      res.json({ message: 'User Service API' });
    });
    
    app.get('/users', (req, res) => {
      res.json(users);
    });
    
    app.get('/users/:id', (req, res) => {
      const id = req.params.id;
      const user = users[id];
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    });
    
    // Start a test server
    server = app.listen(0); // Use port 0 to get a random available port
  });
  
  after(() => {
    // Clean up: close server, remove test file
    if (server) {
      server.close();
    }
    
    try {
      fs.unlinkSync(TEST_USER_JSON_PATH);
    } catch (error) {
      console.error('Error cleaning up test file', error);
    }
    
    // Restore environment variables
    process.env = originalEnv;
  });
  
  it('should return API message for root endpoint', async () => {
    const response = await request(app).get('/');
    
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: 'User Service API' });
  });
  
  it('should return all users', async () => {
    const response = await request(app).get('/users');
    
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, TEST_USERS);
  });
  
  it('should return a specific user by ID', async () => {
    const response = await request(app).get('/users/user1');
    
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, TEST_USERS.user1);
  });
  
  it('should return 404 for non-existent user', async () => {
    const response = await request(app).get('/users/nonexistent');
    
    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'User not found' });
  });
  
  it('should have working health endpoints', async () => {
    const readinessResponse = await request(app).get('/readiness');
    const livenessResponse = await request(app).get('/liveness');
    
    assert.equal(readinessResponse.status, 200);
    assert.deepEqual(readinessResponse.body, { status: 'ready' });
    
    assert.equal(livenessResponse.status, 200);
    assert.deepEqual(livenessResponse.body, { status: 'alive' });
  });


  it('should demonstrate flaky behavior with user response time', async () => {
    // Simulate random delay/failure
    const randomValue = Math.random();
    
    if (randomValue < 0.25) {
      // 25% chance of timeout
      await new Promise(resolve => setTimeout(resolve, 5000));
      throw new Error('Request timed out');
    }

    const response = await request(app).get('/users');
    
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(Object.values(response.body)));
    assert.ok(Object.values(response.body).length > 0);
  });
}); 