import { sleep } from "./utils";


async function main() {
    console.log('Starting maintenance script');
    await sleep(1000);
    console.log('Modifying index triggers')
    await sleep(1000);
    console.log('Updating indexes')
    await sleep(2000);
    console.log('Vacuuming database')
    await sleep(3000);
}

main().then(() => {
    console.log('Maintenance script completed');
}).catch((error) => {
    console.error('Maintenance script failed', error);
});