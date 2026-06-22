import { cacheFirst } from "./cache.js";
import { Scope } from "./weatherFetcher.js";

async function main() {
  const allArgs: string[] = process.argv.slice(2).map((a) => a.toLowerCase());

  const cities: string[] = allArgs.filter((a) => a.charAt(0).match(/[a-z]/i));

  const args: string[] = allArgs
    .filter((a) => !a.charAt(0).match(/[a-z]/i))
    .map((a) => a.slice(1, a.length));

  if (!cities[0]) {
    console.error("Usage: node dist/index.js <city>");
    process.exit(1);
  }

  let scope: Scope = "current";

  try {
    scope = args.includes("current")
      ? "current"
      : args.includes("forecast")
        ? "forecast"
        : "current";
  } catch {
    console.error("Usage: npm start <city> --<current or forecast>");
    process.exit(1);
  }

  cities.forEach((city) => cacheFirst(city, scope));
}

main();
