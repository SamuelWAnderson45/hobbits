#!/usr/bin/env node

const { readdirSync, unlinkSync } = require('fs')
const { join } = require('path')
const { execFileSync } = require("child_process");
const glob = require('glob');
const filecompare = require('filecompare');

const argv = require('yargs').command('* <hobbits_runner>', 'Tests hobbits processing with known input/output files for various templates', (yargs) => {
    yargs.positional('hobbits_runner', {
        describe: 'the path of the hobbits-runner binary you want to test',
        type: 'string'
    });
}).help().alias('help', 'h').argv;


async function runTests() {
    let tests = 0;
    let failures = 0;
    let successes = 0;
    
    testDirs = readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    
    for (let testDir of testDirs) {
        tests++
        console.log(`Testing ${testDir}...`)
    
        try {
            let input = join(testDir, "input.bits")
            let output = join(testDir, "output.bits")
            let testOutputPrefix = join(testDir, "testrunoutput.")
            let testOutputGlob = testOutputPrefix+"*"
            let templateGlob = join(testDir, "*.hobbits_template")
            let templateMatches = glob.sync(templateGlob, {nonull: false})
            if (templateMatches.length < 1) {
                throw Error(`Failed to find a test template file matching ${templateGlob}`)
            }
            let template = templateMatches[0]

            let testOutputMatches = glob.sync(testOutputGlob, {nonull: false})
            for (let oldOutput of testOutputMatches) {
                unlinkSync(oldOutput)
            }
    
            execFileSync(argv.hobbits_runner, [
                'run',
                '-t', template,
                '-i', input,
                '-o', testOutputPrefix
            ], {stdio: 'inherit'});
    
            testOutputMatches = glob.sync(testOutputGlob, {nonull: false})
            if (testOutputMatches.length < 1) {
                throw Error(`Failed to find an output file matching ${testOutputGlob}`)
            }
            let testOutput = testOutputMatches[0]
    
            let match = await new Promise((resolve, reject) => {
                filecompare(output, testOutput, isEqual => resolve(isEqual))
            })
    
            if (match) {
                successes++;
                console.log("=> PASS");
            }
            else {
                failures++;
                console.log("=> FAIL");
            }
    
        } catch (err) {
            console.error(`=> ERROR: ${err}`)
            failures++;
        }
    
    }
    
    console.log(`Finished running ${tests} tests`)
    console.log(`Successes: ${successes}`)
    console.log(`Failures: ${failures}`)
    
    if (failures > 0) {
        return -1
    }
    
    if (tests < 1) {
        console.log("Treating lack of tests as failure...")
        return -1
    }

    return 0
}

runTests()
.then(val => process.exitCode = val)
.catch((err) => {
    console.error(err)
    process.exitCode = -1
})