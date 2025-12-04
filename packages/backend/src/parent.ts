import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";

const sharedBuffer = new SharedArrayBuffer(4);
console.log("sharedBuffer", sharedBuffer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taskTsFile = path.join(__dirname, "worker.ts");

// cron.schedule("* * * * * *", taskTsFile);

import { Worker } from "node:worker_threads";

// 2. 创建一个新的工作线程
//    第一个参数是工作线程脚本的路径
const worker = new Worker(
  `import('tsx/esm/api').then(({ register }) => { register(); import('${taskTsFile}') })`,
  {
    eval: true,
    workerData: {
      sharedBuffer: sharedBuffer, // 尝试传递
    },
  },
);

console.log(`[Main] PID: ${process.pid}`);
console.log(`[Main] process.execPath: ${process.execPath}`);
console.log("[Main] execArgv:", process.execArgv);
console.log(`[Main] process.argv:`, process.argv);

console.log("[Main] 主线程启动，已创建工作线程。");

// 3. 监听来自工作线程的消息
worker.on("message", (result) => {
  console.log(`[Main] 收到结果: ${result.input} 的平方为 ${result.result}`);
});

// 4. 监听工作线程的错误事件
worker.on("error", (err) => {
  console.error("[Main] 工作线程出错:", err);
  worker.terminate();
});

// 5. 监听工作线程的退出事件
worker.on("exit", (code) => {
  if (code !== 0) {
    console.error(`[Main] 工作线程异常退出，退出码: ${code}`);
  } else {
    console.log("[Main] 工作线程已正常退出。");
  }
});

// 6. 向工作线程发送一个计算任务
console.log("[Main] 发送任务给工作线程...");
worker.postMessage({
  num: 20,
});
