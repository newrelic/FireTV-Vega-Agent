/*
 * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
 *
 * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
 */

import { AppRegistry, LogBox } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';
import NewRelicAgent from 'newrelic-kepler-agent';

// Temporary workaround for problem with nested text
// not working currently.
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

NewRelicAgent.startAgent("<ACCOUNT ID>", "<API KEY>", "<ENDPOINT>", config);
LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);
