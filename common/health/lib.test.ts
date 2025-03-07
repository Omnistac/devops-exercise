import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import express, { Application, Request, Response } from 'express';
import { registerHealthChecks, healthLoggingMiddleware } from './lib';

describe('Health Module', () => {
  
  describe('healthLoggingMiddleware', () => {
    let consoleLogOriginal: typeof console.log;
    let loggedMessages: string[] = [];
    
    beforeEach(() => {
      // Save original console.log
      consoleLogOriginal = console.log;
      // Replace console.log with a function that stores messages
      console.log = (...args: any[]) => {
        loggedMessages.push(args[0]);
      };
    });
    
    afterEach(() => {
      // Restore original console.log
      console.log = consoleLogOriginal;
      // Clear logged messages
      loggedMessages = [];
    });
    
    it('should create a middleware that calls next', async () => {
      // Create middleware
      const middleware = healthLoggingMiddleware();
      
      // Create request, response and next objects
      const req = { path: '/some-path' } as Request;
      const res = {
        on: (event: string, callback: Function) => {
          if (event === 'finish') {
            callback();
          }
        }
      } as any as Response;
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      // Call middleware
      middleware(req, res, next);
      
      // Verify next was called
      assert.equal(nextCalled, true, 'Expected next to be called');
    });
    
    it('should log health check requests when completed', async () => {
      // Create middleware
      const middleware = healthLoggingMiddleware();
      
      // Create request, response and next
      const req = { path: '/readiness' } as Request;
      const res = {
        on: (event: string, callback: Function) => {
          if (event === 'finish') {
            callback();
          }
        }
      } as any as Response;
      
      const next = () => {};
      
      // Call middleware
      middleware(req, res, next);
      
      // Verify a message was logged
      assert.equal(loggedMessages.length, 1, 'Expected one message to be logged');
      assert.ok(loggedMessages[0].includes('/readiness'), 'Expected log to include path');
    });
    
    it('should not log non-health requests', async () => {
      // Create middleware
      const middleware = healthLoggingMiddleware();
      
      // Create request, response and next
      const req = { path: '/api/users' } as Request;
      const res = {
        on: (event: string, callback: Function) => {
          if (event === 'finish') {
            callback();
          }
        }
      } as any as Response;
      
      const next = () => {};
      
      // Call middleware
      middleware(req, res, next);
      
      // Verify no messages were logged
      assert.equal(loggedMessages.length, 0, 'Expected no messages to be logged');
    });
  });
}); 