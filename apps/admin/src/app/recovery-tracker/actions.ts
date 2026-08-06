"use server";

import {
  revalidatePath,
} from "next/cache";

export async function refreshRecoveryTracker(): Promise<void> {
  revalidatePath("/recovery-tracker");
}
