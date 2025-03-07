import express, { Request, Response } from 'express';
import { Logger } from '@monorepo/logger';
import { registerHealthChecks, healthLoggingMiddleware } from '@monorepo/health';
import * as fs from 'fs';
import * as path from 'path';

// Initialize logger
const logger = new Logger('trading-service');

// Initialize Express app
const app = express();

// Add JSON middleware
app.use(express.json());

// Register health checks
registerHealthChecks(app);

// Add middleware
app.use(healthLoggingMiddleware());

// Load stocks data
const stocksDataPath = path.join(__dirname, 'stocks.json');
let stocks: Record<string, any>;

try {
  const stocksData = fs.readFileSync(stocksDataPath, 'utf-8');
  stocks = JSON.parse(stocksData);
  logger.info('Stocks data loaded successfully');
} catch (error) {
  logger.error('Failed to load stocks data', error);
  stocks = {};
}

// API routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Trading Service API' });
});

// Get all stocks
app.get('/stocks', (req: Request, res: Response) => {
  res.json(stocks);
});

// Get stock by ID
app.get('/stocks/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const stock = stocks[id];
  
  if (!stock) {
    logger.warn(`Stock not found: ${id}`);
    return res.status(404).json({ error: 'Stock not found' });
  }
  
  logger.info(`Stock retrieved: ${id}`);
  res.json(stock);
});

// Swap stock ownership between users
app.post('/swap', (req: Request, res: Response) => {
  try {
    const { stockId, fromUserId, toUserId } = req.body;
    
    if (!stockId || !fromUserId || !toUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const stock = stocks[stockId];
    
    if (!stock) {
      logger.warn(`Stock not found: ${stockId}`);
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    if (stock.owned !== fromUserId) {
      logger.warn(`Stock ${stockId} is not owned by user ${fromUserId}`);
      return res.status(400).json({ error: 'Stock is not owned by the specified user' });
    }
    
    // Update ownership
    stock.owned = toUserId;
    
    // Save updated stocks data
    fs.writeFileSync(stocksDataPath, JSON.stringify(stocks, null, 2), 'utf-8');
    
    logger.info(`Stock ${stockId} transferred from ${fromUserId} to ${toUserId}`);
    res.json({ 
      success: true,
      message: `Stock ${stockId} transferred from ${fromUserId} to ${toUserId}`,
      stock
    });
  } catch (error) {
    logger.error('Error processing swap request', error);
    res.status(500).json({ error: 'Failed to process swap request' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Trading service starting on port ${PORT}`);
});
