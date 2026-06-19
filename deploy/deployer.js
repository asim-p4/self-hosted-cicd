import { ec2Deploy } from "./strategies/ec2-deploy.js";
import { s3Deploy } from "./strategies/s3-deploy.js";

export async function deployer(repoName, project) {
  console.log(`🚀 Deploying ${repoName} using strategy: ${project.type}`);

  // Route to appropriate strategy
  switch (project.type) {
    case "ssh-deploy":
      return await ec2Deploy(project.config);

    case "s3-deploy":
      return await s3Deploy(project.config);

    default:
      throw new Error(`Unknown deployment type: ${project.type}`);
  }
}
