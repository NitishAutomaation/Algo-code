import { MongoClient, Db } from "mongodb";
import { Logger } from "../common/logger";
import { DBSettingsReader } from "../common/appsettings-reader";

const dbSettingsReader: DBSettingsReader = new DBSettingsReader("./DBSettings.xml");

export class MongoDBUtil {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    try {
      const mongoUrl = String(await dbSettingsReader.getDBdata("MongoDB_DbURL")).trim();
      const dbName = String(await dbSettingsReader.getDBdata("MongoDB_DbName")).trim();
      this.client = new MongoClient(mongoUrl);
      await this.client.connect();
      this.db = this.client.db(dbName);
    } catch (err: any) {
      Logger.error("MongoDB connection error: " + err.message);
      throw err;
    }
  }

  /**
   * Safely close MongoDB connection
   */
  public async closeConnection(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
      }
    } catch (err: any) {
      Logger.error("Error closing MongoDB connection: " + err.message);
    }
  }

  /**
   * Fetch one record from a collection based on query
   */
  public async getSingleData(collectionName: string, query: any): Promise<Record<string, any> | null> {
    try {
      if (!this.db) await this.connect();
      const collection = this.db.collection(collectionName);
      const result = await collection.findOne(query);
      if (result) {
        Logger.info(`Found MongoDB record: ${JSON.stringify(result)}`);
      } 
      return result;
    } catch (err: any) {
      Logger.error(`MongoDB query error: ${err.message}`);
      throw err;
    } finally {
      await this.closeConnection();
    }
  }

  /**
   * Verify if a specific field has the expected value
   */
  public async verifyDBData(collectionName: string, query: any, expectedField: string, expectedValue: string): Promise<boolean> {
    try {
      const result = await this.getSingleData(collectionName, query);
      if (!result) {
        Logger.error("No data found for MongoDB verification");
        return false;
      }

      const actualValue = result[expectedField];
      const match = String(actualValue) === String(expectedValue);
      if (match) {
        Logger.info(`MongoDB verification passed: ${expectedField} = ${expectedValue}`);
      } else {
        Logger.error(`MongoDB verification failed: expected ${expectedValue}, got ${actualValue}`);
      }
      return match;
    } catch (err: any) {
      Logger.error(`Error verifying MongoDB data: ${err.message}`);
      return false;
    }
  }
}
