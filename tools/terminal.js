#!/usr/bin/node

/**
 * A cli tool to comunicate over a line based software serial interface
 */

const readline = require('readline');
const RinkLink = require('../index');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
});

try {
    const link = new RinkLink();

    rl.prompt();
    rl.on('line', l => {
        link.send(l);
        rl.prompt(true);
    })

    rl.on('close', () => {
        rl.setPrompt('');
        rl.clearLine();
        rl.write("bye.\n");
        process.exit(0);
    });

    link.subscribe(message => {
        rl.pause();
        rl.clearLine();
        rl.write(`< ${message.map(b => String.fromCharCode(b)).reduce((c, a) => c + a)}\n`);
    })
} catch (e) {
    console.error(e.message);
    process.exit(-1);
}
