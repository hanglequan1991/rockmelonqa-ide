import path from "path";
import os from "os";
import fs from "fs";
import fse from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { StandardFolder } from "../../src/file-defs/standardFolder";
import { IPage, ITestCase, ITestSuite, OutputCodeFile, RmpSpec } from "./rm-project-spec.types";
import { IRmProj, IRmProjFile, StandardFileExtension } from "../../src";
import { createDir, writeFile } from "./fsHelpers";

/** Creates source RM Project with the provided specificatoin `rmpSpec` in directory `projectDir`*/
export const createRmTestProject = (rmpSpec: RmpSpec, projectDir: string): IRmProjFile => {
  // Write pages

  let rmProjFile: IRmProjFile = {
    content: rmpSpec.content,
    fileName: "test.rmproj",
    folderPath: projectDir,
  };
  writeCustomCode(projectDir);
  writePages(rmpSpec.pages, projectDir);
  writeTestCases(rmpSpec.testcases, rmpSpec.pages, rmpSpec.testsuites, projectDir);
  wrriteTestRoutines(projectDir);
  writeTestSuites(rmpSpec.testsuites, projectDir);
  wrriteTestProjectFile(rmpSpec.content, rmpSpec.projectName, projectDir);

  createDir(path.join(projectDir, StandardFolder.TestRuns));
  createDir(path.join(projectDir, StandardFolder.OutputCode));
  return rmProjFile;
};

const writeCustomCode = (projectDir: string) => {
  const dir = path.join(projectDir, StandardFolder.CustomCode);
  createDir(dir);
  // TODO: not test custom code yet
};
const wrriteTestRoutines = (projectDir: string) => {
  const dir = path.join(projectDir, StandardFolder.TestRoutines);
  createDir(dir);
  // TODO: not test routines yet
};

const wrriteTestProjectFile = (rmProj: IRmProj, projectName: string, projectDir: string) => {
  let fileName = `${projectName}${StandardFileExtension.Project}`;
  let projFile: IRmProjFile = {
    content: rmProj,
    fileName: fileName,
    folderPath: projectDir,
  };
  writeFile(projFile, path.join(projectDir, fileName));
};

const writePages = (pages: IPage[], projectDir: string) => {
  const pagesDir = path.join(projectDir, StandardFolder.PageDefinitions);
  createDir(pagesDir);

  for (let page of pages) {
    page.id = uuidv4();
    for (let el of page.elements) {
      el.id = uuidv4();
    }
    let pagePath = path.join(pagesDir, page.name?.replaceAll("_", path.sep) + StandardFileExtension.Page);
    let targetDir = path.dirname(pagePath);
    createDir(targetDir);

    let c = clone(page);
    // Delete the `name`. `name` is only used for assigning uuid.
    delete c.name;
    // To test for empty file
    if (page.name?.startsWith("empty")) {
      fs.writeFileSync(pagePath, "");
      continue;
    }
    writeFile(c, pagePath);
  }
};

const writeTestCases = (cases: ITestCase[], pages: IPage[], suites: ITestSuite[], projectDir: string) => {
  const casesDir = path.join(projectDir, StandardFolder.TestCases);
  createDir(casesDir);

  const pageIdHashMap = new Map(pages.map((p) => [p.name, p.id]));
  const elementMapOfMap = new Map(pages.map((p) => [p.name, new Map(p.elements.map((el) => [el.name, el.id]))]));

  for (let tcase of cases) {
    let newCaseId = uuidv4();
    updateTestCaseIdInSuite(suites, tcase.name!, newCaseId);
    tcase.id = newCaseId;

    for (let step of tcase.steps) {
      step.id = uuidv4();
      step.element = step.page && step.element ? elementMapOfMap.get(step.page)?.get(step.element) : "";
      step.page = step.page ? pageIdHashMap.get(step.page) : "";
    }

    let tcasePath = path.join(casesDir, tcase.name!.replaceAll("_", path.sep) + StandardFileExtension.TestCase);
    let targetDir = path.dirname(tcasePath);
    createDir(targetDir);
    let c = clone(tcase);
    delete c.name;

    // To test for empty file
    if (tcase.name?.startsWith("empty")) {
      fs.writeFileSync(tcasePath, "");
      continue;
    }

    writeFile(c, tcasePath);
  }
};

/** Replaces caseName with caseId (uuid) in the TestSuite file */
const updateTestCaseIdInSuite = (suites: ITestSuite[], caseName: string, newCaseId: string) => {
  for (let suite of suites) {
    for (let i = 0; i < suite.testcases.length; i++) {
      if (suite.testcases[i] === caseName) {
        suite.testcases[i] = newCaseId;
      }
    }
  }
};

const writeTestSuites = (suites: ITestSuite[], projectDir: string) => {
  const suitesDir = path.join(projectDir, StandardFolder.TestSuites);
  createDir(suitesDir);

  for (let suite of suites) {
    suite.id = uuidv4();
    let suitePath = path.join(suitesDir, suite.name!.replaceAll("_", path.sep) + StandardFileExtension.TestSuite);
    let targetDir = path.dirname(suitePath);
    createDir(targetDir);
    let c = clone(suite);
    delete c.name;
    
    // To test for empty file
    if (suite.name?.startsWith("empty")) {
      fs.writeFileSync(suitePath, "");
      continue;
    }

    writeFile(c, suitePath);
  }
};

/** Clone a POCO using JSON stringify/parse */
const clone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const prepareOutputProject = (outputFiles: OutputCodeFile[], outputDir: string) => {
  for (let file of outputFiles) {
    let outputFilePath = path.join(outputDir, file.fileRelPath);
    let dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, file.fileContent);
  }
};
