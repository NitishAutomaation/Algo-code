// Copyright Koninklijke Philips N.V. 2021
import * as fs from "fs";
import path from "path";
import { AppSettingsReader } from "./appsettings-reader";

/**
 * YML Reader.
 */
export class AutoHealUtil {
  private applicationSettings: AppSettingsReader = new AppSettingsReader(
    "./ApplicationSettings.xml"
  );

  /**
   * @description Gets the Value for the given key.
   * @param key key
   * @returns value correspoding to the key.
   */
  public async SaveConfigDeatils(scenarioname: string): Promise<void> {
    try {
      globalThis.Path = process.cwd();

  let autoHealingString: boolean =
  String(this.applicationSettings.getData("AutoHealing")).toLowerCase() === "true";
      if (autoHealingString) {
        await this.updateXML(scenarioname);
      }
      if (autoHealingString) {
        await this.updateXML(scenarioname);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  public async updateXML(scenarioname: any): Promise<void> {
    let token = String(this.applicationSettings.getData("Token"));
    const myClassInstance = new MyClass();
    const matchedEntry = await myClassInstance.fetchTargetFromXPath();
    let workingDirectory;
    const OS = process.platform;
    if (OS.includes("win")) {
      workingDirectory = process.env.APPDATA;

      // create the AlgoAF/AutoHeal directory if it doesn't exist
      const targetDir = path.join(workingDirectory, "../Local/AlgoAF/AutoHeal");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // create working directory path
      workingDirectory = path.join(targetDir, "web_" + scenarioname).toString();

      if (!fs.existsSync(workingDirectory)) {
        fs.mkdirSync(workingDirectory);
      }
    } else {
      workingDirectory = workingDirectory + "/Library/Application Support";
    }

    try {
      const escapeXml = (unsafe) =>
        unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/'/g, "&apos;")
          .replace(/"/g, "&quot;");
      let filepath = path.join(workingDirectory, "AFConfig.xml");
      let webPagePath = path.join(workingDirectory, "WebPage.html");
      let fileContent =
        '<?xml version="1.0" encoding="utf8"?>\n' +
        "<Configuration>\n" +
        "<AutomationType>Web</AutomationType>\n" +
        "<Language_Framework>Typescript_Playwright</Language_Framework>\n" +
        "<AutoHeal>True</AutoHeal>\n" +
        "<Token>" +
        token +
        "</Token>\n" +
        "<ObjectRepositoryFile>" +
        globalThis.Path +
        "\\ObjectRepository.yml</ObjectRepositoryFile>\n" +
        "<XPathKey>" +
        globalThis.XPathKey +
        "</XPathKey>\n" +
        "<XPath>" +
        globalThis.XPath +
        "</XPath>\n" +
        "<Target>" +
        escapeXml(matchedEntry.target) +
        "</Target>\n" +
        "<XPathUpdatedStatus>False</XPathUpdatedStatus>\n" +
        "</Configuration>";

      fs.writeFile(filepath, fileContent, function (err) {
        if (err) throw err;
      });

      fs.writeFile(
        webPagePath,
        (await globalThis.page.content()).toString(),
        function (err) {
          if (err) throw err;
          console.log("Saved!");
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
}
class MyClass {
  public async fetchTargetFromXPath(): Promise<any | undefined> {
    try {
      const commonpath = path.join(
        globalThis.Path,
        "common",
        "HtmlElement.json"
      );
      if (!fs.existsSync(commonpath)) {
        throw new Error("HtmlElement.json not found at: " + commonpath);
      }

      const fileContent = fs.readFileSync(commonpath, "utf-8");
      const elements = JSON.parse(fileContent);
      const locatorToFind = globalThis.XPath;
      const matchedEntry = elements.find(
        (entry: any) => entry.locator === locatorToFind
      );
      return matchedEntry;
    } catch (error) {
      console.error("Error while fetching target:", error);
      throw error;
    }
  }
}



