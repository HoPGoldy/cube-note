// tasks/my-task.ts

console.log(`[Child] PID: ${process.pid}`);
console.log(`[Child] process.execPath: ${process.execPath}`);
console.log("Parent execArgv:", process.execArgv);
console.log(`[Child] process.argv:`, process.argv);

// export function task() {
//   console.log(`[Child] 子进程启动，PID: ${process.pid}`);
//   console.log("[Child] 命令行参数:", process.argv);
//   console.log("Running a task every minute");
// }

interface MessageItem {
  cmd: string;
  payload?: any;
}

// 监听父进程发来的消息
process.on("message", (msg: MessageItem) => {
  console.log("[Child] 收到父进程消息:", msg);
  if (msg.cmd === "start") {
    // 执行一些 TypeScript 特有的逻辑
    const result: string = `任务处理完成，收到: ${msg.payload}`;
    console.log("[Child] 任务结果:", result);

    // 把结果发回父进程
    process.send?.({ status: "ok", result });
  }
});
