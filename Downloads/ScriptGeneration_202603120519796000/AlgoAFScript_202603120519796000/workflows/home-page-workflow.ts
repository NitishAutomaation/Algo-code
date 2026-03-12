
import fs from 'fs';
import path from 'path';
import { spawn,exec,ChildProcess } from 'child_process';
import expect from "expect";
import percySnapshot from '@percy/playwright';
import fetch from 'node-fetch';
import * as XLSX from "xlsx";
import { pdfToText } from 'pdf-ts';
import { YmlReader } from "../common/yml-reader";
import { AppSettingsReader } from "../common/appsettings-reader";
import { WebBrowserUtil } from "../common/web-browser-util";
import { CommonUtil } from "../common/common-util";
import { Logger } from "../common/logger";
import { ApiUtil } from "../common/api-util";
import { assertion } from "../common/assertion";
import { SSHUtil } from "../common/SSHUtil";
import { DbHelper } from "../common/DBHelper";
import { MongoDBUtil } from "../common/mongoDButil";
import { SqlServerUtil } from "../common/sql-server-util";
import { MySqlServerUtil } from "../common/mysql-server-util";
import { DBSettingsReader } from "../common/appsettings-reader";


export class HomePageWorkflow {
private objectRepoReader: YmlReader = new YmlReader('./ObjectRepository.yml')
private testDataReader: YmlReader = new YmlReader('./TestData.yml')
private dbSettingsReader = new DBSettingsReader('./DBSettings.xml')
private xmlReader: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml')
private webBrowserUtil: WebBrowserUtil = new WebBrowserUtil()
private commonUtil: CommonUtil = new CommonUtil()
private apiUtil : ApiUtil = new ApiUtil()
private dpHelper: DbHelper = new DbHelper()
private sqlUtil: SqlServerUtil = new SqlServerUtil()
private mysqlUtil: MySqlServerUtil = new MySqlServerUtil()
private batProcess: ChildProcess | null = null;

        
async accesstopageLoginpagePage():Promise<any>{
  const page = globalThis.page;
  await page.goto(String(this.xmlReader.getData("URL")));
  
}

    }
module.exports = {HomePageWorkflow};
    