import {
	kafka,
} from "@monorepo/integrations";

const {
	initClient,
	cleanTopic,
	cleanupTopics,
	validateCleaned,
	stopConsumers,
	KAFKA_TOPICS_TO_CLEAN
} = kafka;

export async function main() {
	console.log("Starting maintenance script for kafka");
	await initClient();
	console.log("Cleaning kafka topics");
	for (const topic of KAFKA_TOPICS_TO_CLEAN) {
		await cleanTopic(topic);
	}
	console.log("Asserting kafka topics are cleaned");
	await validateCleaned();
}

export async function cleanup() {
	console.log("Cleaning up half performed maintenance for kafka");
	await cleanupTopics();
	console.log("Stopping hung kafka consumers");
	await stopConsumers();
}
