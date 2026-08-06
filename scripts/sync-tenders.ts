import { syncTedTenders } from "../src/connectors/ted";

async function main() {
  const result = await syncTedTenders(500);
  console.log(`Synchronized ${result.upserted} of ${result.fetched} official TED notices.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Tender synchronization failed");
  process.exitCode = 1;
});
