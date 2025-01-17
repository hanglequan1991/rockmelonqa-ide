import os from "os";
import fs from "fs";
import path from "path";

import { StandardFolder } from "../../../src/file-defs";
import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import {  prepareOutputProject, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { doAssert } from "../../test-helpers/assert-helper";
import { createPlaywrightMsTestTestData } from "./playwright-csharp-mstest.test-data";
import { createTempDir } from "../../test-helpers/fsHelpers";

test("CodeGen Playwright CSharp MsTest", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-csharp-mstest");
  const projSpec = createPlaywrightMsTestTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  prepareOutputProject(projSpec.outputFiles!, sampleOutputDir);

  // Act
  await generateCode(projFile, (event: IProgressEvent) => {});

  // Assert
  doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
