import { spawn } from "child_process";

export function runCommand(command) {
  return new Promise((resolve, reject) => {
    // console.log(`🔧 Running: ${command}`);

    try {
      const childprocess = spawn("bash", ["-c", command], {
        env: process.env,
      });

      childprocess.stdout.on("data", (data) => {
        process.stdout.write(data);
      });

      childprocess.stderr.on("data", (data) => {
        process.stderr.write(data);
      });

      childprocess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}: ${command}`));
        }
      });

      childprocess.on("error", (err) => {
        reject(new Error(`Command couldn't start: ${err}`));
      });
    } catch (error) {
      console.log("run command catch error");
      reject(error);
    }
  });
}
