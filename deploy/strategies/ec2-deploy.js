import { runCommand } from "../../functions/runCommand.js";

export async function ec2Deploy(config) {
  const { sshHost, remotePath, commands } = config;
  let step;
  try {
    const sshScript = `ssh ${sshHost} 'bash' << 'EOF'
set -e
cd ${remotePath}
${commands.join("\n")}
EOF`;

    await runCommand(sshScript);
    return { success: true };
  } catch (error) {
    throw error;
  }
}
