import { describe, it, expect, vi, beforeEach } from "vitest";
import { kafka } from "@monorepo/integrations";
import { cleanup, main } from "./kafka.js";

vi.mock("@monorepo/integrations", () => ({
    kafka: {
        initClient: vi.fn(),
        cleanTopic: vi.fn(),
        cleanupTopics: vi.fn(),
        validateCleaned: vi.fn(),
        stopConsumers: vi.fn(),
        KAFKA_TOPICS_TO_CLEAN: ["topic1", "topic2"]
    }
}));

describe("Kafka", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    it("should run the kafka maintenance tasks in order", async () => {
        await main();
        expect(kafka.initClient).toHaveBeenCalled();
        expect(kafka.cleanTopic).toHaveBeenCalledTimes(2);
        expect(kafka.validateCleaned).toHaveBeenCalled();
    });

    it("should run the kafka cleanup tasks in order", async () => {
        await cleanup();
        expect(kafka.cleanupTopics).toHaveBeenCalled();
        expect(kafka.stopConsumers).toHaveBeenCalled();
    });
});
