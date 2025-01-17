import path from "path";
import { Worker } from "worker_threads";

import { IProgressEvent, IRmProjFile } from "rockmelonqa.common";
import { generateCode } from "rockmelonqa.common/codegen/codegen";
import { MessagePort } from "worker_threads";
import { WorkerAction, WorkerMessage } from "../worker";
import { IActionResult } from "./shared";

export const genCode = async function (
  rmprojFile: IRmProjFile,
  progressNotify: (event: IProgressEvent) => void
): Promise<IActionResult> {
  return await new Promise<IActionResult>((rs, _) => {
    const workerPath = path.join(__dirname, "../worker.js");
    const worker = new Worker(workerPath);

    worker.on("message", (event: IProgressEvent) => {
      if (event.type === "finish") {
        rs({ isSuccess: true });
      } else {
        progressNotify({
          ...event,
          type: `gen-code:${event.type}`,
        });
      }
    });

    worker.on("error", (error: Error) => {
      console.error(error);
      rs({ isSuccess: false, errorMessage: String(error) });
    });

    worker.postMessage({
      action: WorkerAction.GenCode,
      rmProjectFile: rmprojFile,
    } as WorkerMessage);
  });
};

export const doGenCode = async (port: MessagePort | null, rmProjectFile: IRmProjFile) => {
  await generateCode(rmProjectFile, (event: IProgressEvent) => port?.postMessage(event));

  port?.postMessage({ type: "finish" } as IProgressEvent);
};
