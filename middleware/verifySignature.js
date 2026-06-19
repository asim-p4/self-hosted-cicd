import crypto from "crypto";

export const verifySignature = (req, res, next) => {
    console.log("veriying");
    
  const givenSignature = req.headers["x-hub-signature-256"];

  if (!givenSignature) {
    return res.status(403).json({ error: "invalid signature" });
  }

  const calculatedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

  if (givenSignature !== calculatedSignature) {
    return res.status(403).json({ error: "invalid signature" });
  }
  next();
};
