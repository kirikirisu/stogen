import { cac } from "cac";
import { generator } from "./generator";

const cli = cac();
cli
  .command(
    "generate <path>",
    "Generate CSF. \n  plz enter the relative path up to component file."
  )
  .action((path) => {
    generator(path);
  });

cli.help();
cli.parse();
