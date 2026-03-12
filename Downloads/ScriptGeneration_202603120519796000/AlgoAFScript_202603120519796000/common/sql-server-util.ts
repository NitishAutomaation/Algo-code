import { ConnectionPool, IResult, config as SqlConfig} from 'mssql';
import { Logger } from '../common/logger';
import { DBSettingsReader } from './appsettings-reader';
import sql from 'mssql';

export class SqlServerUtil {
    public connection: sql.ConnectionPool | null = null;
    public results: sql.IResult<any> | null = null;
    public static dbUrl: string;
    public static dbUsername: string;
    public static dbPassword: string;
    public dbSettingsReader: DBSettingsReader = new DBSettingsReader("./DBsettings.xml")

  public async createConnection(): Promise<void> {
    try {
      const dbUrl = await this.dbSettingsReader.getDBdata('Sql_DbURL');
      const dbUsername = await this.dbSettingsReader.getDBdata('Sql_DbUsername');
      const dbPassword = await this.dbSettingsReader.getDBdata('Sql_DbPassword');
      const dbDatabase = await this.dbSettingsReader.getDBdata('Sql_DbName'); // if available
      const dbPort = parseInt(await this.dbSettingsReader.getDBdata('Sql_DbPort'), 10);
      if (!this.connection || !this.connection.connected) {
        await this.setConnection(dbUrl, dbUsername, dbPassword, dbDatabase, dbPort);
      }
    } catch (error) {
      throw new Error(`DBSettings.xml file does not exist or has incorrect configuration: ${error}`);
    }
  }

  private async setConnection(server: string, user: string, password: string, database: string, port: number): Promise<void> {
  try {
    const config: sql.config = {server,port,user,password,database,
      options: {
        trustServerCertificate: true,
        encrypt: false,
      },
    };
    this.connection = await sql.connect(config);
  } catch (error) {
    Logger.error('Database connection error:'+ error);
  }
  }


  public async closeConnection(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  public async executeQuery(query: string): Promise<any[]> {
    if (!this.connection) {
      throw new Error('Connection not established.');
    }
    const result = await this.connection.request().query(query);
    this.results = result;
    return result.recordset;
  }

  public async verifyDBdata(paramQuery: string): Promise<boolean> {
    let status = false;
    try {
      const queryDetails = paramQuery.split("--");
      if (queryDetails.length !== 2) {
        throw new Error("Invalid parameter.");
      }
      const query = queryDetails[0].trim();
      const expectedValue = queryDetails[1].replace("[", "").replace("]", "").trim();
     
      if (!this.connection) {
        await this.createConnection();
      }
      const result: IResult<any> = await this.connection!.request().query(query);
      const resultList = result.recordset;
      for (const row of resultList) {
        for (const value of Object.values(row)) {
          if (value && value.toString().includes(expectedValue)) {
            Logger.info(`DB Output matches expected value: ${expectedValue}`);
            status = true;
            return true;
          }
        }
      }
    } catch (ex: any) {
      Logger.error("Error verifying DB data: " + ex.message);
    } finally {
      try {
        await this.connection?.close();
      } catch {
        Logger.error("Error closing DB connection.");
      }
    }
    return status;
  }

  public async update(query: string): Promise<void> {
    Logger.info(`Executing query: ${query}`);
    try {
      if(!this.connection || !this.connection.connected) {
        await this.createConnection();
      }
      if (this.connection) {
        const request = this.connection.request();
        await request.query(query.trim());
        Logger.info("Query updated successfully.");
      } 
    } catch (error: any) {
      throw new Error(`SQL Execution Error: ${error.message}`);
    } finally {
      await this.closeConnection();
    }
  }

  public async getSingledata(query: string): Promise<string> {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be null or empty.");
  }
  try {
    if (!this.connection || !this.connection.connected) {
      await this.createConnection();
    }
    const result = await this.connection!.request().query(query.trim());
    if (result.recordset && result.recordset.length > 0) {
      const firstRow = result.recordset[0];
      const firstKey = Object.keys(firstRow)[0];
      const value = firstRow[firstKey];
      return String(value);
    }
    else if (result.rowsAffected && result.rowsAffected.length > 0) {
      return `Rows affected: ${result.rowsAffected[0]}`;
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

public static validateResultSetRecords(resultSet: IResult<any>,comparedValue: string,columnIndex: number): boolean {
    try {
      if (!resultSet || !resultSet.recordset || resultSet.recordset.length === 0) {
        return false;
      }
      const firstRow = resultSet.recordset[0];
      const keys = Object.keys(firstRow);
      if (columnIndex < 1 || columnIndex > keys.length) {
        return false;
      }
      const columnKey = keys[columnIndex - 1];
      const columnValue = firstRow[columnKey];
      Logger.info(`Comparing Result Set Value: ${columnValue}`);
      if (columnValue == null) {
        return false;
      }
      return String(columnValue).trim().toLowerCase() === comparedValue.trim().toLowerCase();
    } catch (error: any) {
      Logger.error(`Error validating result set: ${error.message}`);
      return false;
    }
  }

}