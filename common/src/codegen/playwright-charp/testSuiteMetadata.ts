import { ISuiteInfo } from "../types";

/** Contains meta data for output test suites */
export interface ITestSuitesMetadata {
  suites: ISuiteInfo[];
  error?: { message: string };
}
