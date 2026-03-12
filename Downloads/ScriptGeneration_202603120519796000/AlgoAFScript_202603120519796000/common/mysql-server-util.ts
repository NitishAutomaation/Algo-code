import mysql, { Connection} from "mysql2/promise";
import { Logger } from '../common/logger';
import { DBSettingsReader } from './appsettings-reader';

const dbSettingsReader: DBSettingsReader = new DBSettingsReader("./DBsettings.xml")

export class MySqlServerUtil {
  public conn: Connection | null = null;

  constructor(conn?: Connection) {
    if (conn) this.conn = conn;
  }

  public getConn(): Connection | null {
    return this.conn;
  }

  public setConn(conn: Connection): void {
    this.conn = conn;
  }

  public async closeConnection(): Promise<void> {
    try {
      if (this.conn) {
        await this.conn.end();
        this.conn = null;
      }
    } catch (err: any) {
      Logger.error(`Error closing connection: ${err.message}`);
    }
  }

  public async createConnection(): Promise<void> {
		try {
			const dbmysqlURL = String(dbSettingsReader.getDBdata('MySQL_Host')).trim();
			const dbmysqlUsername = String(dbSettingsReader.getDBdata('MySQL_User')).trim();
			const dbmysqlPassword = String(dbSettingsReader.getDBdata('MySQL_Password')).trim();
      const dbmysqlDatabase = String(dbSettingsReader.getDBdata('MySQL_DbName')).trim();
      if(this.conn == null){
        await this.setconnection();
      }
   }catch (ex: any) {
      throw new Error(`DBSettings.xml file does not exist or has incorrect configuration: ${ex.message}`);
    }
  }

  public async setconnection(): Promise<void> {
    try {
      const url = String(dbSettingsReader.getDBdata('MySQL_Host')).trim();
      const user = String(dbSettingsReader.getDBdata('MySQL_User')).trim();
      const password = String(dbSettingsReader.getDBdata('MySQL_Password')).trim();
      const database = String(dbSettingsReader.getDBdata('MySQL_DbName')).trim();

      this.conn = await mysql.createConnection({
        host: url,
        user: user,
        password: password,
        database: database,
        multipleStatements: true, 
      });
    } catch (err: any) {
    Logger.error("Database connection error:"+err.message);
    throw err; 
    }
  } 

  public async verifyDBdata(queryDetails: string): Promise<boolean> {
    const parts = queryDetails.split('--');
    if (parts.length !== 2) throw new Error('Invalid query format. Use query--expectedValue');

    const query = parts[0].trim();
    const expectedValue = parts[1].trim();

    const rows = await this.select(query);
    for (const row of rows) {
      for (const key in row) {
        if (row[key] && row[key].toString().includes(expectedValue)) {
          Logger.info(`DB Output matches expected value: ${expectedValue}`);
          return true;
        }
      }
    }
    Logger.info(`DB Output did not match expected value: ${expectedValue}`);
    return false;
  }

  public async getSingledata(query: string): Promise<string> {
    if (!query || query.trim().length === 0) {
      throw new Error("Query cannot be null or empty.");
    }
    try {
      if (!this.conn) {
        await this.createConnection();
      }
      const [result] = await this.conn.query(query.trim());

      if (Array.isArray(result)) {
        if (result.length > 0) {
          const firstRow = result[0];
          const firstKey = Object.keys(firstRow)[0];
          const value = firstRow[firstKey];
          return String(value);
        } else {
          return "";
        }
      }
      else if (result && typeof result === "object" && "affectedRows" in result) {
        const { affectedRows} = result as any;
        Logger.info(`DML Query executed. affectedRows=${affectedRows}`);
        return `Rows affected: ${affectedRows}`; 
      }
      else {
        return "";
      }
    } catch (ex: any) {
      Logger.error(`Error executing query: ${ex.message}`);
      throw ex;
    } finally {
      await this.closeConnection();
    }
  }
  
  public async select(query: string): Promise<Array<Record<string, any>>> {
    if (!this.conn) {
      await this.createConnection();
    }
    try {
      const [rows] = await this.conn.query(query.trim());
      Logger.info(`Query executed successfully. Results retrieved: ${(rows as any[]).length}`);
      return rows as Array<Record<string, any>>;
    } catch (err: any) {
      Logger.error(`Error executing select query: ${err.message}`);
      throw err;
    } finally {
      await this.closeConnection();
    }
  }

   public async update(query: string): Promise<void> {
    if (!query || query.trim().length === 0) {
      throw new Error("Query cannot be null or empty.");
    }
    try {
      await this.createConnection(); // same as Java createConnection()
      const [result]: any = await this.conn.execute(query.trim());
      const rowsAffected: number = result.affectedRows ?? 0;
    } catch (err: any) {
      throw new Error(`Error executing update query: ${err.message}`);
    } finally {
      await this.closeConnection(); 
    }
  }

  public static validateResultSetRecords(resultSet: Array<Record<string, any>>,columnName: string,expectedValue: string): boolean {
    let isValid = false;
    try {
      if (!resultSet || resultSet.length === 0) {
        return false;
      }
      for (const row of resultSet) {
        const actualValue = row[columnName];
        Logger.info(`Comparing DB value: ${actualValue} with expected: ${expectedValue}`);
        if (actualValue !== undefined && actualValue !== null && actualValue === expectedValue) {
          isValid = true;
          break;
        }
      }
    } catch (error: any) {
      Logger.error(`Error validating result set records: ${error.message}`);
    }
    return isValid;
  }
}