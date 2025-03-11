import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Logger } from "./lib";

describe("Logger Module", () => {
	let originalConsoleLog: typeof console.log;
	let loggedMessages: string[] = [];

	beforeEach(() => {
		// Save original console.log
		originalConsoleLog = console.log;
		// Replace console.log with a function that stores messages
		console.log = (...args: any[]) => {
			loggedMessages.push(args[0]);
		};
	});

	afterEach(() => {
		// Restore original console.log
		console.log = originalConsoleLog;
		// Clear logged messages
		loggedMessages = [];
	});

	describe("Constructor", () => {
		it("should use default context if not provided", () => {
			const logger = new Logger();
			logger.info("test message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.context, "app");
		});

		it("should use provided context", () => {
			const logger = new Logger("custom-context");
			logger.info("test message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.context, "custom-context");
		});
	});

	describe("Log Methods", () => {
		let logger: Logger;

		beforeEach(() => {
			logger = new Logger("test");
		});

		it("should log info messages with correct level", () => {
			logger.info("info message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.level, "INFO");
			assert.equal(loggedData.message, "info message");
		});

		it("should log error messages with correct level", () => {
			logger.error("error message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.level, "ERROR");
			assert.equal(loggedData.message, "error message");
		});

		it("should log warn messages with correct level", () => {
			logger.warn("warning message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.level, "WARN");
			assert.equal(loggedData.message, "warning message");
		});

		it("should log debug messages with correct level", () => {
			logger.debug("debug message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.equal(loggedData.level, "DEBUG");
			assert.equal(loggedData.message, "debug message");
		});

		it("should include additional data if provided", () => {
			const additionalData = { key: "value", num: 123 };
			logger.info("message with data", additionalData);

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.deepEqual(loggedData.data, additionalData);
		});

		it("should include timestamp and pid in all logs", () => {
			logger.info("test message");

			assert.equal(
				loggedMessages.length,
				1,
				"Expected one message to be logged",
			);

			const loggedData = JSON.parse(loggedMessages[0]);
			assert.ok(loggedData.timestamp, "Expected timestamp to be present");
			assert.ok(loggedData.pid, "Expected pid to be present");

			// Validate timestamp is a valid ISO string
			assert.doesNotThrow(() => new Date(loggedData.timestamp));

			// Validate pid is a number
			assert.equal(typeof loggedData.pid, "number");
		});
	});
});
