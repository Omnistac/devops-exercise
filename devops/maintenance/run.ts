import chalk from "chalk";
import { program } from "commander";

import { $ } from "execa";
import { main as database, cleanup as databaseCleanup } from "./database";
import { main as kafka, cleanup as kafkaCleanup } from "./kafka";
import { main as s3, cleanup as s3Cleanup } from "./s3";

const { green, yellow } = chalk;

// This script is used to run maintenance and orchestrate the deployment of the services

program
	.option("-v, --verbose", "Verbose output")
	.option("-c, --cleanup", "Run maintenance in cleanup mode")
	.parse(process.argv);

const options = program.opts();

const debug = options.verbose ? console.debug : () => {};
const log = console.log;

log(green("🚧 Running maintenance"));

if (options.cleanup) {
	debug(yellow("🔧 Running database cleanup"));
	await databaseCleanup();
	debug(green("✅ Database cleanup completed"));
} else {
	debug(green("🔧 Running database maintenance"));
	await database();
	debug(green("✅ Database maintenance completed"));
}

if (options.cleanup) {
	debug(yellow("🔧 Running kafka cleanup"));
	await kafkaCleanup();
	debug(green("✅ Kafka cleanup completed"));
} else {
	debug(green("🔧 Running kafka maintenance"));
	await kafka();
	debug(green("✅ Kafka maintenance completed"));
}

if (options.cleanup) {
	debug(yellow("🔧 Running s3 cleanup"));
	await s3Cleanup();
	debug(green("✅ S3 cleanup completed"));
} else {
	debug(green("🔧 Running s3 maintenance"));
	await s3();
	debug(green("✅ S3 maintenance completed"));
}

log(green("🎉 Maintenance completed"));
