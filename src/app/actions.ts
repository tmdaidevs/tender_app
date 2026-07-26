"use server";

import { revalidatePath } from "next/cache";
import { syncTedTenders } from "@/connectors/ted";
import { requireUser } from "@/lib/auth";

export async function syncPublicTenders() {
  const user = await requireUser();
  if (user.platformRole !== "platform_admin") {
    throw new Error("Only platform administrators may synchronize public tenders");
  }
  await syncTedTenders(100);
  revalidatePath("/");
}
