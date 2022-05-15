const Astrolabicon = require('./Astrolabicon');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const game = new Astrolabicon();

function gameStep() {
    const loops = game.getLoops();
    console.log('Astrolabicon loops:');
    game.print();
    console.log('Options:');
    console.log('\tr: Rotate clockwise');
    console.log('\tl: Rotate counterclockwise');
    const pushActions = {};
    loops.forEach((loop, i) => {
        console.log(`\t${i}f: Push loop ${i} forward`);
        pushActions[i + 'f'] = () => game.pushLoop(loop, true);
        console.log(`\t${i}b: Push loop ${i} backward`);
        pushActions[i + 'b'] = () => game.pushLoop(loop, false);
    });
    console.log('\tq: exit');
    function promptUser() {
        rl.question('Input:', (input) => {
            if (input in pushActions) {
                pushActions[input]();
            }
            else {
                switch(input.toLowerCase()) {
                    case 'r':
                        game.rotate(1);
                        break;
                    case 'l':
                        game.rotate(-1);
                        break;
                    case 'q': 
                        console.log('Exiting...');
                        rl.close();
                        process.exit(0);
                    default:
                        console.log(`Unsupported option '${input}'`);
                        promptUser();
                        return;
                }
            }
            gameStep();
        });
    }
    promptUser();
}
gameStep();
