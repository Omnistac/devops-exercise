import type { Application, NextFunction, Request, Response } from "express";

/**
 * Simple health check module
 * Provides readiness and liveness probes for Kubernetes
 */
export function registerHealthChecks(app: Application): void {
	// Readiness probe
	app.get("/readiness", (req: Request, res: Response) => {
		res.json({ status: "ready" });
	});

	// Liveness probe
	app.get("/liveness", (req: Request, res: Response) => {
		res.json({ status: "alive" });
	});
}

// Middleware for health logging
export function healthLoggingMiddleware() {
	return (req: Request, res: Response, next: NextFunction) => {
		const start = Date.now();

		// Add listener for when response finishes
		res.on("finish", () => {
			const end = Date.now();

			// Only log health-related endpoints
			if (req.path.includes("/readiness") || req.path.includes("/liveness")) {
				console.log(`Health check: ${req.path} - ${end - start}ms`);
			}
		});

		next();
	};
}
