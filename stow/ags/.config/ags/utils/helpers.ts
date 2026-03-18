import { execAsync } from "ags/process";

/**
 * Run a shell command asynchronously and return trimmed stdout.
 * Returns `fallback` if the command fails or returns empty output.
 */
export async function sh(command: string, fallback = ""): Promise<string> {
  try {
    const result = await execAsync(["bash", "-c", command]);
    return result.trim() || fallback;
  } catch {
    return fallback;
  }
}
