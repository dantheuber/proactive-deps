## Classes

<dl>
<dt><a href="#DependencyMonitor">DependencyMonitor</a></dt>
<dd><p>A class to monitor the health of dependencies and cache their statuses.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DependencyStatus">DependencyStatus</a> : <code>Object</code></dt>
<dd><p>Represents the status of a dependency.</p></dd>
</dl>

<a name="DependencyMonitor"></a>

## DependencyMonitor
<p>A class to monitor the health of dependencies and cache their statuses.</p>

**Kind**: global class  

* [DependencyMonitor](#DependencyMonitor)
    * [new DependencyMonitor([options])](#new_DependencyMonitor_new)
    * [.register(dependency)](#DependencyMonitor+register)
    * [.getStatus(dependencyName)](#DependencyMonitor+getStatus) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.getAllStatuses()](#DependencyMonitor+getAllStatuses) ⇒ <code>Promise.&lt;Array.&lt;DependencyStatus&gt;&gt;</code>

<a name="new_DependencyMonitor_new"></a>

### new DependencyMonitor([options])
<p>Creates an instance of DependencyMonitor.</p>


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>DependencyMonitorOptions</code> | <p>Configuration options for the monitor.</p> |

<a name="DependencyMonitor+register"></a>

### dependencyMonitor.register(dependency)
<p>Registers a new dependency to be monitored.</p>

**Kind**: instance method of [<code>DependencyMonitor</code>](#DependencyMonitor)  

| Param | Type | Description |
| --- | --- | --- |
| dependency | <code>DependencyCheck</code> | <p>The dependency to register.</p> |

<a name="DependencyMonitor+getStatus"></a>

### dependencyMonitor.getStatus(dependencyName) ⇒ <code>Promise.&lt;any&gt;</code>
<p>Gets the status of a specific dependency by name.</p>

**Kind**: instance method of [<code>DependencyMonitor</code>](#DependencyMonitor)  
**Returns**: <code>Promise.&lt;any&gt;</code> - <p>The status of the dependency.</p>  
**Throws**:

- <code>Error</code> <p>If the dependency is not found.</p>


| Param | Type | Description |
| --- | --- | --- |
| dependencyName | <code>string</code> | <p>The name of the dependency.</p> |

<a name="DependencyMonitor+getAllStatuses"></a>

### dependencyMonitor.getAllStatuses() ⇒ <code>Promise.&lt;Array.&lt;DependencyStatus&gt;&gt;</code>
<p>Gets the status of all registered dependencies.</p>

**Kind**: instance method of [<code>DependencyMonitor</code>](#DependencyMonitor)  
**Returns**: <code>Promise.&lt;Array.&lt;DependencyStatus&gt;&gt;</code> - <p>An array of dependency statuses.</p>  
<a name="DependencyStatus"></a>

## DependencyStatus : <code>Object</code>
<p>Represents the status of a dependency.</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| healthy | <code>boolean</code> | <p>Indicates whether the dependency is healthy.</p> |
| code | <code>number</code> | <p>Status code (e.g., SUCCESS_STATUS_CODE, ERROR_STATUS_CODE, WARNING_STATUS_CODE).</p> |
| message | <code>string</code> | <p>Status message (e.g., SUCCESS_STATUS_MESSAGE, ERROR_STATUS_MESSAGE, WARNING_STATUS_MESSAGE).</p> |
| [error] | <code>Error</code> | <p>Optional error object if the check fails.</p> |
| [errorMessage] | <code>string</code> | <p>Optional error message if the check fails.</p> |
| latencyMs | <code>number</code> | <p>The latency of the dependency check in milliseconds.</p> |

