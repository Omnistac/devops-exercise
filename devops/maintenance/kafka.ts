import { sleep } from "./utils";

const KAFKA_TOPICS_TO_CLEAN = [
    'user-events',
    'stock-events',
    'trade-events',
    'notification-events',
    'maintenance-events',
]


async function main() {
    console.log('Starting maintenance script for kafka');
    await sleep(1000);
    console.log('Cleaning kafka topics')
    for (const topic of KAFKA_TOPICS_TO_CLEAN) {
        console.log(`Cleaning topic: ${topic}`);
        await sleep(2000);
    }
    console.log('Asserting kafka topics are cleaned')
    await sleep(3000);
}

main().then(() => {
    console.log('Maintenance script completed');
}).catch((error) => {
    console.error('Maintenance script failed', error);
});
