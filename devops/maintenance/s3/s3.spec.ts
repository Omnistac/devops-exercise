import { describe, it, expect, vi, beforeEach } from "vitest";
import { s3 } from "@monorepo/integrations";
import { cleanup, main } from "./s3.js";

vi.mock("@monorepo/integrations", () => ({
    s3: {
        initClient: vi.fn(),
        cleanUpOldBlobs: vi.fn(),
        moveLargeBlobsToGlacier: vi.fn(),
        stopHungUploads: vi.fn(),
    }
}));

describe("S3", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should run the s3 maintenance tasks in order", async () => {
		await main();
		expect(s3.initClient).toHaveBeenCalled();
		expect(s3.moveLargeBlobsToGlacier).toHaveBeenCalled();
		expect(s3.cleanUpOldBlobs).toHaveBeenCalled();
	});

    it("should run the s3 cleanup tasks in order", async () => {
        await cleanup();
        expect(s3.stopHungUploads).toHaveBeenCalled();
    });
});
