import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@monorepo/integrations";
import { cleanup, main } from "./database.js";

vi.mock("@monorepo/integrations", () => ({
    db: {
        initClient: vi.fn(),
        modifyIndexTriggers: vi.fn(),
        updateIndexes: vi.fn(),
        vacuumDatabase: vi.fn(),
        checkForDeadlocks: vi.fn(),
        stopHungQueries: vi.fn(),
    }
}));

describe("Database", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    it("should run the database maintenance tasks in order", async () => {
        await main();
        expect(db.initClient).toHaveBeenCalled();
        expect(db.modifyIndexTriggers).toHaveBeenCalled();
        expect(db.updateIndexes).toHaveBeenCalled();
        expect(db.vacuumDatabase).toHaveBeenCalled();
        expect(db.checkForDeadlocks).toHaveBeenCalled();
    });

    it("should run the database cleanup tasks in order", async () => {
        await cleanup();
        expect(db.stopHungQueries).toHaveBeenCalled();
        expect(db.checkForDeadlocks).toHaveBeenCalled();
    });
});
