import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export function loadConfig() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const configPath = join(__dirname, "../deploy/config.json");
    const configFile = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configFile);
    console.log(`🔄 Config loaded - ${config.projects.length} projects`);
    return config;
  } catch (error) {
    console.error("❌ Failed to reload config:", error.message);
    process.exit(1);
  }
}
