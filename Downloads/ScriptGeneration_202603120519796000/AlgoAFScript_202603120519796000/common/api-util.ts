import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../common/logger';
import { expect } from 'playwright/test';
 
export class ApiUtil {
    public static apiResponseDictionary: Record<string, string> = {};
    public setApiUrl(url: string): void {
        global.apiUrl = url;
        Logger.info(`API URL set to: ${url}`);
    }
 
  public setMethodType(method: string): void {
    global.methodType = method.toUpperCase();
    Logger.info(` Method type set to: ${global.methodType}`);
  }
 
  public async setAPIHeaders(headers: string): Promise<void> {
    const h = await this.parseHeaderString(headers);
    global.apiHeaders = h;
    Logger.info(` API Headers set to: ${headers}`);
  }
  public async setAPIParameter(parameter: string): Promise<void> {
    const h = await this.parseHeaderString(parameter);
    global.apiParameter = h;
    Logger.info(` API Parameter set to: ${parameter}`);
  }
 
  public setApiEndPoint(endpoint: string): void {
    global.apiEndPoint = endpoint;
    Logger.info(` API endpoint set to: ${endpoint}`);
  }
  
   public setBasicAuth(basicAuthCsv: string): void {
    // Expect "username,password"
    const [username, password] = (basicAuthCsv || "").split(",");
    if (username && password) {
      global.basicAuth = { username, password };
    } else {
      global.basicAuth = undefined;
    }
    Logger.info(" Basic Auth set");
  }
 
    public setRequestParameters(params: string): void {
        global.requestParameters = params;
        Logger.info(`Request parameters set to: ${params}`);
    }

    public async executeApiAndVerifyResponse(statuscode: string): Promise<Boolean> {
        Logger.info('--- Executing API Request (Axios with Global Variables) ---');
        Logger.info(`Endpoint: ${global.apiEndPoint}`);
        Logger.info(`Method: ${global.methodType}`);
        Logger.info(`Headers: ${JSON.stringify(global.apiHeaders)}`);

        Logger.info(`Request Parameters: ${global.requestParameters}`);

        const fullUrl = global.apiUrl
            ? `${global.apiUrl.replace(/\/+$/, '')}/${global.apiEndPoint.replace(/^\/+/, '')}`
            : global.apiEndPoint;
 
        const config: AxiosRequestConfig = {
            method: global.methodType as any,
            url: fullUrl,
            headers: global.apiHeaders
        };
        if (['POST', 'PUT', 'PATCH', 'GET'].includes(global.methodType)) {
            try {
                config.data = global.requestParameters
                    ? JSON.parse(global.requestParameters)
                    : {};
            } catch (err) {
                console.error('Invalid JSON in request parameters:', err);
                throw new Error('Invalid JSON in request parameters');
            }
        }

        try {
            global.response = await axios(config);
            Logger.info(`Response received with status: ${global.response.status}`);
            Logger.info("Response data : " + JSON.stringify(global.response.data));
            return global.response.status === Number(statuscode);
        } catch (error: any) {
 
            throw error;
        }
    }
    public async parseHeaderString(headerStr: string): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};
        // split by new line if multiple headers, else single
        const lines = headerStr.split('\n').map(line => line.trim()).filter(Boolean);
 
        for (const line of lines) {
            const [key, ...rest] = line.split(':');
            if (key && rest.length > 0) {
                headers[key.trim().toLowerCase()] = rest.join(':').trim();
            }
        }
        return headers;
    }
    
    public verifyResponseHeader(param: string): boolean {
        try {
            const headerList = global.response?.headers;
 
            const paramParts = param.split(':').map(p => p.trim().toLowerCase());
 
            for (const item of paramParts) {
                const foundInKeys = Object.keys(headerList).some(key => key.toLowerCase() === item);
                const foundInValues = Object.values(headerList).some(value => String(value).toLowerCase() === item);
 
                if (foundInKeys || foundInValues) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error(`[verifyResponseHeader] Error: ${(error as Error).message}`);
            return false;
        }
    }
 
    /**
     * Extract values from global.response.data using comma separated keys (dot notation supported)
     * and store them in a dictionary on global.apiResponseDict with keys prefixed by `prefixKey`
     */
    public setApiResponseDictionary(text: string, prefixKey: string): void {
        if (!global.response || !global.response.data) {
            throw new Error('No API response data available');
        }


        const splitText = text.split(",").map(item => item.split("::")[1]);
        const data = global.response.data;
        if (!global.apiResponseDict) {
            global.apiResponseDict = {};
        }

        for (const keyPath of splitText) {
            let value = this.extractValueByPath(data, keyPath);
            if (value == "") {
                throw new Error(keyPath + " not found");
            }
            global.apiResponseDict[keyPath] = value;
            Logger.info(`Extracted key: ${keyPath}, value: ${value}`);
        }
    }
    private extractValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => {
            if (acc && key in acc) {
                return acc[key];
            }
            return undefined;
        }, obj);
    }
    
    public async getValueFromApiResponse(text: string): Promise<string> {
    try {
      for (const [key, value] of Object.entries(ApiUtil.apiResponseDictionary)) {
        if (text.includes(`@${key}`)) {
          
          if (!isNaN(Number(value))) {
            const quotedPattern = `"@${key}"`;
            text = text.includes(quotedPattern)
              ? text.replace(new RegExp(quotedPattern, 'g'), value)
              : text.replace(new RegExp(`@${key}`, 'g'), value);
          } else {
           
            text = text.replace(new RegExp(`@${key}`, 'g'), value);
          }
        }
      }
    } catch (err: any) {
      Logger.info(`Error processing API response: ${err.message}`);
    }
    return text;
  }

  /**
   * Optional helper to populate the dictionary
   */
  public static setApiResponse(key: string, value: string): void {
    this.apiResponseDictionary[key] = value;
  }
}
 
 