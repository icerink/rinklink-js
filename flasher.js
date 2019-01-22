#!/usr/bin/node

/**
 * A cli tool to flash new fpga configurations via rinklink.
 */

const fs = require('fs');
const RinkLink = require('./index');

if (process.argv.length !== 3) {
    console.error("filename missing!")
    console.info(`usage: \n\t${process.argv[1]} <filename>`);
    process.exit(-1);
}

try {
    const to_flash = fs.readFileSync(process.argv[2], null).buffer;

    const link = new RinkLink();

    console.log("rebooting target...")
    link.command("r");

    console.log(`flashing image '${process.argv[2]}' ...`)
    link.send(Array.from(to_flash));

    console.log("done :)")
    process.exit(0);

} catch (e) {
    console.error(e.message);
    process.exit(-1);
}
