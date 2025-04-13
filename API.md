## Classes

<dl>
<dt><a href="#DependencyMonitor">DependencyMonitor</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DependencyCheckFunction">DependencyCheckFunction</a> ⇒ <code><a href="#DependencyCheckResult">Promise.&lt;DependencyCheckResult&gt;</a></code></dt>
<dd><p>An async function that performs a dependency check.</p></dd>
<dt><a href="#DependencyCheckOptions">DependencyCheckOptions</a> : <code>Object</code></dt>
<dd><p>Represents a dependency to be monitored.</p></dd>
<dt><a href="#DependencyCheckResult">DependencyCheckResult</a> : <code>number</code> | <code>Object</code></dt>
<dd><p>The result of a dependency check.
Can be either a number (status code) or an object containing error details.</p></dd>
<dt><a href="#DependencyMonitorOptions">DependencyMonitorOptions</a> : <code>Object</code></dt>
<dd><p>Configuration options for the DependencyMonitor.
For information on how cache duration and refresh threshold work together, see <a href="https://github.com/jaredwray/cacheable/tree/main/packages/cache-manager#options">cache-manager</a></p></dd>
<dt><a href="#DependencyStatus">DependencyStatus</a> : <code>Object</code></dt>
<dd><p>Represents the status of a dependency.</p></dd>
</dl>

<a name="DependencyMonitor"></a>

## DependencyMonitor
**Kind**: global class  
**Implements**: <code>DependencyMonitorInterface</code>  
<a name="new_DependencyMonitor_new"></a>

### new DependencyMonitor([options])
<p>DependencyMonitor is a class that monitors the status of various dependencies
(e.g., databases, APIs) and provides methods to check their health and latency.
It uses a cache to store the results of the checks and can be configured
to refresh the cache at specified intervals.
It also provides a method to get Prometheus metrics for the monitored dependencies.</p>


| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>DependencyMonitorOptions</code>](#DependencyMonitorOptions) | <p>Optional configuration options for the monitor.</p> |
| [options.cacheDurationMs] | <code>number</code> | <p>Duration (in milliseconds) to cache the dependency check result.</p> |
| [options.refreshThresholdMs] | <code>number</code> | <p>Duration (in milliseconds) to refresh the dependency check result.</p> |
| [options.checkIntervalMs] | <code>number</code> | <p>Interval (in milliseconds) for running dependency checks.</p> |

**Example**  
```js
const monitor = new DependencyMonitor({
  cacheDurationMs: 60000, // Cache duration of 1 minute
  refreshThresholdMs: 5000, // Refresh threshold of 5 seconds
  checkIntervalMs: 15000, // Check interval of 15 seconds
});
```
<a name="DependencyCheckFunction"></a>

## DependencyCheckFunction ⇒ [<code>Promise.&lt;DependencyCheckResult&gt;</code>](#DependencyCheckResult)
<p>An async function that performs a dependency check.</p>

**Kind**: global typedef  
**Returns**: [<code>Promise.&lt;DependencyCheckResult&gt;</code>](#DependencyCheckResult) - <p>The result of the dependency check.</p>  
**Example**  
```js
import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from 'proactive-deps';
const checkDatabaseConnection = async () => {
  // Perform the check (e.g., ping the database)
  const isConnected = await database.ping();
  return isConnected ?
   SUCCESS_STATUS_CODE :
   { code: ERROR_STATUS_CODE, errorMessage: 'Database not reachable' };
};
```
<a name="DependencyCheckOptions"></a>

## DependencyCheckOptions : <code>Object</code>
<p>Represents a dependency to be monitored.</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>The name of the dependency.</p> |
| description | <code>string</code> | <p>A description of the dependency.</p> |
| impact | <code>string</code> | <p>The impact of the dependency on the system, should it go down.</p> |
| check | [<code>DependencyCheckFunction</code>](#DependencyCheckFunction) | <p>A function that performs the dependency check and returns a result.</p> |
| [cacheDurationMs] | <code>number</code> | <p>Optional override duration (in milliseconds) to cache the dependency check result.</p> |
| [refreshThresholdMs] | <code>number</code> | <p>Optional override duration (in milliseconds) to refresh the dependency check result.</p> |

**Example**  
```js
const monitor = new DependencyMonitor();

monitor.register({
  name: 'Some Database',
  description: 'Database connection check',
  impact: 'Database data will be unavailable.',
  cacheDurationMs: 30000, // override cache duration to 30 seconds
  refreshThresholdMs: 10000, // override refresh threshold to 10 seconds
  check: async () => {
   // Perform some check (e.g., ping a database)
   return SUCCESS_STATUS_CODE;
  },
});
```
<a name="DependencyCheckResult"></a>

## DependencyCheckResult : <code>number</code> \| <code>Object</code>
<p>The result of a dependency check.
Can be either a number (status code) or an object containing error details.</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| code | <code>number</code> | <p>The status code of the check.</p> |
| [error] | <code>Error</code> | <p>The error object if the check fails.</p> |
| [errorMessage] | <code>string</code> | <p>Optional error message if the check fails.</p> |

**Example**  
```js
import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from 'proactive-deps';
const checkDatabaseConnection = async () => {
  // Perform the check (e.g., ping the database)
  try {
    await database.ping();
    return SUCCESS_STATUS_CODE;
  } catch (error) {
    return {
      code: ERROR_STATUS_CODE,
      error: error,
      errorMessage: 'Database not reachable',
    };
  }
};
```
<a name="DependencyMonitorOptions"></a>

## DependencyMonitorOptions : <code>Object</code>
<p>Configuration options for the DependencyMonitor.
For information on how cache duration and refresh threshold work together, see <a href="https://github.com/jaredwray/cacheable/tree/main/packages/cache-manager#options">cache-manager</a></p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [cacheDurationMs] | <code>number</code> | <p>Optional cache duration in milliseconds. Defaults to 1 minute.</p> |
| [refreshThresholdMs] | <code>number</code> | <p>Optional refresh threshold in milliseconds. Defaults to 5 seconds.</p> |
| [checkIntervalMs] | <code>number</code> | <p>Optional interval for running dependency checks in milliseconds. Defaults to 15 seconds.</p> |

**Example**  
```js
// monitor with default options
const monitor = new DependencyMonitor();
```
**Example**  
```js
// monitor with custom options
const monitor = new DependencyMonitor({
  cacheDurationMs: 60000, // Cache duration of 1 minute
  refreshThresholdMs: 5000, // Refresh threshold of 5 seconds
  checkIntervalMs: 15000, // Check interval of 15 seconds
});

monitor.startDependencyCheckInterval();
```
<a name="DependencyStatus"></a>

## DependencyStatus : <code>Object</code>
<p>Represents the status of a dependency.</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>The name of the dependency.</p> |
| description | <code>string</code> | <p>Description of the dependency.</p> |
| impact | <code>string</code> | <p>Impact of the dependency on the system.</p> |
| healthy | <code>boolean</code> | <p>Indicates whether the dependency is healthy.</p> |
| code | <code>number</code> | <p>Status code (e.g., SUCCESS_STATUS_CODE (0), ERROR_STATUS_CODE (1), WARNING_STATUS_CODE (2)).</p> |
| status | <code>string</code> | <p>Status message (e.g., SUCCESS_STATUS_MESSAGE, ERROR_STATUS_MESSAGE, WARNING_STATUS_MESSAGE).</p> |
| latencyMs | <code>number</code> | <p>The latency of the dependency check in milliseconds.</p> |
| lastChecked | <code>string</code> | <p>The ISO timestamp of the last check.</p> |
| [error] | <code>Object</code> | <p>If the check fails, this contains the error object.</p> |
| [error.name] | <code>string</code> | <p>The name of the error.</p> |
| [error.message] | <code>string</code> | <p>The error message.</p> |
| [error.stack] | <code>string</code> | <p>The stack trace of the error.</p> |
| [errorMessage] | <code>string</code> | <p>Optional error message if the check fails.</p> |

**Example**  
```js
const dependencyStatus: DependencyStatus = monitor.getStatus('Some Database');
console.log(dependencyStatus);
// Output:
// {
//   name: 'Some Database',
//   description: 'Database connection check',
//   impact: 'Database data will be unavailable.',
//   healthy: true,
//   code: 0,
//   status: 'OK',
//   latencyMs: 50,
//   lastChecked: '2023-10-01T12:00:00Z',
// }
```
