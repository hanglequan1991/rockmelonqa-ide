import os from "os";
import fs from "fs";
import path from "path";

import { StandardFolder } from "../../../src/file-defs";
import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import { createTempDir, prepareOutputProject, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { doAssert } from "../../test-helpers/assert-helper";
import { createPlaywrightNunitTestData } from "./playwright-csharp-nunit.test-data";

test("CodeGen Playwright CSharp Nunit - General", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-csharp-nunit-general");
  const projSpec = createPlaywrightNunitTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  prepareOutputProject(projSpec.outputFiles!, sampleOutputDir);

  // Act
  await generateCode(projFile, (event: IProgressEvent) => console.log(event));

  // Assert
  doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
