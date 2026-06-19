export async function setCommitStatus(
  repoFullName,
  commitSha,
  state,
  description,
) {
  const [owner, repo] = repoFullName.split("/");

  const url = `https://api.github.com/repos/${owner}/${repo}/statuses/${commitSha}`;

  const body = {
    state: state, // "pending", "success", "failure", "error"
    description: description,
    context: "CICD-Server", // Name that appears on GitHub
    target_url: null, // Optional: link to your server logs
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.log(
        `✅ GitHub status updated: ${state} for ${commitSha.substring(0, 7)}`,
      );
    } else {
      const error = await response.text();
      console.error(`❌ GitHub status failed: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.error(`❌ Failed to call GitHub API: ${error.message}`);
  }
}
