import * as fs from "node:fs";
import * as path from "node:path";
import {
	healthLoggingMiddleware,
	registerHealthChecks,
} from "@monorepo/health";
import { Logger } from "@monorepo/logger";
import express, { type Request, type Response } from "express";

// Initialize logger
const logger = new Logger("user-service");

// Initialize Express app
const app = express();

// Add JSON middleware
app.use(express.json());

// Register health checks
registerHealthChecks(app);

// Add middleware
app.use(healthLoggingMiddleware());

// Load user data
const userDataPath = path.join(__dirname, "user.json");
let users: Record<string, any>;

try {
	const userData = fs.readFileSync(userDataPath, "utf-8");
	users = JSON.parse(userData);
	logger.info("User data loaded successfully");
} catch (error) {
	logger.error("Failed to load user data", error);
	users = {};
}

// API routes
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "User Service API" });
});

// Get all users
app.get("/users", (req: Request, res: Response) => {
	res.json(users);
});

// Get user by ID
app.get("/users/:id", (req: Request, res: Response) => {
	const id = req.params.id;
	const user = users[id];

	if (!user) {
		logger.warn(`User not found: ${id}`);
		return res.status(404).json({ error: "User not found" });
	}

	logger.info(`User retrieved: ${id}`);
	res.json(user);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	logger.info(`User service starting on port ${PORT}`);
});
