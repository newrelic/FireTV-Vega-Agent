/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import utils from './nr-utils';
import { LOG } from './nr-logger';
import { Platform } from 'react-native';
import version from './version';
import {
  getUnhandledPromiseRejectionTracker,
  setUnhandledPromiseRejectionTracker,
} from 'react-native-promise-rejection-utils'
import { NrAgent } from './agent';

//TODO: move all the business logic into modules at new-relic/agent, and only leave here a mere interface (and convert it into TS).

/**
 * New Relic agent interface.
 */
class NewRelicAgent {
  constructor() {
    this.state = {
      didAddErrorHandler: false,
      didAddPromiseRejection: false,
      didOverrideConsole: false,
      didOverrideFetch: false,
      isFirstScreen: true
    };
    this.lastScreen = '';
    this.LOG = LOG;
    this.agentVersion = version;
    this.isAgentStartedFlag = false;

    // Original log methods
    console._nrLog = console.log;
    console._nrWarn = console.warn;
    console._nrError = console.error;
    // Original fetch method
    global._nrFetch = global.fetch;
    // Interface for video trackers, they expect the New Relic Browser agent.
    let self = this;
    global.newrelic = {
      addPageAction: function(actionName, attributes) {
        attributes = attributes || {};
        attributes['actionName'] = actionName;
        self.recordCustomEvent("KeplerVideo", attributes);
      }
    }    
  }

  /**
   * True if native agent is started. False if native agent is not started.
   * @returns {boolean}
   */
  isAgentStarted = () => this.isAgentStartedFlag;

  /**
   * Navigation Route Listener
   */
  /**
   * Subcribe onNavigationStateChange Listenr from React Navigation Version 4.x and lower
   * Creates and records a MobileBreadcrumb for Current Screen
   */
  onNavigationStateChange = (prevState, newState, action) => {
    var currentScreenName = this.getCurrentRouteName(newState);
    var params = {
      'screenName': currentScreenName
    };
    this.recordBreadcrumb('navigation', params);
  }

  getCurrentRouteName = (currentState) => {
    if (!currentState) {
      return null;
    }
    const route = currentState.routes[currentState.index];
    if (route.routes) {
      return this.getCurrentRouteName(route);
    }
    return route.routeName;
  }

  /**
   * Subcribe componentDidAppearListener Listenr from React Native Navigation Package
   * Creates and records a MobileBreadcrumb for Current Screen
   */
  componentDidAppearListener = (event) => {
    if (this.state.isFirstScreen) {
      this.lastScreen = event.componentName;
      this.state.isFirstScreen = false;
      return;
    }
    if (this.lastScreen != event.componentName) {
      var currentScreenName = event.componentName;
      this.lastScreen = currentScreenName;
      var params = {
        'screenName': currentScreenName
      };

      this.recordBreadcrumb('navigation', params);
    }
  }

  /**
   * Subcribe OnStateChange Listenr from React Navigation Version 5.x and higer
  * Creates and records a MobileBreadcrumb for Current Screen
  */
  onStateChange = (state) => {
    var currentScreenName = this.getCurrentScreen(state);
    var params = {
      'screenName': currentScreenName
    };

    this.recordBreadcrumb('navigation', params);
  }

  getCurrentScreen(state) {

    if (!state.routes[state.index].state) {
      return state.routes[state.index].name
    }
    return this.getCurrentScreen(state.routes[state.index].state);
  }

  /**
   * Start the agent.
   * 
   * @param {string} accountId New Relic account ID.
   * @param {string} apikey New Relic API key.
   * @param {string} endpoint New Relic API endpoint ("US" or "EU").
   * @param {Record<string, boolean>} [customerConfiguration] Agent configuration.
   */
  startAgent(accountId, apikey, endpoint, customerConfiguration) {
    endpoint = typeof(endpoint) == 'string' ? endpoint : "US"
    this.nrAgent = new NrAgent(apikey, accountId, endpoint)
    this.LOG.verbose = true; // todo: should let this get set by a param
    this.config = customerConfiguration || {};

    if (this.config["recordJsErrors"] == undefined || this.config["recordJsErrors"] == true) {
      this.addNewRelicErrorHandler();
    }
    if (this.config["recordPromiseRejections"] == undefined || this.config["recordPromiseRejections"] == true) {
      this.addNewRelicPromiseRejectionHandler();
    }
    if (this.config["recordConsoleLogs"] == undefined || this.config["recordConsoleLogs"] == true) {
      this.overrideConsole();
    }
    if (this.config["recordFetchResults"] == undefined || this.config["recordFetchResults"] == true) {
      this.overrideFetch();
    }

    this.LOG.info('Kepler agent started.');
    this.LOG.info(`New Relic Kepler agent version ${this.agentVersion}`);

    this.setAttribute('KeplerAgentVersion', this.agentVersion);
    this.setAttribute('collector.name', 'newrelic-kepler-agent');
    this.setAttribute('instrumentation.provider', 'media');
    this.setAttribute('instrumentation.name', 'kepler');
    this.setAttribute('instrumentation.version', this.agentVersion);
    this.setAttribute('JSEngine', global.HermesInternal ? "Hermes" : "JavaScriptCore");
    
    this.isAgentStartedFlag = true;
  }

  getReactNativeVersion() {
    var rnVersion = Platform.constants.reactNativeVersion;
    return `${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`
  }

  //TODO: implement session ID, check kepler app lifecycle:
  //  - Build a new id when the app starts.
  //  - Build a new id when the app comes from background.

  /**
   * Get agent session. A unique identifier generated when the agent is created.
   * 
   * @returns Agent session.
   */
  getAgentSession() {
    return this.nrAgent.getAgentSession();
  }

  /**
   * Start harvest cycle immediately.
   */
  harvestNow() {
    this.nrAgent.harvestNow()
  }
  
  /**
   * Creates and records a custom event.
   * The event may include a list of attributes, specified as a map.
   * @param {string} eventType The type of event.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordCustomEvent(eventType, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordCustomEvent(eventType, attributes)
  }

  /**
   * Creates and records a KeplerSystem event.
   * The event may include a list of attributes, specified as a map.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordSystemEvent(attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordSystemEvent(attributes)
  }

  /**
   * Record custom error.
   * @param {Error} error Error object.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordCustomError(error, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordError(error, attributes)
  }

  /**
   * Creates and records a Breadcrumb event
   * @param {string} eventName the name you want to give to the breadcrumb event.
   * @param {Record<string, any>} [attributes] a map that includes a list of attributes.
   */
  recordBreadcrumb(eventName, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    } else {
      attributes = {}
    }
    this.nrAgent.recordBreadcrumb(eventName, attributes);
  }

  /**
   * Creates and records a New Relic log.
   * 
   * @param {string} message Log message.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordLog(message, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordLog(message, attributes)
  }

  /**
   * Creates and record a New Relic gauge metric.
   * 
   * @param {string} name Metric name.
   * @param {number} value Meytric value.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordGaugeMetric(name, value, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordGaugeMetric(name, value, attributes)
  }

  /**
   * Creates and record a New Relic count metric.
   * 
   * @param {string} name Metric name.
   * @param {number} value Meytric value.
   * @param {number} interval Meytric interval in milliseconds.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordCountMetric(name, value, interval, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordCountMetric(name, value, interval, attributes)
  }

  /**
   * Creates and record a New Relic summary metric.
   * 
   * @param {string} name Metric name.
   * @param {number} count Metric count.
   * @param {number} max Metric max.
   * @param {number} min Metric min.
   * @param {number} sum Metric sum.
   * @param {number} interval Metric interval.
   * @param {Record<string, any>} [attributes] (optional) A map that includes a list of attributes.
   */
  recordSummaryMetric(name, count, max, min, sum, interval, attributes) {
    if (attributes != undefined) {
      attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    }
    this.nrAgent.recordSummaryMetric(name, count, max, min, sum, interval, attributes)
  }

  /**
   * Records javascript errors for react-native.
   * @param {Error} e A JavaScript error.
   */
  recordError(e) {
    this.recordError(e, false);
  }

  /**
   * Records javascript errors with isFatal flag.
   * @param {Error} e Error object. 
   * @param {boolean} isFatal Error is fatal.
   */
  recordError(e, isFatal) {
    if(e) {
      var error;

      if(e instanceof Error) {
        error = e;
      }

      if(typeof e === 'string') {
        error = new Error(e || '');
      }

      if(error !== undefined) {
        this.nrAgent.recordError(error, {"isFatal": isFatal})
      } else {
        this.LOG.warn('undefined error name or message');
      }
    } else {
      this.LOG.warn('error is required');
    }
  }

  /***
   * Sets the event harvest cycle length.
   * Minimum value cannot be less than 60 seconds.
   * Maximum value should not be greater than 600 seconds.
   * @param {number} maxBufferTimeInSeconds The maximum time (in seconds) that the agent should store events in memory.
   */
  setMaxEventBufferTime(maxBufferTimeInSeconds) {
    this.nrAgent.setHarvestTime(maxBufferTimeInSeconds)
  }

  /**
   * Creates a custom attribute with a specified name and value.
   * When called, it overwrites its previous value and type.
   * The created attribute is shared by multiple Mobile event types.
   * @param {string} attributeName Name of the attribute.
   * @param {string|number|boolean} value Attribute value.
   */
  setAttribute(attributeName, value) {
    this.nrAgent.setAttribute(attributeName, value)
  }

  /**
 * Remove a custom attribute with a specified name and value.
 * When called, it removes the attribute specified by the name string.
 * The removed attribute is shared by multiple Mobile event types.
 * @param {string} attributeName Name of the attribute.
 */
  removeAttribute(attributeName) {
    this.nrAgent.removeAttribute(attributeName)
  }

  /**
   * Removes all attributes from the session.
   */
  removeAllAttributes() {
    this.nrAgent.removeAllAttributes()
  }

  /**
   * Sets the app version.
   * @param {string} version App version.
   */
  setAppVersion(version) {
    this.setAttribute("appVersion", version)
  }

  /**
   * Sets the app name.
   * @param {string} name App name.
   */
  setAppName(name) {
    this.setAttribute("appName", name)
  }

  /**
   * Sets a custom user identifier value to associate mobile user
   * @param {string} userId Custom user identifier.
   */
  setUserId(userId) {
    if (utils.isString(userId)) {
      this.nrAgent.setUserId(userId)
    } else {
      this.LOG.error(`userId '${userId}' is not a string.`);
    }
  }

  /**
   * @private
   */
  addNewRelicErrorHandler() {
    if (global && global.ErrorUtils && !this.state.didAddErrorHandler) {
      const previousHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
        this.LOG.info(`Error handler: error = ${error} , isFatal = ${isFatal}`);
        this.recordError(error, isFatal);
        previousHandler(error, isFatal);
      });
      // prevent us from adding the error handler multiple times.
      this.state.didAddErrorHandler = true;
    } else if (!this.state.didAddErrorHandler) {
      this.LOG.debug('failed to add New Relic error handler no error utils detected');
    }
  }

  /**
   * @private
   */
  addNewRelicPromiseRejectionHandler() {

    const prevTracker = getUnhandledPromiseRejectionTracker();

    if (!this.state.didAddPromiseRejection) {
      setUnhandledPromiseRejectionTracker(async (id, error) => {
        this.LOG.info(`Promise reject handler: error = ${error} , id = ${id}`);

        if(error != undefined) {
          this.recordError(error);
        } else {
          this.recordBreadcrumb("Possible Unhandled Promise Rejection", {id: id})
        }

        if (prevTracker !== undefined) {
          prevTracker(id, error)
        }

      });
      this.state.didAddPromiseRejection = true;

    }

  }

  /**
   * @private
   */
  overrideFetch() {
    if (!this.state.didOverrideFetch) {
      console._nrLog('Override fetch');
      const defaultFetch = global.fetch;
      let self = this
      global.fetch = async function () {
        let requestId = Date.now().toString(16) + Math.random().toString(16).slice(2);
        let reqTs = Date.now();
        self.nrAgent.recordFetchRequest(arguments, requestId)
        return new Promise((resolve, reject) => {
          defaultFetch.apply(global, arguments).then(function(response) {
            self.nrAgent.recordFetchResponse(response, requestId, Date.now() - reqTs);
            resolve(response);
          }).catch(function (error) {
            self.nrAgent.recordFetchRejection(error, requestId, Date.now() - reqTs);
            reject(error);
          });
        });
      };

      this.state.didOverrideFetch = true;
    }
  }

  /**
   * @private
   */
  overrideConsole() {
    if (!this.state.didOverrideConsole) {
      const defaultLog = console.log;
      const defaultWarn = console.warn;
      const defaultError = console.error;
      const self = this;

      console.log = function () {
        self.sendConsole('log', arguments);
        defaultLog.apply(console, arguments);
      };
      console.warn = function () {
        self.sendConsole('warn', arguments);
        defaultWarn.apply(console, arguments);
      };
      console.error = function () {
        self.sendConsole('error', arguments);
        defaultError.apply(console, arguments);
      };
      this.state.didOverrideConsole = true;
    }
  }

  /**
   * @private
   */
  sendConsole(type, args) {
    //TODO: string representation of objects
    const arr_args = Array.from(args);
    const message = arr_args.join(" ");
    this.recordLog(message, {"consoleType": type})
  }
}

const NewRelic = new NewRelicAgent();
export default NewRelic;