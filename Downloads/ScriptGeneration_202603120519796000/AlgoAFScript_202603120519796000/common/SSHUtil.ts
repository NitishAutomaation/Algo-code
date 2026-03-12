import * as path from 'path';
import * as fs from 'fs';
import { Client, ConnectConfig } from "ssh2";
import SftpClient from "ssh2-sftp-client";
import { AppSettingsReader, DBSettingsReader } from "./appsettings-reader";
import { parseString, parseStringPromise } from 'xml2js';

export class SSHUtil {
  private static host: string;
  private static user: string;
  private static password: string;
  private static port: number = 22;

  public static async loadConnectionDetails(): Promise<void> {
    try {
        const filePath = "sshconfig.xml";
        const xmlData = fs.readFileSync(filePath, "utf-8");
        const parsed = await parseStringPromise(xmlData);

        this.host = parsed['sshconfig']['SSH_Host']?.[0];
        this.user = parsed['sshconfig']['SSH_User']?.[0];
        this.password = parsed['sshconfig']['SSH_Password']?.[0];
        const portValue = parsed['sshconfig']['SSH_Port']?.[0];
        this.port = portValue ? parseInt(portValue, 10) : 22;

        if (!this.host || !this.user || !this.password) {
            throw new Error("Missing required SSH details in XML");
        }
    } catch (err) {
        throw new Error(`Failed to load sshconfig.xml. (${err})`);
    }
  }

  public static getConfig() {
    return {
      host: this.host,
      port: this.port,
      username: this.user,
      password: this.password,
      readyTimeout: 30000,
    };
  }

  public static async runCommand(command: string): Promise<string> {
    await this.loadConnectionDetails(); 
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = "";
      conn
        .on("ready", () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              reject(err);
              return;
            }
            stream
              .on("data", (data: Buffer) => {
                output += data.toString();
              })
              .on("close", () => {
                conn.end();
                resolve(output.trim());
              })
              .stderr.on("data", (data: Buffer) => {
                output += data.toString();
              });
          });
        })
        .on("error", (err) => reject(err))
        .connect(this.getConfig());
    });
  }

  public static async getDataFromFile(remoteFilePath: string): Promise<string> {
    await this.loadConnectionDetails();
    const sftp = new SftpClient();
    try {
      await sftp.connect(this.getConfig());
      const fileData = await sftp.get(remoteFilePath);
      return fileData.toString();
    } catch (err) {
      throw new Error(`Failed to read file: ${err}`);
    } 
  }

  public static async getListOfFiles(remoteDir: string): Promise<string[]> {
    await this.loadConnectionDetails(); // await
    const sftp = new SftpClient();
    try {
      await sftp.connect(this.getConfig());
      const fileList = await sftp.list(remoteDir);
      return fileList.map((file) => file.name);
    } catch (err) {
      throw new Error(`Failed to list files: ${err}`);
    } 
  }

  public static async runCommands(commands: string): Promise<boolean> {
    try {
      const parts = commands.split("&&");
      for (const cmd of parts) {
        if (cmd.includes("_delay_")) {
          const [actualCmd, delayTime] = cmd.split("_delay_");
          await this.runCommand(actualCmd.trim());
          await this.sleep(parseInt(delayTime.trim(), 10));
        } else {
          await this.runCommand(cmd.trim());
        }
      }
      return true;
    } catch (err) {
      console.error("Error running commands:", err);
      return false;
    }
  }

  private static async sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
