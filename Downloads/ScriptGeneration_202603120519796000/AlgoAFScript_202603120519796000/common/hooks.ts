 
/* eslint-disable no-var */
import { AppSettingsReader } from './appsettings-reader';
const commonUtil: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml')
import { AutoHealUtil } from './auto-heal-util'
const autoHeal: AutoHealUtil = new AutoHealUtil()
import { assertion } from './assertion';
import { ICustomWorld } from './custom-world';
import { Logger } from './logger';
import * as path from 'path';
import fs from 'fs'
import { WebBrowserUtil } from "../common/web-browser-util";
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
  AfterStep,
  IWorld
} from '@cucumber/cucumber';
 
import {
  chromium,
  firefox,
  BrowserContext,
  Page,
} from 'playwright';
 
import os from 'os';
 
import { ITestCaseHookParameter } from '@cucumber/cucumber/lib/support_code_library_builder/types';
 import { AxiosResponse } from 'axios';

// eslint-disable-next-line no-var
var context: BrowserContext;
var page: Page;
 
/**
 * Global Scope
 */
declare global {
  var browser: any;
  var context: BrowserContext;
  var page: Page;
  var maxWaitMilliseconds: number;
  var maxPageLoadMilliseconds: number;
  var highlightWebElement: boolean;
  var labelText: string;
  var LoggerOpt: string;
 
  // API-related globals
  var apiUrl: string;
  var apiEndPoint: string;
  var methodType: string;
  var apiHeaders: Record<string, string>;
  var apiResponseDict: Record<string, string>;
  var requestParameters: string;
  var response: AxiosResponse;
  var basicAuth:
    | {
        username: string;
        password: string;
      }
    | undefined;
}
 
setDefaultTimeout(process.env.PWDEBUG ? -1 : 60 * 1000);
const appSettingsReader: AppSettingsReader = new AppSettingsReader("./ApplicationSettings.xml")
const webBrowserUtil: WebBrowserUtil=new WebBrowserUtil(); 
const userDataDir = './UserSession';
var userSession='';
 
/**
 * method which will be called before the execution to launch the browser
 */
BeforeAll(async function () {
  userSession= String(appSettingsReader.getData('UserSession')).toLowerCase();
  global.LoggerOpt = String(appSettingsReader.getData('Logger'))
  global.maxWaitMilliseconds = Number(appSettingsReader.getData('MaximumTimeInSecondsToWaitForControl')) * 1000;
  global.maxPageLoadMilliseconds = Number(appSettingsReader.getData('MaximumTimeInMilliSecondsToWaitForPage'))*1000;
  global.highlightWebElement = String(appSettingsReader.getData('HighLightWebElement')).trim().toLowerCase() === 'true';
});
 
/**
 * method to ignore a scenario
 */
Before({ tags: '@ignore' }, async function () {
  return 'skipped' as any;
});
 
/**
 * method to debug a scenario
 */
Before({ tags: '@debug' }, async function (this: ICustomWorld) {
  this.debug = true;
});
 
/**
 * method to capture video
 */
Before(async function (this: ICustomWorld, { pickle }: ITestCaseHookParameter) {
  const tags = pickle.tags.map(tag => tag.name);
  const isApiScenario = tags.some(tag => tag.startsWith('@api'));
  let videoRecording = true;
  let browserType = '';
  browserType = browserType || String(appSettingsReader.getData('BrowserType')).toLowerCase();
  let headless = false;
  if (browserType.includes('headless') || isApiScenario) headless = true;
  const launchOptions = { headless };
  const isIncognito = String(appSettingsReader.getData('Incognito')).toLowerCase() === "true";
 
  //deleting user Session folder
  if(userSession=="false"){ 
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
  }

  // Use launchPersistentContext for persistent profile
  switch (browserType) {
    case 'edge':
      context = await chromium.launchPersistentContext(userDataDir, {
        ...launchOptions,
        channel: 'msedge',
        viewport: null,
        args: isIncognito ? ['--inprivate'] : ['--start-maximized'],
      });
      break;
 
    case 'firefox':
    context = await firefox.launchPersistentContext(userDataDir, {
      ...launchOptions,
      channel: 'firefox',
      viewport: null,
      args: isIncognito ? ['-private-window'] : ['--start-maximized'],
    });
      break;
 
    case 'webkit':
      throw new Error('WebKit does not support launchPersistentContext');
 
    default:
      context = await chromium.launchPersistentContext(userDataDir, {
        ...launchOptions,
        channel: 'chrome',
        viewport: null,
        args: isIncognito ? ['--incognito'] : ['--start-maximized'],
      });
  }
 
  // Reuse existing page or create new one
  const pages = context.pages();
  page = pages.length > 0 ? pages[0] : await context.newPage();
 
  global.browser = context.browser();
  global.context = context;
  global.page = page;
  global.labelText = "";
  if (String(commonUtil.getData('VideoRecording')).toLowerCase() === 'false') {
    videoRecording = false;
  }
  if (videoRecording) {
    this.context = await browser.newContext({
      acceptDownloads: true,
      viewport: null,
      recordVideo: {
        dir: './videos',
      }
    });
  } else {
    this.context = global.context;
  }
 
  this.context = global.context;
  this.page = global.page;
  this.feature = pickle;
  globalThis.labelText = '';
 
  const downloadDir = path.resolve(__dirname, '../attachments');
  const downloadDirectory = String(await appSettingsReader.getData("DownloadInCurrentDirectory")).toLowerCase() === "true";
  const systemDownloadDir = path.join(os.homedir(), 'Downloads');
  const finalDownloadDir = downloadDirectory ? downloadDir : systemDownloadDir;
  if (!fs.existsSync(finalDownloadDir)) fs.mkdirSync(finalDownloadDir, { recursive: true });

  this.page.on('download', async (download) => {
    try {
      const suggestedName = await download.suggestedFilename();
      const savePath = path.join(finalDownloadDir, suggestedName);
      await download.saveAs(savePath);
      Logger.info(`Downloaded file saved to ${savePath}`);
    } catch (error) {
      Logger.error("Error saving downloaded file:" + error);
    }
  });
  this.feature = pickle;
});
 

/**
 * method to close browser context after scenario execution
 */
After(async function (this: ICustomWorld, { result, pickle }: ITestCaseHookParameter) {
  globalThis.scenarioname = pickle.name;
  const cleanMessage = stripAnsiCodes(result.message ?? '');
  await this.attach(`${result.status}:${cleanMessage}`, 'text/plain')
  const enableFailure: boolean = String(commonUtil.getData('EnableScreenshotForFailure')).trim().toLowerCase() === 'true';
  const enableFullScreenshot = String(commonUtil.getData('EnableFullScreenshot')).trim().toLowerCase() === 'true';
  const enableDesktopShot = String(commonUtil.getData('EnableDesktopFullScreenshot')).trim().toLowerCase() === 'true';
 
  if (result.status !== Status.PASSED && enableFailure && this.page) {
    try {
      await autoHeal.SaveConfigDeatils(globalThis.scenarioname);
    } catch {
      console.log("Auto Healing Incomplete");
    }
    const image = await global.page.screenshot();
    image && (await this.attach(image, 'image/png'));
  }
  else if (enableDesktopShot && this.page) {
    await webBrowserUtil.desktopscreenshot(this);
  }
  else if (enableFullScreenshot && this.page) {
    await webBrowserUtil.fullscreenshot(this);
  }
  else if (this.page) {
    const image = await global.page.screenshot();
    image && (await this.attach(image, 'image/png'));
  }
 
  if (assertion.hasScenarioFailed()) {
    const scenarioErrors = assertion.getScenarioErrors();
    const errorReport = `Soft Assertion Errors (Scenario End):\n${scenarioErrors.join("\n")}`;
    Logger.info(errorReport);
    assertion.clearScenarioErrors();
    throw new Error(errorReport); 
  }
  
  if (page && !page.isClosed()) await page.close();
  if (context) await context.close();
  if(userSession=="false"){
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
 
/**
 * method to close browser after complete execution
 */
AfterStep(async function (this: IWorld, { pickle, result, pickleStep }) {
  await page.waitForTimeout(globalThis.maxWaitMilliseconds)
  const stepName = pickle.name;
  const stepText = pickleStep.text.toLowerCase();
  const status = result?.status;
  const scenarioTags = pickle.tags.map(t => t.name);
  const enableSuccess: boolean = String(commonUtil.getData('EnableScreenshotForSuccess')).trim().toLowerCase() === 'true';
  const enableAllSteps: boolean = String(commonUtil.getData('EnableScreenshotForAllSteps')).trim().toLowerCase() === 'true';
  const storeScreenshot = String(commonUtil.getData('StoreScreenshot')).trim().toLowerCase() === 'true';
  if (enableAllSteps && this.page) {
    try {
      const screenshot = await this.page.screenshot();
      await this.attach(screenshot, "image/png");
    } catch (err) {
      console.error(`Failed to capture screenshot for step: "${pickleStep.text}"`);
    }
  }
  
  if (enableSuccess && this.page && stepText.includes('verify')) {
    try {
      const screenshot = await global.page.screenshot();
      await this.attach(screenshot, 'image/png');
    } catch (err) {
      Logger.error(`Failed to capture screenshot for step: "${stepName}"`);
    }
  }
 
  if (storeScreenshot && stepText.toLowerCase().includes('verify') && this.page) {
    await webBrowserUtil.saveStepScreenshotToDisk(this.page, stepName, scenarioTags);
  }
  if (assertion.hasStepFailed()) {
    const stepErrors = assertion.getStepErrors();
    const errorReport = `Soft Assertion Errors (Step):\n${stepErrors.join("\n")}`;
    Logger.info(errorReport);
    assertion.clearStepErrors(); // reset for next step
  }
  const loggeropt = global.LoggerOpt.toLocaleUpperCase().trim()
  const logs = Logger.getBufferedLogs();
  const errorLogs = logs
    .split('\n')
    .filter(line => line.includes(`${loggeropt}`))
    .map(line => line.split(`${loggeropt} -`)[1]?.trim())
    .filter(Boolean)
    .map(msg => `${loggeropt}:${msg}`)
    .join('\n')
    .trim();
  Logger.clearBuffer();
  if (this.attach && errorLogs.length > 0) {
    await this.attach(errorLogs.trim(), 'text/plain');
  }
});
 
AfterAll(async function () {
  if (page && !page.isClosed()) await page.close();
  if (context) await context.close();
});
 
function stripAnsiCodes(str: string): string {
  return str.replace(
    // regex that matches ANSI escape codes
    /\u001b\[[0-9]{1,2}(;[0-9]{1,2})?[mGK]/g,
    ''
  );
}
