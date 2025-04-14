/**
 * Defines the structure of a Database check details.
 * @typedef {Object} DatabaseCheckDetails
 * @property {string} type - The type of check, which is 'database' in this case.
 * @property {string} server - The server name or IP address of the database.
 * @property {string} database - The name of the database to connect to.
 * @property {string} [dbType] - The type of database (e.g., MySQL, PostgreSQL, etc.). This is optional and can be used to specify the database type if needed.
 * @property {string} [connectionString] - The connection string used to connect to the database. Do not provide real authentication tokens here. These are just examples.
 * @property {string} [query] - Optional SQL query being executed to check the database connection.
 * @property {string} [proc] - Optional stored procedure being executed to check the database connection.
 * @property {number} [timeoutMs] - Optional timeout in milliseconds for the database query.
 * @property {number} [expectedRowCount] - Optional The expected number of rows returned from the query.
 * @property {string} [expectedResponse] - Optional description of value in response being checked for.
 * @example
 * const databaseCheckDetails: DatabaseCheckDetails = {
 *   type: 'database',
 *   server: 'localhost',
 *   database: 'mydb',
 *   dbType: 'mysql',
 *   connectionString: 'mysql://user:password@localhost/mydb', // do not expose real authentication tokens here
 *   proc: 'GetUserById',
 *   query: 'SELECT * FROM users WHERE id = 1',
 *   timeoutMs: 5000,
 *   expectedRowCount: 1,
 *   expectedResponse: 'John Doe',
 * };
 */
export type DatabaseCheckDetails = {
  type: 'database';
  server: string;
  database: string;
  dbType?: string;
  connectionString?: string;
  query?: string;
  proc?: string;
  timeoutMs?: number;
  expectedRowCount?: number;
  expectedResponse?: string | RegExp;
};
