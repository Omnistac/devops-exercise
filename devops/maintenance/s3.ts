import { sleep } from "./utils";

async function main() {
    console.log('Starting maintenance script for s3');
    await sleep(1000);
    console.log('Moving large blobs to glacier')
    await sleep(2000);
    console.log('Cleaning up old blobs')
    await sleep(3000);
}

main().then(() => {
    console.log('Maintenance script completed');
}).catch((error) => {
    console.error('Maintenance script failed', error);
});

