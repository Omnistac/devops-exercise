import {
	db
} from "@monorepo/integrations";

const {
	initClient,
	modifyIndexTriggers,
	updateIndexes,
	vacuumDatabase,
	checkForDeadlocks,
	stopHungQueries
} = db;

export async function main() {
	console.log("Starting maintenance script");
	await initClient();
	console.log("Modifying index triggers");
	await modifyIndexTriggers();
	console.log("Updating indexes");
	await updateIndexes();
	console.log("Vacuuming database");
	await vacuumDatabase();
	console.log("Checking for deadlocks");
	await checkForDeadlocks();
}

export async function cleanup() {
	console.log("Cleaning up half performed maintenance");
	await checkForDeadlocks();
	console.log("Stopping hung queries");
	await stopHungQueries();
}
