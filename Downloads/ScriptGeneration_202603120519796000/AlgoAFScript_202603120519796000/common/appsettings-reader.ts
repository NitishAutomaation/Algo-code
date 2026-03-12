

import * as fs from 'fs';
import { parseString, parseStringPromise } from 'xml2js';
/**
 * Application Settings Reader
 */
export class AppSettingsReader {
    getXmlValue(filePath: string, arg1: string): string | PromiseLike<string> {
        throw new Error("Method not implemented.");
    }

	public appSettings;

	/**
	 * @description Ctor.
	 * 
	 * @param filePath  ApplicationSettings Path.
	 */
	constructor(filePath: string) {

		const xml = fs.readFileSync(filePath).toString();
		parseString(xml, (err, value) => {
			this.appSettings = value['ApplicationSettings']
		});
	}

	/**
	 * @description method to read values from xml file.
	 *
	 * @param  key - Key of element
	 * @returns the value corresponding to key
	 */
	public getData(key: string): Promise<string> {

		return this.appSettings[key];
	}
}

export class DBSettingsReader {
  private dbSettings: Record<string, string> = {};

  constructor(filePath: string) {
    if (!fs.existsSync(filePath)) {
      return; 
    }

    const xml = fs.readFileSync(filePath, 'utf-8');
    parseStringPromise(xml)
      .then((result) => {
        const rawSettings = result['DBSettings'];
        for (const key in rawSettings) {
          this.dbSettings[key] = Array.isArray(rawSettings[key])
            ? rawSettings[key][0]
            : rawSettings[key];
        }
      })
      .catch((err) => console.error('Error parsing DBSettings.xml:', err));
  }
   public getDBdata(key: string): string {
    const value = this.dbSettings[key];
    if (!value) throw new Error(`Query for key "${key}" not found in DBSettings.xml`);
    return value;
  }

  /**
	 * @description Async method to read any XML file value dynamically (like XmlReader.getValue)
	 * @param filePath - Path to XML file
	 * @param key - Key of element
	 * @returns value corresponding to key
	 */
	public static async getXmlValue(filePath: string, key: string): Promise<string> {
		const xmlData = fs.readFileSync(filePath, 'utf-8');
		const parsed = await parseStringPromise(xmlData);
		const value = parsed[key] ? parsed[key][0] : undefined;
		if (!value) throw new Error(`Key '${key}' not found in XML file: ${filePath}`);
		return value;
	}
}

