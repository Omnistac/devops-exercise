import { sleep } from "./utils";

const modifyIndexTriggers = async () => {
	await sleep(5000);
};

const updateIndexes = async () => {
	await sleep(8000);
};

const stopHungQueries = async () => {
	await sleep(8000);
};

const checkForDeadlocks = async () => {
	await sleep(4000);
	if (Math.random() < 1 / 3) {
		throw new Error("Deadlock detected");
	}
};

const vacuumDatabase = async () => {
	await sleep(3000);
};

const initClient = async () => {
	await sleep(1000);
};

export {
	modifyIndexTriggers,
	updateIndexes,
	stopHungQueries,
	checkForDeadlocks,
	vacuumDatabase,
	initClient,
};
