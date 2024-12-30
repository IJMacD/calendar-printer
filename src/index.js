import path from "path";
import commandLineArgs from "command-line-args";
import { printWeekly } from "./weekly.js";
import { printFourWeeks } from "./fourWeeks.js";

const optionDefinitions = [
  { name: "date", alias: "d", type: (/** @type {string} */ d) => new Date(d) },
  {
    name: "output",
    alias: "o",
    type: String,
    defaultOption: true,
    defaultValue: "job.pdf",
  },
  {
    name: "mode",
    alias: "m",
    type: String,
    multiple: true,
    defaultValue: ["weekly"],
  },
];
const options = commandLineArgs(optionDefinitions);

const filenamePattern =
  options.mode.length > 1
    ? generateFilenamePattern(options.output)
    : options.output;

for (const mode of options.mode) {
  const filename = filenamePattern.replace("%s", mode);

  switch (mode) {
    case "daily":
      console.log("Daily is not implemented");
      break;
    case "weekly":
      printWeekly(filename, options.date);
      break;
    case "four-weeks":
    case "four-weekly":
      printFourWeeks(filename, options.date);
      break;
    case "monthly":
      console.log("Monthly is not implemented");
      break;
    default:
      console.log(`Unknown mode: ${mode}`);
  }
}

/**
 * @param {string} filename
 */
function generateFilenamePattern(filename) {
  const ext = path.extname(filename);
  const base = filename.substring(0, filename.length - ext.length);
  return `${base}-%s${ext}`;
}
