import * as fs from 'fs';
import * as YAML from 'js-yaml';
import path from "path";
import { AppSettingsReader } from "./appsettings-reader";
/**
 * YML Reader.
 */
export class YmlReader {
    private applicationSettings: AppSettingsReader = new AppSettingsReader(
    "./ApplicationSettings.xml"
  );
    private ymlObjectRepo: Record<string, any> = {};
    public data: any;

    constructor(filePath: string) {
    this.ymlObjectRepo = {};
    this.data = {};

    if (!filePath || !fs.existsSync(filePath)) {
        return;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = YAML.load(raw);
        this.ymlObjectRepo = parsed as Record<string, any> || {};
        this.data = parsed || {};
    } catch (err) {
        console.error(`Error reading YML file ${filePath}:`, err);
    }
    }

    /**
     * @description Retrieves a value from TestData.yml. Can handle nested nodes if provided.
     * @param node Optional parent node in YAML.
     * @param key Key to fetch value for.
     * @returns Value from TestData.yml or undefined.
     */
    public getYamlTestData(key) {
    try {
        if (!fs.existsSync('./TestData.yml')) {
            return key;
        }
        const raw = fs.readFileSync('./TestData.yml', 'utf8');
        const data = YAML.load(raw) || {}; 
        return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : key;
    } catch (error) {
        console.error(`Error reading TestData.yml: ${error}`);
        return key;
    }
    }

    /**
     * Main function to get value from ObjectRepository YAML
     */
    public getYMLObjectRepositoryData(key: string): string {
            if (!key) return '';

            const nodeList = key.split('.');
            let value: any = this.ymlObjectRepo[nodeList[0]];

            if (value === undefined || value === '') {
                return key; // return the key itself if not found
            }

            for (let i = 1; i < nodeList.length; i++) {
                if (!value) break;
                value = value[nodeList[i]];
            }

            return value ?? key;
        }

    /**
     * @description Gets the Value for the given key.
     * 
     * @param key key
     * @returns value correspoding to the key.
     */
    public getValue(key: string): string {
        if (!key) return '';

        const nodeList = key.split('.');
        let value: any = this.data[nodeList[0]];

        if (value === undefined || value === '') {
            value = key;  
        } else {
            for (let index = 1; index < nodeList.length; index++) {
                if (!value) break;
                value = value[nodeList[index]];
            }
        }

        globalThis.XPath = value;
        globalThis.XPathKey = key;

let CaptureXpathAndTarget: boolean =
  String(this.applicationSettings.getData("CaptureXpathAndTarget")).toLowerCase() === "true";

    if (CaptureXpathAndTarget) {
      this.captureOuterHTML(globalThis.XPath).catch((err) =>
        console.error("Error fetching outerHTML:", err)
      );
    }


    return value.toString();
  }

  // Async helper
  private async captureOuterHTML(xpath: string): Promise<void> {
    try {
      const element = await globalThis.page.$(xpath);
      if (!element) {
        console.warn(`Element not found for XPath: ${xpath}`);
        return;
      }

      const elementHtml = await element.evaluate((el) => el.outerHTML);
      this.storeElementInJson(xpath, elementHtml);
    } catch (error) {
      console.error("Error fetching outerHTML:", error);
    }
  }

  private storeElementInJson(xpath: string, elementHtml: string): void {
    globalThis.Path = process.cwd();
    const jsonFilePath = path.join(
      globalThis.Path,
      "common",
      "HtmlElement.json"
    );

    const newData = {
      locator: xpath,
      target: elementHtml,
    };

    try {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });

      let existingData: any[] = [];

      // Load existing data if file exists and not empty
      if (fs.existsSync(jsonFilePath) && fs.statSync(jsonFilePath).size > 0) {
        try {
          const fileContent = fs.readFileSync(jsonFilePath, "utf8").trim();
          if (fileContent) {
            existingData = JSON.parse(fileContent);
            if (!Array.isArray(existingData)) {
              existingData = [existingData];
            }
          }
        } catch (error) {
          console.warn("Invalid JSON format. Resetting file.");
          existingData = [];
        }
      }

      let updated = false;

      // Update existing entry if same locator found
      for (const entry of existingData) {
        if (entry.locator === xpath) {
          if (!entry.target || entry.target === "") {
            entry.target = elementHtml;
          } else if (entry.target !== elementHtml) {
            entry.target = elementHtml;
          } else {
            console.log("Same locator and target found. No update needed.");
          }
          updated = true;
          break;
        }
      }

      // Add new entry if not found
      if (!updated) {
        existingData.push(newData);
      }

      // Replace double quotes in 'target' for consistency
      for (const entry of existingData) {
        if (entry.target && typeof entry.target === "string") {
          entry.target = entry.target.replace(/"/g, "'");
        }
      }

      // Write updated data back to file
      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(existingData, null, 4),
        "utf8"
      );
    } catch (error) {
      console.error("An error occurred while saving element:", error);
    }
  }
}