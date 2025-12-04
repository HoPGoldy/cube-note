import { parentPort, workerData } from "node:worker_threads";
console.log("workerData", workerData);

console.log(`[Worker] PID: ${process.pid}`);
console.log(`[Worker] process.execPath: ${process.execPath}`);
console.log("[Worker] execArgv:", process.execArgv);
console.log(`[Worker] process.argv:`, process.argv);

parentPort?.on("message", (task) => {
  console.log(`[Worker] 收到任务: 计算 ${task.num} 的平方`);

  parentPort?.postMessage({
    status: "completed",
    input: task.num,
    result: task.num * task.num,
  });

  parentPort?.close();
});
