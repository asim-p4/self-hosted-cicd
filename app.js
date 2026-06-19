import express from "express";

import { rateLimit } from "./middleware/rateLimit.js";
import { verifySignature } from "./middleware/verifySignature.js";
import { addToQueue, getQueueStatus } from "./functions/deploymentQueue.js";
import { isDuplicate } from "./functions/duplicateDelivery.js";
import { runWithContext } from "./utils/context.js";

const app = express();
app.use(express.json({ limit: "500kb" }));
app.use(rateLimit);

app.get("/queue-status", (req, res) => {
  res.json(getQueueStatus());
});

app.post("/github-webhook", verifySignature, (req, res) => {
  const deliveryId = req.headers["x-github-delivery"];

  const contextData = {
    repoFullName: req.body.repository.full_name,
    repoName: req.body.repository.name,
    commitSha: req.body.after,
    branch: req.body.ref?.replace("refs/heads/", ""),
    commitMessage: req.body.head_commit?.message || "No commit message",
    author: req.body.pusher?.name || req.body.sender?.login || "Unknown",
    deliveryId: req.headers["x-github-delivery"],
    startTime: new Date(),
  };

  if (isDuplicate(deliveryId)) {
    return res.json({ message: "Already processed" });
  }

  runWithContext(contextData, async () => {
    addToQueue();

    res.json({ message: "Queued" });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started at http://localhost:4000`);
});
