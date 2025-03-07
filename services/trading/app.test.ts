import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Generate a large dataset of stocks for performance testing
function generateLargeStockDataset(count = 1000000) {
  const stocks: Record<string, any> = {};
  
  // Create some special stocks that we'll use in specific tests
  stocks['AAPL'] = {
    id: 'AAPL',
    name: 'Apple Inc.',
    price: 150.25,
    owned: 'user1',
    sector: 'Technology',
    volume: 1000000,
    marketCap: 2500000000000
  };
  
  stocks['MSFT'] = {
    id: 'MSFT',
    name: 'Microsoft Corporation',
    price: 245.75,
    owned: 'user2',
    sector: 'Technology',
    volume: 800000,
    marketCap: 2100000000000
  };
  
  stocks['GOOGL'] = {
    id: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2800.10,
    owned: 'user3',
    sector: 'Technology',
    volume: 600000,
    marketCap: 1900000000000
  };
  
  // Generate large number of random stocks
  const sectors = ['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial', 'Materials', 'Utilities', 'Real Estate', 'Telecom'];
  const users = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'];
  
  for (let i = 0; i < count; i++) {
    const ticker = `STOCK${i.toString().padStart(4, '0')}`;
    const randomPrice = Math.round(Math.random() * 10000) / 100;
    const randomVolume = Math.floor(Math.random() * 2000000);
    const randomMarketCap = Math.floor(Math.random() * 1000000000000);
    const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    stocks[ticker] = {
      id: ticker,
      name: `Stock ${i} Corporation`,
      price: randomPrice,
      owned: randomUser,
      sector: randomSector,
      volume: randomVolume,
      marketCap: randomMarketCap
    };
  }
  
  return stocks;
}

// Create test data
const TEST_STOCKS = generateLargeStockDataset();

// Create a test-specific stocks.json file
const TEST_STOCKS_JSON_PATH = path.join(__dirname, 'test-stocks.json');

// Import modules directly
import { Logger } from '@monorepo/logger';
import { registerHealthChecks, healthLoggingMiddleware } from '@monorepo/health';

describe('Trading Service - Performance Test Suite', () => {
  // Save original environment variables to restore them later
  const originalEnv = { ...process.env };
  // Create an app instance for testing
  const app = express();
  let server: any;
  let logger: Logger;
  
  // Track test stats to summarize at the end
  const testStats = {
    testsRun: 0,
    swapsPerformed: 0,
    queries: 0,
    startTime: Date.now()
  };
  
  // Helper function to cause CPU work
  function performHeavyComputation(iterations = 1000000) {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    return result;
  }
  
  // Helper function to sleep
  async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  before(async () => {
    console.log('Setting up Trading Service tests...');
    console.log(`Preparing test data with ${Object.keys(TEST_STOCKS).length} stocks...`);
    
    // Write test stock data to file
    fs.writeFileSync(TEST_STOCKS_JSON_PATH, JSON.stringify(TEST_STOCKS), 'utf-8');
    console.log('Test data file created.');
    
    // Create a logger
    logger = new Logger('test-trading-service');
    
    // Set up a basic Express app with similar functionality to our app.ts
    console.log('Setting up test Express app...');
    
    // Add JSON middleware
    app.use(express.json());
    
    // Register health checks
    registerHealthChecks(app);
    
    // Add health logging middleware
    app.use(healthLoggingMiddleware());
    
    // Add request timing middleware
    app.use((req, res, next) => {
      const startTime = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info(`${req.method} ${req.path} - ${duration}ms`);
      });
      next();
    });
    
    // Load stocks data from test file
    console.log('Loading stock data...');
    let stocks: Record<string, any>;
    try {
      const stocksData = fs.readFileSync(TEST_STOCKS_JSON_PATH, 'utf-8');
      stocks = JSON.parse(stocksData);
      logger.info('Stocks data loaded successfully');
    } catch (error) {
      console.error('Failed to load test stocks data', error);
      stocks = {};
    }
    
    // API routes - mimicking the ones in app.ts
    app.get('/', (req, res) => {
      testStats.queries++;
      res.json({ message: 'Trading Service API' });
    });
    
    app.get('/stocks', (req, res) => {
      testStats.queries++;
      
      // Parse query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sector = req.query.sector as string;
      const owned = req.query.owned as string;
      
      // Apply filters if specified
      let filteredStocks = Object.values(stocks);
      
      if (sector) {
        filteredStocks = filteredStocks.filter(stock => stock.sector === sector);
      }
      
      if (owned) {
        filteredStocks = filteredStocks.filter(stock => stock.owned === owned);
      }
      
      // Apply limit
      if (limit && limit > 0) {
        filteredStocks = filteredStocks.slice(0, limit);
      }
      
      res.json(filteredStocks);
    });
    
    app.get('/stocks/:id', (req, res) => {
      testStats.queries++;
      const id = req.params.id;
      const stock = stocks[id];
      
      if (!stock) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      res.json(stock);
    });
    
    app.post('/swap', (req, res) => {
      testStats.swapsPerformed++;
      
      try {
        const { stockId, fromUserId, toUserId } = req.body;
        
        if (!stockId || !fromUserId || !toUserId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const stock = stocks[stockId];
        
        if (!stock) {
          return res.status(404).json({ error: 'Stock not found' });
        }
        
        if (stock.owned !== fromUserId) {
          return res.status(400).json({ error: 'Stock is not owned by the specified user' });
        }
        
        // Update ownership
        stock.owned = toUserId;
        
        // Save updated stocks data to test file
        fs.writeFileSync(TEST_STOCKS_JSON_PATH, JSON.stringify(stocks, null, 2), 'utf-8');
        
        res.json({ 
          success: true,
          message: `Stock ${stockId} transferred from ${fromUserId} to ${toUserId}`,
          stock
        });
      } catch (error) {
        console.error('Error processing swap request', error);
        res.status(500).json({ error: 'Failed to process swap request' });
      }
    });
    
    // Add a bulk operations endpoint for testing
    app.post('/bulk-swap', (req, res) => {
      try {
        const { operations } = req.body;
        
        if (!Array.isArray(operations) || operations.length === 0) {
          return res.status(400).json({ error: 'Missing or invalid operations array' });
        }
        
        const results = [];
        
        for (const op of operations) {
          testStats.swapsPerformed++;
          const { stockId, fromUserId, toUserId } = op;
          
          if (!stockId || !fromUserId || !toUserId) {
            results.push({ 
              stockId, 
              success: false, 
              error: 'Missing required parameters' 
            });
            continue;
          }
          
          const stock = stocks[stockId];
          
          if (!stock) {
            results.push({ 
              stockId, 
              success: false, 
              error: 'Stock not found' 
            });
            continue;
          }
          
          if (stock.owned !== fromUserId) {
            results.push({ 
              stockId, 
              success: false, 
              error: 'Stock is not owned by the specified user' 
            });
            continue;
          }
          
          // Update ownership
          stock.owned = toUserId;
          
          results.push({
            stockId,
            success: true,
            message: `Stock ${stockId} transferred from ${fromUserId} to ${toUserId}`,
            stock
          });
        }
        
        // Save updated stocks data to test file
        fs.writeFileSync(TEST_STOCKS_JSON_PATH, JSON.stringify(stocks, null, 2), 'utf-8');
        
        res.json({ 
          success: true,
          results
        });
      } catch (error) {
        console.error('Error processing bulk swap request', error);
        res.status(500).json({ error: 'Failed to process bulk swap request' });
      }
    });
    
    // Add a portfolio endpoint for testing
    app.get('/portfolio/:userId', (req, res) => {
      testStats.queries++;
      
      const userId = req.params.userId;
      const userStocks = Object.values(stocks).filter((stock: any) => stock.owned === userId);
      
      // Calculate portfolio value
      const totalValue = userStocks.reduce((sum: number, stock: any) => sum + stock.price, 0);
      
      res.json({
        userId,
        stockCount: userStocks.length,
        totalValue,
        stocks: userStocks
      });
    });
    
    // Add sector statistics endpoint for testing
    app.get('/sector-stats', (req, res) => {
      testStats.queries++;
      
      // Perform some heavy computation to simulate analysis
      performHeavyComputation(500000);
      
      const sectorStats: Record<string, any> = {};
      
      Object.values(stocks).forEach((stock: any) => {
        if (!sectorStats[stock.sector]) {
          sectorStats[stock.sector] = {
            count: 0,
            totalValue: 0,
            avgPrice: 0,
            stocks: []
          };
        }
        
        sectorStats[stock.sector].count++;
        sectorStats[stock.sector].totalValue += stock.price;
        sectorStats[stock.sector].stocks.push(stock.id);
      });
      
      // Calculate averages
      Object.keys(sectorStats).forEach(sector => {
        sectorStats[sector].avgPrice = sectorStats[sector].totalValue / sectorStats[sector].count;
      });
      
      res.json(sectorStats);
    });
    
    // Start a test server
    console.log('Starting test server...');
    server = app.listen(0); // Use port 0 to get a random available port
    
    // Add a small delay to ensure everything is ready
    await sleep(200);
    console.log('Test server started.');
    console.log('Setup complete. Beginning tests...');
  });
  
  after(async () => {
    console.log('\nCleaning up after tests...');
    
    // Calculate test duration
    const testDuration = (Date.now() - testStats.startTime) / 1000;
    
    console.log(`\nTest Summary:`);
    console.log(`- Total tests run: ${testStats.testsRun}`);
    console.log(`- Total swaps performed: ${testStats.swapsPerformed}`);
    console.log(`- Total queries performed: ${testStats.queries}`);
    console.log(`- Total test duration: ${testDuration.toFixed(2)} seconds`);
    
    // Clean up: close server, remove test file
    if (server) {
      server.close();
    }
    
    try {
      fs.unlinkSync(TEST_STOCKS_JSON_PATH);
    } catch (error) {
      console.error('Error cleaning up test file', error);
    }
    
    // Restore environment variables
    process.env = originalEnv;
  });
  
  // Base functionality tests
  describe('Basic API Functionality', () => {
    it('should return API message for root endpoint', async () => {
      testStats.testsRun++;
      const response = await request(app).get('/');
      
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { message: 'Trading Service API' });
    });
    
    it('should return all stocks with default parameters', async () => {
      testStats.testsRun++;
      performHeavyComputation(100000); // Add some CPU work
      
      const response = await request(app).get('/stocks');
      
      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body));
      assert.ok(response.body.length > 0);
    });
    
    it('should return a specific stock by ID', async () => {
      testStats.testsRun++;
      const response = await request(app).get('/stocks/AAPL');
      
      assert.equal(response.status, 200);
      assert.equal(response.body.id, 'AAPL');
      assert.equal(response.body.name, 'Apple Inc.');
    });
    
    it('should return 404 for non-existent stock', async () => {
      testStats.testsRun++;
      const response = await request(app).get('/stocks/NONEXISTENT');
      
      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: 'Stock not found' });
    });
  });
  
  // Stock swapping tests
  describe('Stock Swapping Operations', () => {
    it('should successfully swap stock ownership', async () => {
      testStats.testsRun++;
      const response = await request(app)
        .post('/swap')
        .send({
          stockId: 'AAPL',
          fromUserId: 'user1',
          toUserId: 'user2'
        });
      
      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.stock.owned, 'user2');
      
      // Verify the file was updated
      const updatedStocks = JSON.parse(fs.readFileSync(TEST_STOCKS_JSON_PATH, 'utf-8'));
      assert.equal(updatedStocks.AAPL.owned, 'user2');
      
      // Add some CPU work
      performHeavyComputation(200000);
    });
    
    it('should reject swap with missing parameters', async () => {
      testStats.testsRun++;
      const response = await request(app)
        .post('/swap')
        .send({
          stockId: 'MSFT'
          // Missing fromUserId and toUserId
        });
      
      assert.equal(response.status, 400);
      assert.deepEqual(response.body, { error: 'Missing required parameters' });
    });
    
    it('should reject swap for non-existent stock', async () => {
      testStats.testsRun++;
      const response = await request(app)
        .post('/swap')
        .send({
          stockId: 'NONEXISTENT',
          fromUserId: 'user1',
          toUserId: 'user2'
        });
      
      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: 'Stock not found' });
    });
    
    it('should reject swap with incorrect ownership', async () => {
      testStats.testsRun++;
      const response = await request(app)
        .post('/swap')
        .send({
          stockId: 'GOOGL',
          fromUserId: 'user1', // GOOGL is owned by user3
          toUserId: 'user2'
        });
      
      assert.equal(response.status, 400);
      assert.deepEqual(response.body, { error: 'Stock is not owned by the specified user' });
    });
    
    // Test that performs multiple swaps in sequence
    it('should handle a sequence of 20 swaps correctly', async () => {
      testStats.testsRun++;
      
      // Get a list of stock IDs to use
      const stockIds = Object.keys(TEST_STOCKS).slice(0, 20);
      
      // Store initial owners to verify changes later
      const initialOwners: Record<string, string> = {};
      for (const stockId of stockIds) {
        const response = await request(app).get(`/stocks/${stockId}`);
        initialOwners[stockId] = response.body.owned;
      }
      
      // Perform swaps
      for (const stockId of stockIds) {
        const fromUserId = initialOwners[stockId];
        const toUserId = fromUserId === 'user1' ? 'user2' : 'user1';
        
        const response = await request(app)
          .post('/swap')
          .send({
            stockId,
            fromUserId,
            toUserId
          });
        
        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        
        // Add a tiny delay to make the test run longer
        await sleep(50); 
      }
      
      // Verify all stocks were updated
      for (const stockId of stockIds) {
        const response = await request(app).get(`/stocks/${stockId}`);
        const newOwner = response.body.owned;
        const originalOwner = initialOwners[stockId];
        
        assert.notEqual(newOwner, originalOwner);
        assert.ok(newOwner === 'user1' || newOwner === 'user2');
      }
    });
  });
  
  // Bulk operations tests
  describe('Bulk Operations', () => {
    it('should process bulk swaps correctly', async () => {
      testStats.testsRun++;
      
      // Get MSFT current owner
      const msftResponse = await request(app).get('/stocks/MSFT');
      const msftCurrentOwner = msftResponse.body.owned;
      const msftNewOwner = msftCurrentOwner === 'user1' ? 'user3' : 'user1';
      
      // Get GOOGL current owner
      const googlResponse = await request(app).get('/stocks/GOOGL');
      const googlCurrentOwner = googlResponse.body.owned;
      const googlNewOwner = googlCurrentOwner === 'user2' ? 'user4' : 'user2';
      
      const response = await request(app)
        .post('/bulk-swap')
        .send({
          operations: [
            {
              stockId: 'MSFT',
              fromUserId: msftCurrentOwner,
              toUserId: msftNewOwner
            },
            {
              stockId: 'GOOGL',
              fromUserId: googlCurrentOwner,
              toUserId: googlNewOwner
            },
            {
              stockId: 'NONEXISTENT',
              fromUserId: 'user1',
              toUserId: 'user2'
            }
          ]
        });
      
      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.results.length, 3);
      
      // Verify first two operations succeeded and the third failed
      assert.equal(response.body.results[0].success, true);
      assert.equal(response.body.results[1].success, true);
      assert.equal(response.body.results[2].success, false);
      
      // Verify stocks were updated
      const updatedMsft = await request(app).get('/stocks/MSFT');
      assert.equal(updatedMsft.body.owned, msftNewOwner);
      
      const updatedGoogl = await request(app).get('/stocks/GOOGL');
      assert.equal(updatedGoogl.body.owned, googlNewOwner);
    });
    
    it('should handle large bulk operations (50 operations)', async () => {
      testStats.testsRun++;
      
      // Generate 50 operations, most valid, some invalid
      const operations = [];
      const stockKeys = Object.keys(TEST_STOCKS);
      
      // First, ensure we have the current ownership data for our stocks
      const stockOwnership: Record<string, string> = {};
      for (let i = 0; i < 45; i++) {
        if (i < stockKeys.length) {
          const stockId = stockKeys[i];
          try {
            // Get the current owner from the API
            const response = await request(app).get(`/stocks/${stockId}`);
            if (response.status === 200) {
              stockOwnership[stockId] = response.body.owned;
            }
          } catch (err) {
            console.error(`Error getting stock ${stockId}:`, err);
          }
        }
      }
      
      // Now create operations with correct ownership information
      for (let i = 0; i < 50; i++) {
        if (i < 45 && i < stockKeys.length) {
          // Valid operations
          const stockId = stockKeys[i];
          const currentOwner = stockOwnership[stockId];
          
          // Make sure we have the owner info and pick a different user as target
          if (currentOwner) {
            const targetUser = currentOwner === 'user1' ? 'user2' : 'user1';
            
            operations.push({
              stockId,
              fromUserId: currentOwner,
              toUserId: targetUser
            });
          }
        } else {
          // Invalid operations
          operations.push({
            stockId: 'INVALID' + i,
            fromUserId: 'user1',
            toUserId: 'user2'
          });
        }
      }
      
      const response = await request(app)
        .post('/bulk-swap')
        .send({ operations });
      
      assert.equal(response.status, 200);
      assert.equal(response.body.results.length, operations.length);
      
      // Count successes and failures
      const successes = response.body.results.filter((r: any) => r.success).length;
      const failures = response.body.results.filter((r: any) => !r.success).length;
      
      assert.equal(successes + failures, operations.length);
      
      // We should have at least as many successes as valid operations we tried to create
      const validOpsCreated = operations.filter(op => stockOwnership[op.stockId]).length;
      assert.ok(successes >= validOpsCreated * 0.9, `Expected at least 90% of valid operations (${validOpsCreated}) to succeed, but only got ${successes}`);
      
      // Add some CPU work and delay
      performHeavyComputation(300000);
      await sleep(100);
    });
  });
  
  // Portfolio tests
  describe('Portfolio Management', () => {
    it('should return correct portfolio for a user', async () => {
      testStats.testsRun++;
      
      // First, ensure some stocks are owned by user1
      const stocksToAssign = ['STOCK0001', 'STOCK0002', 'STOCK0003'];
      
      for (const stockId of stocksToAssign) {
        // Get current owner
        const stockResponse = await request(app).get(`/stocks/${stockId}`);
        const currentOwner = stockResponse.body.owned;
        
        // If not already owned by user1, swap it
        if (currentOwner !== 'user1') {
          await request(app)
            .post('/swap')
            .send({
              stockId,
              fromUserId: currentOwner,
              toUserId: 'user1'
            });
        }
      }
      
      // Now get the portfolio
      const response = await request(app).get('/portfolio/user1');
      
      assert.equal(response.status, 200);
      assert.ok(response.body.userId === 'user1');
      assert.ok(response.body.stockCount >= 3);
      assert.ok(Array.isArray(response.body.stocks));
      assert.ok(response.body.totalValue > 0);
      
      // Verify our assigned stocks are in the portfolio
      for (const stockId of stocksToAssign) {
        const stockInPortfolio = response.body.stocks.find((s: any) => s.id === stockId);
        assert.ok(stockInPortfolio, `Stock ${stockId} should be in user1's portfolio`);
      }
    });
    
    it('should handle portfolio requests for a user with no stocks', async () => {
      testStats.testsRun++;
      
      // Create a user unlikely to own stocks
      const unusualUser = 'user99';
      
      // Get portfolio
      const response = await request(app).get(`/portfolio/${unusualUser}`);
      
      assert.equal(response.status, 200);
      assert.equal(response.body.userId, unusualUser);
      assert.equal(response.body.stocks.length, 0);
      assert.equal(response.body.totalValue, 0);
    });
  });
  
  // Sector analysis tests
  describe('Sector Analysis', () => {
    it('should return correct sector statistics', async () => {
      testStats.testsRun++;
      
      const response = await request(app).get('/sector-stats');
      
      assert.equal(response.status, 200);
      
      // Should have multiple sectors
      const sectorCount = Object.keys(response.body).length;
      assert.ok(sectorCount > 0, 'Expected at least one sector');
      
      // Check Technology sector specifically
      assert.ok(response.body.Technology, 'Expected Technology sector to exist');
      assert.ok(response.body.Technology.count > 0);
      assert.ok(response.body.Technology.totalValue > 0);
      assert.ok(response.body.Technology.avgPrice > 0);
      assert.ok(Array.isArray(response.body.Technology.stocks));
      
      // Add heavy computation to make this test take longer
      performHeavyComputation(500000);
    });
  });
  
  // Performance and load tests
  describe('Performance Tests', () => {
    // Test with different limits
    for (const limit of [10, 50, 100, 200, 500]) {
      it(`should return limited results (limit=${limit})`, async () => {
        testStats.testsRun++;
        
        const response = await request(app).get(`/stocks?limit=${limit}`);
        
        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.ok(response.body.length <= limit);
        
        // Add computation to make larger limit tests take longer
        performHeavyComputation(limit * 1000);
      });
    }
    
    // Test filtering by sector
    for (const sector of ['Technology', 'Finance', 'Healthcare', 'Energy']) {
      it(`should filter stocks by sector (sector=${sector})`, async () => {
        testStats.testsRun++;
        
        const response = await request(app).get(`/stocks?sector=${sector}`);
        
        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));
        
        // All returned stocks should be in the specified sector
        for (const stock of response.body) {
          assert.equal(stock.sector, sector);
        }
        
        // Add some computation to make this test take longer
        performHeavyComputation(200000);
      });
    }
    
    // Test filtering by owner
    for (const owner of ['user1', 'user2', 'user3', 'user4', 'user5']) {
      it(`should filter stocks by owner (owned=${owner})`, async () => {
        testStats.testsRun++;
        
        const response = await request(app).get(`/stocks?owned=${owner}`);
        
        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));
        
        // All returned stocks should be owned by the specified user
        for (const stock of response.body) {
          assert.equal(stock.owned, owner);
        }
        
        // Add computation to make test longer
        performHeavyComputation(100000);
        await sleep(50);
      });
    }
  });
  
  // Test the health endpoints
  describe('Health Endpoints', () => {
    it('should have working readiness endpoint', async () => {
      testStats.testsRun++;
      const response = await request(app).get('/readiness');
      
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { status: 'ready' });
    });
    
    it('should have working liveness endpoint', async () => {
      testStats.testsRun++;
      const response = await request(app).get('/liveness');
      
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { status: 'alive' });
    });
  });
  
  // Complex scenario tests
  describe('Complex Scenarios', () => {
    it('should handle a trading simulation between multiple users', async () => {
      testStats.testsRun++;
      
      // Step 1: Select a set of stocks for the simulation
      const simulationStocks = ['AAPL', 'MSFT', 'GOOGL', 'STOCK0001', 'STOCK0002'];
      
      // Step 2: Get current owners
      const ownershipMap: Record<string, string> = {};
      for (const stockId of simulationStocks) {
        const response = await request(app).get(`/stocks/${stockId}`);
        ownershipMap[stockId] = response.body.owned;
      }
      
      // Step 3: Execute a series of trades
      // User1 and User2 will exchange stocks in a circular fashion
      
      // First, make sure user1 owns at least one stock for trading
      let user1HasStock = false;
      for (const stockId of simulationStocks) {
        if (ownershipMap[stockId] === 'user1') {
          user1HasStock = true;
          break;
        }
      }
      
      if (!user1HasStock) {
        // Give user1 ownership of the first stock
        const stockId = simulationStocks[0];
        const currentOwner = ownershipMap[stockId];
        
        const swapResponse = await request(app)
          .post('/swap')
          .send({
            stockId,
            fromUserId: currentOwner,
            toUserId: 'user1'
          });
        
        assert.equal(swapResponse.status, 200);
        ownershipMap[stockId] = 'user1';
      }
      
      // Execute 10 trades between users
      const users = ['user1', 'user2', 'user3', 'user4'];
      const trades = [];
      
      for (let i = 0; i < 10; i++) {
        // Pick a stock that's owned by one of our users
        let stockId: string | null = null;
        let fromUserId: string | null = null;
        
        for (const sid of simulationStocks) {
          if (users.includes(ownershipMap[sid])) {
            stockId = sid;
            fromUserId = ownershipMap[sid];
            break;
          }
        }
        
        if (!stockId || !fromUserId) continue;
        
        // Pick a different user as the recipient
        const currentUserIndex = users.indexOf(fromUserId);
        const toUserId = users[(currentUserIndex + 1) % users.length];
        
        // Execute the trade
        const response = await request(app)
          .post('/swap')
          .send({
            stockId,
            fromUserId,
            toUserId
          });
        
        assert.equal(response.status, 200);
        trades.push({
          stockId,
          fromUserId,
          toUserId,
          successful: response.status === 200
        });
        
        // Update our ownership map
        ownershipMap[stockId] = toUserId;
        
        // Add some delay and computation
        await sleep(30);
        performHeavyComputation(50000);
      }
      
      // Verify final ownership state
      for (const stockId of simulationStocks) {
        const response = await request(app).get(`/stocks/${stockId}`);
        assert.equal(response.body.owned, ownershipMap[stockId]);
      }
      
      // Verify overall simulation stats
      assert.ok(trades.length > 0);
      const successfulTrades = trades.filter(t => t.successful).length;
      assert.equal(successfulTrades, trades.length);
    });
  });
}); 