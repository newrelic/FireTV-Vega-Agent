import { AppRegistry, LogBox } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';
import NewRelicVegaAgent from 'newrelic-vega-agent';
import {NrKeplerCrash} from '@amzn/nrkeplercrash';

NrKeplerCrash.registerHandler("1", "db67dbb78d97df86de772f370ab6ef9caeccNRAL", "US");
NrKeplerCrash.setSessionId(`session-${Date.now()}`);
NrKeplerCrash.setCustomAttributes({
  userId: "user123",
  environment: "production",
  feature: "checkout",
});

NewRelicVegaAgent.startAgent("1", "db67dbb78d97df86de772f370ab6ef9caeccNRAL", "US", {
  recordJsErrors: true,
  recordPromiseRejections: true,
  recordFetchResults: true,
  recordConsoleLogs: true,
});



LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);
