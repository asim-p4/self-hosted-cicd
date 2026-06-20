import { deployer } from "../deploy/deployer.js";
import { getContext } from "../utils/context.js";
import { sendFailureEmail } from "./emailService.js";
import { setCommitStatus } from "./githubStatus.js";
import { loadConfig } from "./loadConfig.js";

const queue = [];
let isProcessing = false;
const config = loadConfig();

export function addToQueue() {
  const { repoName, repoFullName, commitSha, branch, commitMessage, author } =
    getContext();
  queue.push({
    repoName,
    repoFullName,
    commitSha,
    branch,
    commitMessage,
    author,
    addedAt: new Date(),
  });
  console.log(`📥 Queued: ${repoName} (Position: ${queue.length})`);
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  if (queue.length === 0) return;

  isProcessing = true;
  const { repoName, repoFullName, commitSha, branch, commitMessage, author } =
    queue.shift();

  console.log(`🚀 Processing: ${repoName}, Enviroment:${branch}`);

  try {
    // 1. BRANCH CHECK
    const project = config.projects.find(
      (p) => p.name === repoName && p.branch === branch,
    );

    if (!project) {
      const error = new Error(
        `No configuration found for project: ${repoName}`,
      );
      error.failedStep = "config lookup";
      throw error;
    }

    // 2. SET PENDING STATUS (ONLY after branch check passes)
    await setCommitStatus(
      repoFullName,
      commitSha,
      "pending",
      `${repoName} deployment in progress...`,
    );

    // 3. RUN DEPLOYMENT
    const result = await deployer(repoName, project);

    if (result.success) {
      console.log(`✅ Completed: ${repoName}, Enviroment:${branch}`);
      await setCommitStatus(
        repoFullName,
        commitSha,
        "success",
        `${repoName} Deployment completed successfully!`,
      );
    }
  } catch (error) {
    const errMsg = typeof error === "string" ? error : error.message;
    console.error(`❌ Failed: ${repoName} - ${error.message}}`);
    await setCommitStatus(repoFullName, commitSha, "failure", error.message);

    await sendFailureEmail({
      repoName: repoFullName,
      branch: branch,
      commitSha: commitSha,
      commitMessage: commitMessage || "No commit message",
      author: author || "Unknown",
      failedStep: error.failedStep || "unknown",
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    isProcessing = false;
    processQueue();
  }
}

export function getQueueStatus() {
  return {
    queued: queue.length,
    isProcessing: isProcessing,
    currentJob: isProcessing ? "processing" : "idle",
  };
}
