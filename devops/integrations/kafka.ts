import { sleep } from "./utils";

const cleanTopic = async (topic: string) => {
	console.log(`Cleaning topic: ${topic}`);
	await sleep(2000);
};

const initClient = async () => {
	await sleep(1000);
};

const validateCleaned = async () => {
	await sleep(8000);
};

const cleanupTopics = async () => {
	await sleep(1000);
};

const stopConsumers = async () => {
	await sleep(2000);
};

const KAFKA_TOPICS_TO_CLEAN = [
	"user-events",
	"stock-events",
	"trade-events",
	"notification-events",
	"maintenance-events",
];

export {
	cleanTopic,
	initClient,
	validateCleaned,
	cleanupTopics,
	stopConsumers,
	KAFKA_TOPICS_TO_CLEAN,
};
