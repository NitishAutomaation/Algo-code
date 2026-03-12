// assertion.ts
import { expect } from '@playwright/test';
import { AppSettingsReader } from './appsettings-reader';
import { Logger } from './logger';
const commonUtil: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml');
const isSoftAssertionEnabled: boolean =
  String(commonUtil.getData('EnableSoftassertion')).trim().toLowerCase() === 'true';

function removeAnsiCodes(text: string): string {
  return text.replace(/\x1B\[[0-9;]*[mK]/g, '');
}

class Assertion {
  private scenarioErrors: string[] = [];
  private stepErrors: string[] = [];

  public async isTrue(actual: boolean, message: string): Promise<void> {
    if (!isSoftAssertionEnabled) {
      await expect(actual, message).toBeTruthy();
      return;
    }

    try {
      await expect(actual, message).toBeTruthy();
    } catch (error: any) {
      const cleanedErrorMessage = removeAnsiCodes(error.message || "");
      const formattedMessage = `Assertion Failed: ${message}\nDetail: ${cleanedErrorMessage}`;

      Logger.info("Soft assertion captured: " + formattedMessage);

      this.scenarioErrors.push(formattedMessage);
      this.stepErrors.push(formattedMessage);
    }
  }

  public getScenarioErrors(): string[] { return [...this.scenarioErrors]; }
  public getStepErrors(): string[] { return [...this.stepErrors]; }
  public clearStepErrors(): void { this.stepErrors = []; }
  public clearScenarioErrors(): void { this.scenarioErrors = []; this.stepErrors = []; }
  public hasStepFailed(): boolean { return this.stepErrors.length > 0; }
  public hasScenarioFailed(): boolean { return this.scenarioErrors.length > 0; }
}

// ✅ Export single shared instance
export const assertion = new Assertion();
