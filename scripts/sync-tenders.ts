import { syncTedTenders } from "../src/connectors/ted";

const result = await syncTedTenders(100);
console.log(`Synchronized ${result.upserted} official TED notices.`);
