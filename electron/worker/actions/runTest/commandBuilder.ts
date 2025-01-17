import { Language, TestFramework } from 'rockmelonqa.common/file-defs/rmProjFile';
import { IRunTestSettings } from 'rockmelonqa.common/ipc-defs/testRunner';
import RunNunitCommandBuilder from './runNunitCommandBuilder';
import RunXUnitCommandBuilder from './runXUnitCommandBuilder';
import RunMsTestCommandBuilder from './runMsTestCommandBuilder';

export interface ICommandBuilder {
    build: (settings: IRunTestSettings, resultFilePath: string) => string;
}

export class CommandBuilderFactory {
    static getBuilder(language: Language, testFramework: TestFramework): ICommandBuilder {
        if (language === Language.CSharp) {
            if (testFramework === TestFramework.NUnit) {
                return new RunNunitCommandBuilder();
            }
            if (testFramework === TestFramework.MSTest) {
                return new RunMsTestCommandBuilder();
            }
            if (testFramework === TestFramework.xUnit) {
                return new RunXUnitCommandBuilder();
            }
        }
        throw new Error(`Cannot create command builder for Language ${language} and Test Framework ${testFramework}`);
    }
}
