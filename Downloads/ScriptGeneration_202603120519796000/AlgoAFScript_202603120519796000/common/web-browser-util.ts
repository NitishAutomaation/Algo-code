import { BrowserContext, Frame, Page, ElementHandle, Locator } from 'playwright';
import { YmlReader } from './yml-reader';
import { Logger } from "../common/logger";
import { AppSettingsReader } from './appsettings-reader';
import screenshot from 'screenshot-desktop';
import { ICustomWorld } from './custom-world';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as os from 'os';      
const commonUtil: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml')
 
export class WebBrowserUtil {
    private currentContextIndex = 0;
    private objectRepoReader: YmlReader = new YmlReader(
        './ObjectRepository.yml'
    );
 
    /**
     * @description method to click on element by given Xpath
     * @param {string} xpath - Xpath of element
     */
    public async clickElement(xpath: string): Promise<void> {
        try {
            const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
            const splitxpth = this.objectRepoReader.getValue(xpath).split("||");
            await pageFrame.click(splitxpth[0]).then(
                function () {
                    // click successful
                },
                function (err) {
                    throw new Error(err);
                }
            );
            await this.highlight(pageFrame, splitxpth[0]);
        } catch (e) {
            throw new Error('click unsuccessful' + e);
        }
    }
 
    public getPage(xpath: string, index: number): Frame | Page {
        const length = global.context.pages().length
        const page = global.context.pages()[length - 1];
        if (xpath.includes('||')) {
            const splitxpth = xpath.split('||');
            const frm = page.frame(splitxpth[1]);
            if (frm !== null) {
                return frm;
            } else {
                throw new Error('cannot find iframe');
            }
        } else {
            return global.context.pages()[length - 1];
        }
    }
 
    public async getText(element: Locator): Promise<string> {
        let text = (await (element.textContent()))?.trim() || "";
        const isDropdown = await element.evaluate(el => el.tagName.toLowerCase() === 'select');
        if (isDropdown) {
            text = await element.locator("option:checked").textContent();
        }
        if (!text) {
            text = (await element.inputValue()) || "";
        }
        if (!text) {
            text = (await element.getAttribute("value")) || "";
        }
        if (!text) {
            text = (await element.getAttribute("placeholder")) || "";
        }
        if (!text) {
            text = (await element.getAttribute("data-value")) || "";
        }
        return text;
    }
 
    public async isElementPresent(text: String): Promise<boolean> {
        const xpathValue = "//*[contains(text(),'" + text + "')]";
        const element = this.objectRepoReader.getValue(xpathValue).split("||");
        return element !== null;
    }
 
    /**
     * @description method for sorting
     * @param  xpath - Xpath of element
     * @param  order - Order of element
     * @returns List is sorted or not
     */
    public async verifySorting(xpath: string, order: string): Promise<boolean> {
        const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
        const splitxpth = this.objectRepoReader.getValue(xpath).split('||');
        const eleList = pageFrame.$$(splitxpth[0]);
        const temp: string[] = [];
        const list: string[] = [];
        for (let i = 1; i < (await eleList).length - 1; i++) {
            const content = await pageFrame.$eval(
                '(' + splitxpth[0] + ')[' + i + ']',
                (e) => e.textContent
            );
            list.push(String(content));
            temp.push(String(content));
        }
        let verified = false;
        if (order === 'Asce') {
            temp.sort((a, b) => a.localeCompare(b));
        } else {
            temp.sort((a, b) => b.localeCompare(a));
        }
        for (let i = 0; i < temp.length; i++) {
            if (
                temp[i] === list[i] &&
                temp[list.length - (i + 1)] === list[list.length - (i + 1)]
            ) {
                verified = true;
            } else {
                verified = false;
                break;
            }
        }
 
        return verified;
    }
 
    public async getElement(selectorPath: string): Promise<Locator> {
        if (selectorPath.includes('document.querySelectorAll')) {
            const page: Page = globalThis.page;
            const regex = /document\.querySelectorAll\(['"`](.*)['"`]\)\[(\d+)\]/;
            const match = selectorPath.match(regex);
            if (match) {
                const cssSelector = match[1];
                const index = parseInt(match[2], 10);
                return page.locator(cssSelector).nth(index);
            } else {
                throw new Error("Invalid selectorPath: " + selectorPath);
            }
        }
        if (selectorPath.includes('||')) {
            const parts = selectorPath.split('||');
            var frameHandle = await this.getElement(parts[0]);
            var frame = await frameHandle.contentFrame();
            for (var i = 1; i < parts.length - 1; i++) {
                frameHandle = await frame.locator(parts[i]);
                frame = (await frameHandle).contentFrame();
            }
            return frame.locator(parts[parts.length - 1]);
        }
        if (selectorPath.includes("shadowRoot")) {
            const page: Page = globalThis.page;
            let elementHandle: ElementHandle | null = null;
            for (let attempt = 1; attempt <= 5; attempt++) {
                try {
                    await page.waitForLoadState("domcontentloaded"); // wait after navigation
                    elementHandle = await page.evaluateHandle((sel: string) => {
                        try {
                            return eval(sel);
                        } catch {
                            return null;
                        }
                    }, selectorPath);
 
                    if (elementHandle) {
                        break;
                    } else {
                        await page.waitForTimeout(300); // small backoff
                    }
                } catch (err: any) {
                    if (err.message?.includes("Execution context was destroyed")) {
                        await page.waitForLoadState("domcontentloaded");
                        continue;
                    }
                    throw err;
                }
            }
 
            if (!elementHandle) {
                throw new Error(`ShadowRoot element not found after retries: ${selectorPath}`);
            }
 
            return page.locator('xpath=.', { has: page.locator(`xpath=*`) }).filter({
                has: page.locator(`:scope`)
            });
        }
        else if (selectorPath.includes(">>")) {
            const page: Page = globalThis.page;
            return page.locator(selectorPath);
 
        }
        const page: Page = globalThis.page;
        return page.locator(selectorPath);
    }
 
    public async multipleBrowser(url: string): Promise<void> {
        let videoRecording = true;
        let context: BrowserContext;
        if (String(commonUtil.getData('VideoRecording')).toLowerCase() === 'false') {
            videoRecording = false;
        }
        if (videoRecording) {
            context = await globalThis.browser.newContext({
                acceptDownloads: true,
                viewport: { width: 1920, height: 1080 },
                recordVideo: {
                    dir: './videos',
                }
            });
        } else {
            context = await globalThis.browser.newContext({
                acceptDownloads: true,
                viewport: { width: 1920, height: 1080 }
            });
        }
 
        const page = await context.newPage();
        global.page=page;
        global.context=context;
        global.browser=await context.browser();
        page.setDefaultNavigationTimeout(global.maxPageLoadMilliseconds || 30000);
        await page.goto(url, { waitUntil: "load" });
    }
 
    public async scrollAndFindElement( xpath: string, maxScrollAttempts: number = 5): Promise<Locator | null> {
        const pageFrame = globalThis.page;
        let elementHandle = await this.getElement(xpath);
 
        let attempts = 0;
        while (!elementHandle && attempts < maxScrollAttempts) {
            await pageFrame.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
 
            elementHandle = await this.getElement(xpath);
            attempts++;
        }
        if (elementHandle) {
            await this.highlight(pageFrame, xpath);
        }
        return elementHandle;
    }
 
    public async selectByLastIndex(locator: Locator) {
        const optionCount = await locator.locator('option').count();
        if (optionCount === 0) {
            throw new Error('No options found');
        }
        const lastIndex = optionCount - 1;
        await locator.selectOption({ index: lastIndex });
    }
 
    public async selectByFirstIndex(elementHandle: Locator) {
        await elementHandle.selectOption({ index: 0 });
    }

    public async attachPage(expectedTitle: string): Promise<void> {
        const pages = global.context.pages();
        const last = pages[pages.length - 1];
        const title = (await last.title()).toUpperCase();

        if (title.includes(expectedTitle.toUpperCase())) {
            globalThis.page = last;
            return;
        }
        
        for (const p of pages) {
            const t = (await p.title()).toUpperCase();
            if (t.includes(expectedTitle.toUpperCase())) {
                globalThis.page = p;
                return;
            }
        }

        globalThis.page = last;
    }

    public async openNewTabAndNavigate(param: string): Promise<void> {
        const newPage = await this.openNewTab(false, param);
        globalThis.page = newPage;
        this.setCurrentBrowser(0);
    }
 
    public async openNewTab(openBrowser: boolean, autUrl: string): Promise<Page> {
        let page: Page;
        try {
            if (openBrowser) {
                const context = await globalThis.browser.newContext({
                    acceptDownloads: true,
                    viewport: null, // FULL SCREEN
                });
                page = await context.newPage();
                await page.goto(autUrl, { waitUntil: "load", timeout: global.maxPageLoadMilliseconds });
                globalThis.context = context;
                this.currentContextIndex = globalThis.browser.contexts().length - 1;
                Logger.info("Opened new browser window and navigated to URL: " + autUrl);
            } else {
                const contexts = globalThis.browser.contexts();
                const ctx = contexts[this.currentContextIndex] ?? contexts[0] ?? (await globalThis.browser.newContext({ viewport: null }));
                page = await ctx.newPage({ viewport: null }); // ensures maximied
                await page.setDefaultNavigationTimeout(global.maxPageLoadMilliseconds);
                await page.goto(autUrl, {
                    waitUntil: "load",
                    timeout: 30000
                });
                globalThis.context = ctx;
                Logger.info("Opened new tab in existing context and navigated to URL: " + autUrl);
            }
            globalThis.page = page;
            return page;
        } catch (error: any) {
            Logger.error("Failed to open new tab or navigate to URL: " + autUrl + ". Error: " + error.message);
            throw error;
        }
    }
 
    public async closeCurrentTab(): Promise<void> {
        try {
            const pages = globalThis.page.context().pages();
            if (pages.length <= 1) {
                Logger.warn("Only one tab open, cannot close the last tab.");
                return;
            }
            await globalThis.page.close();
            const remainingPages = globalThis.page.context().pages();
            globalThis.page = remainingPages[remainingPages.length - 1];
            Logger.info("Closed current tab and switched to previous tab.");
        } catch (error: any) {
            Logger.error(`Error while closing tab: ${error.message}`);
            throw error;
        }
    }

    public async setCurrentBrowser(index: number): Promise<void> {
        const contexts = globalThis.browser.contexts();
        if (contexts.length > index) {
            this.currentContextIndex = index;
        } else {
            throw new Error(`No browser context at index ${index}. Have ${contexts.length}.`);
        }
    }
 
    public static isSortedDescending(numbers: number[]): boolean {
        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] > numbers[i - 1]) {
                return false;
            }
        }
        return true;
    }
 
    public static isSortedAscending(numbers: number[]): boolean {
        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] < numbers[i - 1]) {
                return false;
            }
        }
        return true;
    }
 
    public async scrollAndSelectByText(locator: Locator, text: string): Promise<void> {
        try {
            await locator.scrollIntoViewIfNeeded();
            await locator.selectOption({ label: text });
            Logger.info(`SelectByText: Selected '${text}'`);
        } catch (err) {
            throw new Error(`scrollAndSelectByText failed for text: ${text} → ${err}`);
        }
    }
 
    public async selectByText(locator: Locator, text: string): Promise<void> {
        try {
            await locator.selectOption({ label: text });
            Logger.info(`selectByText: Selected '${text}'`);
        } catch (err) {
            throw new Error(`selectByText failed for text: ${text} → ${err}`);
        }
    }
 
    public async verifyEmptyDropdown(locator: Locator): Promise<boolean> {
        const optionCount = await locator.locator('option').count();
        return optionCount === 0;
    }
 
    public async verifyLowToHigh(xpath: string): Promise<boolean> {
        let isVerified = false;
        const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
        const splitxpth = this.objectRepoReader.getValue(xpath).split("||");
        const labels = await pageFrame.locator(splitxpth[0]).allTextContents();
        const numbers = labels.map(label => {
            let value = label.replace(/[^0-9.]/g, "");
            if (value.includes(".")) {
                value = value.substring(0, value.indexOf("."));
            }
            return parseInt(value, 10);
        });
 
        isVerified = WebBrowserUtil.isSortedAscending(numbers);
        return isVerified;
    }
 
    public async verifyHighToLow(xpath: string): Promise<boolean> {
        let isVerified = false;
        const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
        const splitXpath = this.objectRepoReader.getValue(xpath).split("||");
 
        // Extract all text contents
        const labels = await pageFrame.locator(splitXpath[0]).allTextContents();
        Logger.info("Extracted price labels (High → Low check):" + labels);
 
        // Convert labels to numbers
        const numbers = labels.map(label => {
            let value = label.replace(/[^0-9.]/g, "");
            if (value.includes(".")) {
                value = value.substring(0, value.indexOf("."));
            }
            return parseInt(value, 10);
        });
        isVerified = WebBrowserUtil.isSortedDescending(numbers);
        return isVerified;
    }
 
    public async verifyAscendingOrder(xpath: string): Promise<boolean> {
        const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
        const splitXpath = this.objectRepoReader.getValue(xpath).split("||");
        const labels = await pageFrame.locator(splitXpath[0]).allTextContents();
        const list = labels.map(label => label.trim());
        let list1: string[] = [...list];
 
        try {
            list1.sort((a, b) => {
                const extractInt = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")) || 0;
                return extractInt(a) - extractInt(b); // High → Low
            });
        } catch (error) {
            list1.sort((a, b) => WebBrowserUtil.stringAlphabeticalComparator(a, b));
        }
 
        const isVerified = list.every((val, idx) => {
            const extractInt = (s: string) => parseInt(s.replace(/[^\d.]/g, ""), 10) || 0;
            return extractInt(val) === extractInt(list1[idx]);
        });
        return isVerified;
    }
 
    public static stringAlphabeticalComparator(a: string, b: string): number {
        return a.localeCompare(b, undefined, { sensitivity: "base" }) || a.localeCompare(b);
    }
 
    public async verifyDescendingOrder(xpath: string): Promise<boolean> {
        const pageFrame = this.getPage(this.objectRepoReader.getValue(xpath), 0);
        const splitXpath = this.objectRepoReader.getValue(xpath).split("||");
        const labels = await pageFrame.locator(splitXpath[0]).allTextContents();
        const list = labels.map(label => label.trim());
        let list1: string[] = [...list];
 
        try {
            // First, try numeric descending sort
            list1.sort((a, b) => {
                const extractInt = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")) || 0;
                return extractInt(b) - extractInt(a); // High → Low
            });
        } catch (error) {
            list1.sort((a, b) => WebBrowserUtil.stringReverseAlphabeticalComparator(a, b));
        }
        const isVerified = list.every((val, idx) => {
            const extractInt = (s: string) => parseInt(s.replace(/[^\d.]/g, ""), 10) || 0;
            return extractInt(val) === extractInt(list1[idx]);
        });
        return isVerified;
    }
 
    public static stringReverseAlphabeticalComparator(a: string, b: string): number {
        const normalCompare = a.localeCompare(b, undefined, { sensitivity: "base" }) || a.localeCompare(b);
        return -1 * normalCompare;
    }
 
    public async copiedValueFromKeyboardAction(pageFrame: Page | Frame, xpath: string): Promise<void> {
        try {
            const textbox = pageFrame.locator(xpath);
            const page = this.resolvePage(pageFrame);        
            const copiedText =
            (await textbox.inputValue().catch(() => null)) ??
            (await textbox.textContent());        
            await textbox.click();
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyC');
            await page.keyboard.up('Control');
            Logger.info(`Copied text: ${copiedText}`);
        } catch (err) {
            console.error('Failed to copy from textbox', err);
            throw err;
        }
    }

    public resolvePage(pageFrame: Page | Frame): Page {
    if ('keyboard' in pageFrame) {
        return pageFrame; // Page
    }
    return pageFrame.page(); // Frame → Page
    }
 
    public async pasteValueFromKeyboardAction(pageFrame: Page | Frame,xpath: string): Promise<void> {
        try {
            const textbox = pageFrame.locator(xpath);
            const page = this.resolvePage(pageFrame);       
            await textbox.click();
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyV');
            await page.keyboard.up('Control');
            await pageFrame.waitForTimeout(200);
            const pastedText =
            (await textbox.inputValue().catch(() => null)) ??
            (await textbox.textContent());
            Logger.info(`Pasted text: "${pastedText}"`);
        } catch (err) {
            console.error('Failed to paste into textbox', err);
            throw err;
        }
    }
 
    public async dragAndDropHorizontallyByOffset(page, element: ElementHandle<Element>, distance: number): Promise<void> {
        const box = await element.boundingBox();
        if (!box) throw new Error("Element not visible for drag operation");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + distance, box.y + box.height / 2);
        await page.mouse.up();
    }
 
    public async clickAndHoldAndRelease(page, element: ElementHandle<Element>, targetElement: ElementHandle<Element>): Promise<void> {
        try {
            const sourceBox = await element.boundingBox();
            const targetBox = await targetElement.boundingBox();
 
            if (!sourceBox || !targetBox) {
                throw new Error('Source or Target element not visible');
            }
            await page.mouse.move(
                sourceBox.x + sourceBox.width / 2,
                sourceBox.y + sourceBox.height / 2
            );
            await page.mouse.down();
            await page.mouse.move(
                targetBox.x + targetBox.width / 2,
                targetBox.y + targetBox.height / 2
            );
            await page.mouse.up();
            await page.waitForTimeout(2000);
        } catch (error) {
            throw new Error('Drag And Drop Horizontally unsuccessful: ' + error);
        }
    }
 
    public async saveStepScreenshotToDisk(page: Page, stepName: string, scenarioTags: string[]): Promise<void> {
        const testTag = scenarioTags.find(tag => tag.toLowerCase().startsWith('@test'));
        const testCaseName = testTag ? testTag.substring(1) : 'UnknownTest';
 
        const screenshotsFolderPath = path.resolve(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsFolderPath)) fs.mkdirSync(screenshotsFolderPath, { recursive: true });
 
        const testCaseFolderPath = path.join(screenshotsFolderPath, testCaseName);
        if (!fs.existsSync(testCaseFolderPath)) fs.mkdirSync(testCaseFolderPath, { recursive: true });
 
        const sanitizedStepName = stepName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const screenshotName = `step_${sanitizedStepName}_${Date.now()}.png`;
        const screenshotPath = path.join(testCaseFolderPath, screenshotName);
 
        try {
            await page.screenshot({ path: screenshotPath });
        } catch (err) {
            console.error(`Failed to capture screenshot for step "${stepName}": ${err}`);
        }
    }
 
    public async fullscreenshot(world: ICustomWorld): Promise<void> {
        const img = await world.page.screenshot({ fullPage: true });
        await world.attach(img, 'image/png');
    }
 
    public async desktopscreenshot(world: ICustomWorld): Promise<void> {
        const desktopImg = await screenshot({ format: 'png' });
        await world.attach(desktopImg, 'image/png');
 
    }
    public async highlight(pageFrame: Page | Frame, xpath: string): Promise<void> {
        if (!global.highlightWebElement) return;        
        await pageFrame.evaluate((xp) => {
            const node = document.evaluate(
                xp,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue as HTMLElement | null;
 
            if (node) {
                const oldOutline = node.style.outline;
                node.style.outline = '2px solid red';
                setTimeout(() => (node.style.outline = oldOutline), 1000);
            }
        }, xpath);
    }
 
    public async compareAndVerifyImage(page: Page, imageName: string): Promise<boolean> {
        let verified = false;
        const screenshotBuffer = await page.screenshot({ type: 'png' });
        const enableCompareImage = String(commonUtil.getData('EnableCompareImage')).toLowerCase() === 'true';
 
        const compareDir = path.resolve('Compare');
        const baseDir = path.resolve('Baseline');
        fs.mkdirSync(compareDir, { recursive: true });
        fs.mkdirSync(baseDir, { recursive: true });
 
        const basePath = path.join(baseDir, `${imageName}.png`);
        const comparePath = path.join(compareDir, `${imageName}.png`);
 
        if (!enableCompareImage) {
            fs.writeFileSync(basePath, new Uint8Array(screenshotBuffer));
            return true;
        }
        fs.writeFileSync(comparePath, new Uint8Array(screenshotBuffer));
        if (!fs.existsSync(basePath)) {
            return verified;
        }
        const imgA = PNG.sync.read(fs.readFileSync(comparePath));
        const imgB = PNG.sync.read(fs.readFileSync(basePath));
        if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
            return verified;
        }
        const diffPixels = pixelmatch(
            imgA.data,
            imgB.data,
            null,
            imgA.width,
            imgA.height,
            { threshold: 0.7 }
        );
        if (diffPixels === 0) {
            verified = true;
        }
        return verified;
    }
 
    sleep(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
 
    public getFileExtension(filePath: string): string {
        const ext = path.extname(filePath);
        return ext ? ext.slice(1) : '';
    }
 
    public async verifyDownloadedFile(filePath: string): Promise<boolean> {
        await this.sleep(5);
        const currentpath = path.resolve(__dirname, '../attachments');
        if (filePath.toLowerCase().includes("extension_")) {
            const arr = filePath.split("_");
            const expectedFileType = arr[1];
            const files = fs.readdirSync(currentpath).map(f => path.join(currentpath, f)).filter(f => fs.statSync(f).isFile());
            if(files.length <= 0){
                const dirPath = path.join(os.homedir(), 'Downloads');
                const files = fs.readdirSync(dirPath).map(f => path.join(dirPath, f)).filter(f => fs.statSync(f).isFile());
                if (files.length > 0) {
                files.sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
                const newestFile = files[0];
                Logger.info("Going to validate file name: " + newestFile);
                const fileDate = fs.statSync(newestFile).mtime;
                const currentDate = new Date(Date.now() - 30000);
                    if (fileDate > currentDate) {
                        Logger.info("Modify current date");
                        return true;
                    }
                }
            } else if(files.length>0) {
                files.sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
                const newestFile = files[0];
                const fileExtension = this.getFileExtension(newestFile);
                return fileExtension === expectedFileType;
            }      
        }
    return false;
}
}