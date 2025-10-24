<!--[![Community Plus header](https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Community_Plus.png)](https://opensource.newrelic.com/oss-category/#community-plus)-->

# FireTV Vega Agent

🚀 **BETA RELEASE** 🚀

This is a beta release of the New Relic agent for Vega applications, suitable for testing and evaluation. Please report issues and provide feedback to help us improve the stability and feature set.

New Relic agent for applications running on Vega. Based on [New Relic React Native agent](https://github.com/newrelic/newrelic-react-native-agent/).

## Features

* Capture JavaScript errors.
* Track HTTP requests, responses and errors.
* Promise rejection tracking.
* Record custom events and attributes.

## Requirements

* Vega SDK v0.21+
* React Native v0.72.0+

## Build

Within the project folder, run:

```bash
npm install
npm run build
npm pack
```

This will generate a file named `firetv-vega-agent-X.Y.Z.tgz`, where `X.Y.Z` is the current version of the FireTV Vega agent.

## Installation

Add the following dependency to your `package.json` file:

```json
"firetv-vega-agent": "file:path/to/firetv-vega-agent-X.Y.Z.tgz"
```

Then run:

```bash
npm install
```

## Setup

Now open your `index.js` and add the following code to launch NewRelic (don't forget to put proper application tokens):

```js
import { AppRegistry, LogBox } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';
import * as appVersion from './package.json';
import NewRelicVegaAgent from 'newrelic-vega-agent';

/// Config keys (if not set, default value is true)
let config = {
  // Capture Javascript errors
  recordJsErrors: true,

  // Capture Promise rejections
  recordPromiseRejections: true,

  // Capture HTTP requests
  recordFetchResults: true,
};

// Set Account ID, API Key and Endpoint (either "US" or "EU").
NewRelicVegaAgent.startAgent("<ACCOUNT ID>", "<API KEY>", "<ENDPOINT>", config);

// Optional:
NewRelicVegaAgent.setAppVersion(appVersion.version);
NewRelicVegaAgent.setAppName(appName);

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
```

## SDK Usage

Our public Vega SDK API methods let you collect custom data, configure default settings, and more.

### recordCustomEvent(eventType: string, attributes?: {[key: string]: any}): void;
> Creates and records a custom event for use in New Relic Insights.
  ```js
  NewRelicVegaAgent.recordCustomEvent("mobileClothes", {"pantsColor": "blue","pantssize": 32,"belt": true});
  ```

### recordCustomError(error: Error, attributes?: {[key: string]: any}): void;
> Creates and records a custom error event for use in New Relic Insights.
  ```js
  NewRelicVegaAgent.recordCustomError({message:"error message", name: "CustomError"});
  ```

### recordError(e: string|error): void;
> Records javascript errors for react-native.
  ```js
  try {
    var foo = {};
    foo.bar();
  } catch(e) {
    NewRelicAgent.recordError(e);
  }
  ```
### recordError(e: string|error, isFatal: boolean): void;
> Records javascript errors with isFatal flag.
  ```js
  try {
    var foo = {};
    foo.bar();
  } catch(e) {
    NewRelicVegaAgent.recordError(e, true);
  }
  ```

### setMaxEventBufferTime(maxBufferTimeInSeconds: number): void;
> Sets the event harvest cycle length. Default is 600 seconds (10 minutes). Minimum value can not be less than 60 seconds. Maximum value should not be greater than 600 seconds.
  ```js
  NewRelicVegaAgent.setMaxEventBufferTime(60);
  ```

### setAttribute(attributeName: string, value: boolean | number | string): void;
> Creates a custom attribute with a specified name and value. Overwrites its previous value and type each time it is called.
  ```js
  NewRelicVegaAgent.setAttribute('CustomAttrNumber', 37);
  ```
### removeAttribute(name: string): void;
> Remove a custom attribute with a specified name and value.
  ```js
  NewRelicVegaAgent.removeAttribute('CustomAttrNumber');
  ```
### removeAllAttributes(): void;
> Removes all attributes from the session.
  ```js
  NewRelicVegaAgent.removeAllAttributes();
  ```
### setAppVersion(version: string): void;
> Set the app version.
  ```js
  NewRelicVegaAgent.setAppVersion('v1.0.0');
  ```
### setAppName(name: string): void;
> Set the app name.
  ```js
  NewRelicVegaAgent.setAppName('NR-test');
  ```
### setUserId(userId: string): void;
> Set a custom user identifier value to associate user sessions with analytics events and attributes.
  ```js
  NewRelicVegaAgent.setUserId("RN12934");
  ```

## Data model

The Newrelic Vega agent reports the following Custom Event Types out of the box.

### VegaSystem

This event groups all actions related to system/device tracking.

```sql
SELECT * from VegaSystem SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

```sql
SELECT keyset() from VegaSystem SINCE 24 HOURS AGO
```

### VegaError

This event groups all actions related to error tracking.

```sql
SELECT * from VegaError SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

SELECT keyset() from VegaError SINCE 24 HOURS AGO

## Development

Running the agent alongside a Vega app is helpful for a quicker feedback loop. You can use the example app we've provided in the repo, or generate a new Vega app.

### Example App

The `examples` folder contains sample applications that can be built just like any Vega app. The [Sample app](./examples/KeplerProject) is pre-configured to work with the agent source code. The steps are outlined below.

1. Install deps and run the agent in dev mode

    ```bash
    # install deps
    > npm install
    ```

2. The agent setup from [Setup](#setup) has been added. However, you need to add `ACCOUNT_ID`, `LICENSE_KEY`, and `ENDPOINT` params to the `startAgent(...)` function.

3. Build and deploy the app to the Simulator.

    ```bash
    # Navigate to sample app
    > cd examples/KeplerProject

    # Install deps
    > npm install

    # Start Simulator
    > kepler device simulator start

    # Build and run app (command provided is for M1 architecture)
    > kepler build -b Debug -t sim_tv_aarch64 && kepler run-kepler build/aarch64-release/keplerproject_aarch64.vpkg com.amazondeveloper.keplerproject.main -s

    # Finally, stop the app
    > kepler device simulator stop
    ```

The app will open a simple interface in QEMU that can be used to simulate commands to the agent SDK.


## Support

For general help and support, please contact New Relic Account Team.

## Privacy

At New Relic we take your privacy and the security of your information seriously, and are committed to protecting your information. We must emphasize the importance of not sharing personal data in public forums, and ask all users to scrub logs and diagnostic information for sensitive information, whether personal, proprietary, or otherwise.

We define “Personal Data” as any information relating to an identified or identifiable individual, including, for example, your name, phone number, post code or zip code, Device ID, IP address, and email address.

For more information, review New Relic’s General Data Privacy Notice.

## License.

FireTV Vega Agent is licensed under the [New Relic Pre-release policy](https://docs.newrelic.com/docs/licenses/license-information/referenced-policies/new-relic-pre-release-policy/).

**Beta Release Notice:**
- This is a beta release suitable for testing and evaluation
- APIs may change in future versions based on feedback
- Please report issues and provide feedback via GitHub issues
- Contributions and pull requests are welcome

It also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the [third-party notices document](./THIRD_PARTY_NOTICES.md).
