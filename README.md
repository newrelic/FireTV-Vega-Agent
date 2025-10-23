<!--[![Community Plus header](https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Community_Plus.png)](https://opensource.newrelic.com/oss-category/#community-plus)-->

# New Relic Kepler Agent

New Relic agent for Amazon Kepler applications. Based on [New Relic React Native agent](https://github.com/newrelic/newrelic-react-native-agent/).

## Features

* Capture JavaScript errors.
* Track HTTP requests, responses and errors.
* Promise rejection tracking.
* App navigation tracking, using breadcrumbs.
* Record custom events and attributes.
* Record custom breadcrumbs.
* Record custom errors.
* Record custom logs.
* Record custom metrics.
* Video player tracking (using [video trackers](#video-tracking)).
* Track console logs, warns, and errors, via NR logs.

Not Yet Implemented:

* Distributed tracing.

## Requirements

* Kepler SDK v0.7+
* React Native v0.72.0+

## Build

Within the project folder, run:

```bash
npm install
npm run build
npm pack
```

This will generate a file named `newrelic-kepler-agent-X.Y.Z.tgz`, where `X.Y.Z` is the current version of the Kepler agent.

## Installation

Add the following dependency to your `package.json` file:

```json
"newrelic-kepler-agent": "file:path/to/newrelic-kepler-agent-X.Y.Z.tgz"
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
import NewRelicAgent from 'newrelic-kepler-agent';

/// Config keys (if not set, default value is true)
let config = {
  // Capture Javascript errors
  recordJsErrors: true,

  // Capture Promise rejections
  recordPromiseRejections: true,

  // Capture HTTP requests
  recordFetchResults: true,

  // Capture console logs
  recordConsoleLogs: true,
};

// Set Account ID, API Key and Endpoint (either "US" or "EU").
NewRelicAgent.startAgent("<ACCOUNT ID>", "<API KEY>", "<ENDPOINT>", config);

// Optional:
NewRelicAgent.setAppVersion(appVersion.version);
NewRelicAgent.setAppName(appName);

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
```

## Crash Reporting

> [!CAUTION]
> The native crash reporting module is not currently available for pre-release. Check back or contact us via one of the [support](#support) options for more information.

Native crash reporting is supported by a [separate module](https://github.com/newrelic-experimental/newrelic-kepler-crash-turbomodule). If you are interested in having native crash reports, please check the installation and setup instructions.

## SDK Usage

Our public Kepler SDK API methods let you collect custom data, configure default settings, and more.

### recordCustomEvent(eventType: string, attributes?: {[key: string]: any}): void;
> Creates and records a custom event for use in New Relic Insights.
  ```js
  NewRelicAgent.recordCustomEvent("mobileClothes", {"pantsColor": "blue","pantssize": 32,"belt": true});
  ```

### recordSystemEvent(attributes?: {[key: string]: any}): void;
> Creates and records a KeplerSystem event for use in New Relic Insights.
  ```js
  NewRelicAgent.recordSystemEvent({"pantsColor": "blue","pantssize": 32,"belt": true});
  ```

### recordCustomError(error: Error, attributes?: {[key: string]: any}): void;
> Creates and records a custom error event for use in New Relic Insights.
  ```js
  NewRelicAgent.recordCustomError({message:"error message", name: "CustomError"});
  ```

### recordBreadcrumb(eventName: string, attributes?: {[key: string]: any}): void;
> Creates and records a KeplerBreadcrumb event. Used to track app activity/screen that may be helpful for troubleshooting crashes.
  ```js
  NewRelicAgent.recordBreadcrumb("MyEvent", {"attr": "value"});
  ```
### recordLog(message: string, attributes?: {[key: string]: any}): void;
> Creates and records a Log.
  ```js
  NewRelicAgent.recordLog("log message", {"attr": "value"});
  ```
### recordGaugeMetric(name: string, value: number, attributes?: {[key: string]: any}): void
> Record a gauge metric. Represents a value that can increase or decrease with time.
  ```js
  NewRelicAgent.recordMetric('CustomMetricName', 11.1, {"attr": "value"});
  ```
### recordCountMetric(name: string, value: number, interval: number, attributes?: {[key: string]: any}): void
> Record a count metric. Measures the number of occurrences of an event during a time interval.
  ```js
  NewRelicAgent.recordMetric('CustomMetricName', 250, 1500, {"attr": "value"});
  ```

### recordSummaryMetric(name: string, count: number, max: number, min: number, sum: number, interval: number, attributes?: {[key: string]: any}): void
> Record a summary metric. Used to report pre-aggregated data, or information on aggregated discrete events.
  ```js
  NewRelicAgent.recordMetric('CustomMetricName', 2000, 5, 1000, 100, 200, {"attr": "value"});
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
    NewRelicAgent.recordError(e, true);
  }
  ```

### setMaxEventBufferTime(maxBufferTimeInSeconds: number): void;
> Sets the event harvest cycle length. Default is 600 seconds (10 minutes). Minimum value can not be less than 60 seconds. Maximum value should not be greater than 600 seconds.
  ```js
  NewRelicAgent.setMaxEventBufferTime(60);
  ```

### setAttribute(attributeName: string, value: boolean | number | string): void;
> Creates a custom attribute with a specified name and value. Overwrites its previous value and type each time it is called.
  ```js
  NewRelicAgent.setAttribute('CustomAttrNumber', 37);
  ```
### removeAttribute(name: string): void;
> Remove a custom attribute with a specified name and value.
  ```js
  NewRelicAgent.removeAttribute('CustomAttrNumber');
  ```
### removeAllAttributes(): void;
> Removes all attributes from the session.
  ```js
  NewRelicAgent.removeAllAttributes();
  ```
### setAppVersion(version: string): void;
> Set the app version.
  ```js
  NewRelicAgent.setAppVersion('v1.0.0');
  ```
### setAppName(name: string): void;
> Set the app name.
  ```js
  NewRelicAgent.setAppName('NR-test');
  ```
### setUserId(userId: string): void;
> Set a custom user identifier value to associate user sessions with analytics events and attributes.
  ```js
  NewRelicAgent.setUserId("RN12934");
  ```

## Data model

The Kepler Agent reports the following Custom Event Types out of the box.

### KeplerSystem

This event groups all actions related to system/device tracking.

```sql
SELECT * from KeplerSystem SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

```sql
SELECT keyset() from KeplerSystem SINCE 24 HOURS AGO
```

We will document these in a future release.

### Kepler Video

This event groups all actions related to video tracking.

```sql
SELECT * from KeplerVideo SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

```sql
SELECT keyset() from KeplerVideo SINCE 24 HOURS AGO
```

We will document these in a future release.

### KeplerError

This event groups all actions related to error tracking.

```sql
SELECT * from KeplerError SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

SELECT keyset() from KeplerError SINCE 24 HOURS AGO

We will document these in a future release.

### KeplerBreadcrumb

This event groups all actions related to navigation event tracking.

```sql
SELECT * from KeplerBreadcrumb SINCE 24 HOURS AGO
```

To see a list of all keys, use the keyset() function:

```sql
SELECT keyset() from KeplerBreadcrumb SINCE 24 HOURS AGO
```

We will document these in a future release.

## Video tracking

Kepler uses the W3C Media standard for the video player interface, that can be tracked using the New Relic's [HTML5 Video Tracker](https://github.com/newrelic/video-html5-js).

### Video tracker install

Add the following dependency to your `package.json` file:

```json
"newrelic-video-html5": "git+https://github.com/newrelic/video-html5-js.git"
```

Then run:

```bash
npm install
```

### Video tracker setup

Open the `.tsx` file where you defined your video player and add:

```js
// @ts-ignore
import * as nrvideo from 'newrelic-video-html5'
```

Then find the line where you created the `VideoPlayer` and build the video tracker immediately after:

```js
// video player created here
video.current = new VideoPlayer();

// Build newrelic video tracker
nrvideo.Core.addTracker(new nrvideo.Html5Tracker(video.current));
```

## Development

Running the agent alongside a Kepler app is helpful for a quicker feedback loop. You can use the example app we've provided in the repo, or generate a new Kepler app and reference the agent (i) from source (ii) as a npm package.

### Example App

The `examples` folder contains sample applications that can be built just like any Kepler app. The [Sample app](./examples/sampleapp) is pre-configured to work with the agent source code. The steps are outlined below.

1. Install deps and run the agent in dev mode

    ```bash
    # install deps
    > npm install

    # Run in dev mode (this will run the build and then run tsc in watch mode for continuous compilation)
    > npm run dev
    ```

2. The agent setup from [Setup](#setup) has been added. However, you need to add `ACCOUNT_ID`, `LICENSE_KEY`, and `ENDPOINT` params to the `startAgent(...)` function.

3. Build and deploy the app to the Simulator.

    ```bash
    # Navigate to sample app
    > cd examples/sampleapp

    # Install deps
    > npm install

    # Start Simulator
    > kepler device simulator start

    # Build and run app (command provided is for M1 architecture)
    > kepler build -b Debug -t sim_tv_aarch64 && kepler run-kepler build/vega-tv2023-aarch64-debug/sampleapp_aarch64.vpkg com.newrelic.sampleapp.main -s

    # Open shell to the simulator
    > kepler device shell -d Simulator

    # see logs in the simulator terminal:
    > journalctl --follow --since now --identifier keplerscript-ru

    # Finally, stop the app
    > kepler device simulator stop
    ```

The app will open a simple interface in QEMU that can be used to simulate commands to the agent SDK.

### Generate Kepler App

You can also generate a new app and configure by following the steps below.

1. Download the Kepler SDK tools from Amazon
2. Generate a new Kepler app

    ```bash
    # Generate Kepler App
    > kepler project generate --template ksAppV0.72 --name sampleapp --packageId com.newrelic.sampleapp
    ```

3. Modify the metro config to reference the agent repo with `extraNodeModules` and `watchFolders`. The paths below assume the agent codebase and sample app are in the same directory:

    ```bash
    # agent and sample app are in same directory
    > ls
    sampleapp/
    newrelic-kepler-agent/
    ```

    ```javascript
    // metro.config.js
    /*
    * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
    *
    * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
    */
    const path = require('path');

    const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
    const exclusionList = require('metro-config/src/defaults/exclusionList');

    /**
    + * Metro configuration
    + * https://facebook.github.io/metro/docs/configuration
      *
    + * @type {import('metro-config').MetroConfig}
      */
    const config = {
      resolver: {
        extraNodeModules: {
          'newrelic-kepler-agent': path.resolve(__dirname, '../newrelic-kepler-agent')
        },
        blockList: exclusionList([/.*newrelic-kepler-agent\/examples\/.*/]),
      },
      watchFolders: [
        path.resolve(__dirname, '../newrelic-kepler-agent'),
      ],
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
      },
    };

    module.exports = mergeConfig(getDefaultConfig(__dirname), config);
    ```

4. Install/Link `newrelic-kepler-agent` dependency

    From testing, it seems relative paths can be used in import statements:

    ```javascript
    import NewRelicAgent from '../newrelic-kepler-agent';
    ```

    However, it's recommended to install the app as a package using the local path:

    ```json
    "dependencies": {
      "@amazon-devices/react-native-kepler": "~2.0.0",
      "react": "18.2.0",
      "react-native": "0.72.0",
      "newrelic-kepler-agent": "file:../newrelic-kepler-agent"
    },
    ```

    Then, run:

    ```bash
    > ls
    sampleapp/
    newrelic-kepler-agent/

    > cd sampleapp

    # install deps
    > npm install
    ```

    After this, imports can simply reference the agent package:

    ```javascript
    import NewRelicAgent from 'newrelic-kepler-agent';

    ...

    NewRelicAgent.setAppName("appName");
    ```

    > Note: It's possible `npm link` would suffice here as well, it just hasn't been tested yet.

5. Follow the [Setup](#setup) steps above to add the `NewRelicAgent` config to the index.js file of the Kepler app.

    > Note: Remember to add `ACCOUNT_ID`, `LICENSE_KEY`, and `ENDPOINT` params to the `startAgent(...)` function.

6. Run the agent in dev mode

    ```bash
    > ls
    sampleapp/
    newrelic-kepler-agent

    > cd newrelic-kepler-agent

    # Run in dev mode
    > npm run dev
    ```

7. Build and deploy the Kepler app to the Simulator

    ```bash
    # Start Simulator
    > kepler device simulator start

    # Build and run app (command provided is for M1 architecture)
    > kepler build -b Debug -t sim_tv_aarch64 && kepler run-kepler build/vega-tv2023-aarch64-debug/sampleapp_aarch64.vpkg com.newrelic.sampleapp.main -s

    # Open shell to the simulator
    > kepler device shell -d Simulator

    # see logs in the simulator terminal:
    > journalctl --follow --since now --identifier keplerscript-ru

    # Finally, stop the app
    > kepler device simulator stop
    ```

## Support

For general help and support, please contact <cmccarthy@newrelic.com>

To file an issue and/or feature request, please contact <labs@newrelic.com>

## Privacy

At New Relic we take your privacy and the security of your information seriously, and are committed to protecting your information. We must emphasize the importance of not sharing personal data in public forums, and ask all users to scrub logs and diagnostic information for sensitive information, whether personal, proprietary, or otherwise.

We define “Personal Data” as any information relating to an identified or identifiable individual, including, for example, your name, phone number, post code or zip code, Device ID, IP address, and email address.

For more information, review New Relic’s General Data Privacy Notice.

## License

New Relic Kepler agent is licensed under the New Relic Pre-Release Software Notice.

It also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the [third-party notices document](./THIRD_PARTY_NOTICES.md).
