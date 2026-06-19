import { chdir } from "process";

import { runCommand } from "../../functions/runCommand.js";

export async function s3Deploy(config) {
  const { localPath, commands } = config;
  let failedStep = null;

  try {
    console.log(`💻 Deploying from ${localPath}`);
    chdir(localPath);

    const script = `bash << 'EOF'
set -e
${commands.join("\n")}
EOF`;

    await runCommand(script);

    return { success: true };
  } catch (error) {
    throw error;
  }
}
