import { cac } from "cac";
import { generator } from "./generator";

const cli = cac();
cli
  .command(
    "generate <path>",
    "Generate story. \n  plz enter the relative path up to component file."
  )
  .action((path) => {
    console.log("option", path);
    // generator(path);
  });

cli.help();
cli.parse();
