#!/usr/bin/env node

const program = require('commander');

program
    //.option('-i, --input [filepath]', 'Path to Excel Sheet')
    .parse(process.argv);
const jsgitflow = require('../index.js')
jsgitflow.main();