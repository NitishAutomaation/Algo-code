/* global require, module*/
import { BrowserContext, Frame, Page, ElementHandle, Locator } from 'playwright';
import { YmlReader } from './yml-reader';
import { AppSettingsReader } from './appsettings-reader';
const commonUtil: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml')
const fs = require('fs');
export class CommonUtil {
    private objectRepoReader: YmlReader = new YmlReader('./ObjectRepository.yml')
    public copiedList: string[] = [];
    public static labelNumber: number = 0;
    public copiedCount: number = 0;
    public labelCount: number = 0;
    public labelText: string = '';
    public copiedValues: string[] = [];
    private static dbValue = '';
    private static randomCopiedNumberValues: string[] = [];
    private static randomLabelNumber: number = 0;
    private static copiedTextMap: Map<string, string> = new Map();
    private static randomCopiedTextValues: string[] = [];
    private static randomLabelText: string;
    private static globalValues: string[] = [];
    private static globalRandomValues: string[] = [];
    public static globalUserValues: Record<string, string> = {};
    private static randomAlpha64List: string[] = [];
    private static alphaNumber64Epoch: string;
    private static randomAlpha32List: string[] = [];
    private static alphaNumber32: string;

    public getXmlData(key) {
		var link = "";
		const { parseString } = require('xml2js');
		const xml = fs.readFileSync("./ApplicationSettings.xml").toString();
		parseString(xml, function (err, data) {
			var x = data["ApplicationSettings"][key];
			link = x;

		});
		return link;
    }
    public getData(key: string): string {
        let value=this.objectRepoReader.getYamlTestData(key);
            if (value.includes('@randomtext')) {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                for (let i = 0; i < 10; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                globalThis.labelText = result;
                value = value.replaceAll('@randomtext', result);
            }

            if (value.includes('@randomnumber_')) {
                const splitValue = value.split('_');
                const index: number = +splitValue[1];
                let result = '';
                const characters = '0123456789';
                for (let i = 0; i < index; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                 value = value.replaceAll('@randomnumber_', result);
            }

            if (value.includes('@randomdate_')) {
                const splitValue = value.split('_');
                const MinusDays: number = +splitValue[1];
                let today = new Date();
                today.setDate(today.getDate() + MinusDays);
                const dateWithTime = (today.toLocaleString()).split(',');
                const date = new Date(dateWithTime[0]);
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const yyyy = date.getFullYear();
                value = mm + '/' + dd + '/' + yyyy;
            }

            if (value.includes("@copiedtext")) {
                if (value.includes("_")){
                const index = value.split("_")[1];
                value = this.getCopiedCountText(index); 
                }
                else{
                   value = this.labelText; 
                }
            }

        globalThis.XPath = value;
        globalThis.XPathKey = key;

        return value.toString();
    }


    public async getCopiedList(): Promise<string[]> {
        return this.copiedList;
    }

    public async setCopiedNumber(number: number): Promise<void> {
        CommonUtil.labelNumber=number;
    }

    public async getCopiedCount(): Promise<number> {
        return this.copiedCount; 
    }

    public async setCopiedCount(count: number): Promise<void> {
        this.copiedCount = count;
    }

    public async setCopiedText(text: string): Promise<void> {
        this.labelText = text;
        await this.addToCopiedList(text);
    }

    public async getCopiedText(): Promise<string> {
        return this.labelText;
    }

    public async getCopiedNumber(): Promise<Number> {
        return CommonUtil.labelNumber;
    }

    public async addToCopiedList(item: string): Promise<void> {
        this.copiedList.push(item);
    }

    public async clearCopiedList(): Promise<void> {
        this.copiedList = [];
    }

	public async getCopiedTextList(): Promise<string[]> {
        return this.copiedValues;
    }

    public getCopiedCountText(text: string): string {
        const index = parseInt(text, 10) - 1;
        if (index < 0 || index >= this.copiedList.length) {
            throw new Error(`Index out of bounds: ${text}`);
        }
        return this.copiedList[index];
    }

	public async addCopiedText(content: string): Promise<void> {
        if (!globalThis.copiedTexts) {
            globalThis.copiedTexts = []; 
        }
        globalThis.copiedTexts.push(content);
    }

    public async setCopiedTextKey(key: string, value: string): Promise<void> {
        if (!key) {
            throw new Error("Key cannot be empty");
        }
        CommonUtil.copiedTextMap.set(key, value?.trim() ?? "");
    }

    public async getCopiedTextKey(key: string): Promise<string | undefined> {
        return CommonUtil.copiedTextMap.get(key);
    }

    public async setRandomCopiedNumberValues(values: string[]): Promise<void> {
        CommonUtil.randomCopiedNumberValues = [...values];
    }
    
    public async getRandomCopiedCountNumber(text: string): Promise<string> {
        const index = parseInt(text, 10) - 1;
        if (index >= 0 && index < CommonUtil.randomCopiedNumberValues.length) {
            return CommonUtil.randomCopiedNumberValues[index];
        }
        throw new Error(`Index ${index} out of bounds for randomCopiedNumberValues`);
    }

    public async setCopiedRandomNumber(value: number): Promise<void> {
        CommonUtil.randomLabelNumber = value;
    }

    public async getCopiedRandomNumber(): Promise<number> {
        return CommonUtil.randomLabelNumber;
    }
   
    public async getDBValue(): Promise<string> {
        return CommonUtil.dbValue;
    }

    public async setDBValue(value: string):Promise<void> {
        CommonUtil.dbValue = value;
    }

    public async getRandomCopiedCountText(text: string): Promise<string> {
        const index = parseInt(text, 10) - 1;
        if (index < 0 || index >= CommonUtil.randomCopiedTextValues.length) {
            throw new Error(`Index ${index + 1} is out of bounds for randomCopiedTextValues.`);
        }
        return CommonUtil.randomCopiedTextValues[index];
    }
  
    public static async getCopiedRandomText(): Promise<string | undefined> {
        return this.randomLabelText;
    }
  
    public  async getGlobalText(text: string): Promise<string> {
        const index = parseInt(text) - 1;
        return CommonUtil.globalValues[index];
    }

    public async getGlobalRandomText(text: string): Promise<string> {
        const index = parseInt(text) - 1;
        return CommonUtil.globalRandomValues[index];
    }

    public async getAlphaNum64CopiedCountText(text: string): Promise<string> {
        const index = parseInt(text, 10) - 1;
        return CommonUtil.randomAlpha64List[index];
    }

    public async getAlphaNum64CopiedText(): Promise<string> {
        return CommonUtil.alphaNumber64Epoch;
    }

    public async getAlphaNum32CopiedCountText(text: string): Promise<string> {
        const index = parseInt(text, 10) - 1;
        return CommonUtil.randomAlpha32List[index];
    }

    public async getAlphaNum32CopiedText(): Promise<string>{
        return CommonUtil.alphaNumber32;
    }
  
}
