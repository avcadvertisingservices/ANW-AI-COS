#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("anw")
  .description("ANW AI Content Operating System CLI")
  .version("0.1.0");

program
  .command("hello")
  .description("Test the CLI")
  .action(() => {
    console.log("");
    console.log("🧠 Welcome to the ANW AI-COS CLI!");
    console.log("You Are Not Alone.");
    console.log("");
  });

program.parse();