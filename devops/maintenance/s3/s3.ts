import {
	s3
} from "@monorepo/integrations";

const {
	cleanUpOldBlobs,
	initClient,
	moveLargeBlobsToGlacier,
	stopHungUploads,
} = s3;

export async function main() {
	console.log("Starting maintenance script for s3");
	await initClient();
	console.log("Moving large blobs to glacier");
	await moveLargeBlobsToGlacier();
	console.log("Cleaning up old blobs");
	await cleanUpOldBlobs();
}

export async function cleanup() {
	console.log("Cleaning up half performed maintenance for s3");
	await stopHungUploads();
}
