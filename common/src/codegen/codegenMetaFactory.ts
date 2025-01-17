import { AutomationFramework, ICodeGenMeta, TestFramework } from "../file-defs";
import { IOutProjMeta } from "./playwright-charp/outProjMeta";
import { MsTestProjMeta } from "./playwright-csharp-mstest/msTestProjMeta";
import { NunitProjectMeta } from "./playwright-csharp-nunit/nunitProjectMeta";
import { XUnitProjectMeta } from "./playwright-csharp-xunit/xunitProjectMeta";

const codegenMetaRegisty: { [key in keyof typeof AutomationFramework]?: { [key in keyof typeof TestFramework]?: any } } = {
  [AutomationFramework.Playwright]: {
    [TestFramework.NUnit]: NunitProjectMeta,
    [TestFramework.MSTest]: MsTestProjMeta,
    [TestFramework.xUnit]: XUnitProjectMeta,
    // ... add other types of TestFramework
  },
  // ... add other types of AutomationFramework
};

export class CodeGenMetaFactory {
  /** Creates new instance of Codegen based on  { automationFramework, testFramework }*/
  static newInstance(projMeta: ICodeGenMeta): IOutProjMeta {
    let automationFramework = codegenMetaRegisty[projMeta.project.content.automationFramework];

    if (automationFramework === undefined) {
      throw new Error(`Can't find Codegen Meta for AutomationFramework '${projMeta.project.content.automationFramework}'`);
    }

    let codegenMetaClass = automationFramework[projMeta.project.content.testFramework];
    if (!codegenMetaClass) {
      throw new Error(`Can't find Codegen Meta class for TestFramework '${projMeta.project.content.testFramework}'`);
    }

    return new codegenMetaClass(projMeta);
  }
}
