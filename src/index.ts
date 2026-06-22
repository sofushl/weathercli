import { cacheFirst } from "./cache.js";
import { Scope } from "./weatherFetcher.js";

async function main() {
  const city = process.argv[2].toLowerCase();
  const scope = process.argv[3] ? process.argv[3].toLowerCase() : "current";

  if (!city) {
    console.error("Usage: node dist/index.js <city>");
    process.exit(1);
  }

  if (!((scope as Scope) == scope)) {
    console.error("Usage: npm start <city> <current or forecast>");
    process.exit(1);
  }

  cacheFirst(city, scope);
}

main();
