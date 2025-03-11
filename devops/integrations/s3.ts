import { sleep } from "./utils";

const initClient = async () => {
	await sleep(1000);
};

const moveLargeBlobsToGlacier = async () => {
	await sleep(8000);
};

const cleanUpOldBlobs = async () => {
	await sleep(10000);
};

const stopHungUploads = async () => {
	await sleep(8000);
};

export {
	initClient,
	moveLargeBlobsToGlacier,
	cleanUpOldBlobs,
	stopHungUploads,
};
