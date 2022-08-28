"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cac_1 = require("cac");
const generator_1 = require("./generator");
const cli = (0, cac_1.cac)();
cli
    .command("generate <path>", "Generate CSF. \n  plz enter the relative path up to component file.")
    .action((path) => {
    (0, generator_1.generator)(path);
});
cli.help();
cli.parse();
