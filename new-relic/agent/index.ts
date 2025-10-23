import { NrHarvest } from './harvest'
import { BREADCRUMB_EVENT_TYPE, ERROR_EVENT_TYPE, SYSTEM_EVENT_TYPE } from './harvest/constants'
import { NrEndpoint } from './harvest/worker'
import { ValidVal } from './types'

/** New Relic Kepler Agent */
export class NrAgent {
    private nrHarvest: NrHarvest
    private agentSession: string

    /**
     * Construct NrAgent.
     * 
     * @param apiKey New Relic API Key.
     * @param accountId New Relic account ID.
     * @param endpoint New Relic endpoint ("US" or "EU"). If invalid, default is "US".
     */
    constructor(apiKey: string, accountId: string, endpoint: string) {
        let nrEndpoint = endpoint == "EU" ? NrEndpoint.EU : NrEndpoint.US
        this.agentSession = this.genRandomId()
        this.nrHarvest = new NrHarvest(apiKey, accountId, nrEndpoint)
        this.setAttribute("agentSession", this.agentSession)

        //TODO: use AppState to subscribe to foreground/background changes, and memory warnings. Must be tested on a real device.
        //      - On foreground, refresh sessionId.
        //      - On memory warning, clear the harvest buffer to free some mem, generate a MemWarning event and immediately harvest.
        // https://developer.amazon.com/docs/kepler-tv-rn/0.72/appstate.html
    }

    /**
     * Generate rendom identifier.
     * 
     * @returns UUID.
     */
    private genRandomId(): string {
        return Date.now().toString(16) + Math.random().toString(16).slice(2)
    }

    /**
     * Get agent session. A unique ID generated every time a new NrAgent instance is created.
     * 
     * @returns Agent session attribute.
     */
    getAgentSession(): string {
        return this.agentSession
    }

    /**
     * Set harvest time. Restarts the timer.
     * 
     * @param seconds Harvest time in seconds.
     * @returns Changed or not.
     */
    setHarvestTime(seconds: number): boolean {
        return this.nrHarvest.setHarvestTime(seconds)
    }

    /**
     * Harvest immediately. Also resets the harvest timer.
     */
    harvestNow() {
        this.nrHarvest.harvestNow()
    }

    /**
     * Record custom event.
     * 
     * @param eventType New Relic event type.
     * @param attributes (optional) Event attributes.
     * @returns True if added, false otherwise.
     */
    recordCustomEvent(eventType: string, attributes?: Record<string, any>): boolean {
        //TODO: implement timeSinceAgentStarted attribute
        return this.nrHarvest.recordEvent(eventType, attributes)
    }
    
    /**
     * Record log.
     * 
     * @param message Log message.
     * @param attributes (optional) Log attributes.
     * @returns True if added, false otherwise.
     */
    recordLog(message: string, attributes?: Record<string, any>): boolean {
        return this.nrHarvest.recordLog(message, attributes)
    }

    /**
     * Record gauge metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordGaugeMetric(name: string, value: number, attributes?: Record<string, any>): boolean {
        return this.nrHarvest.recordGaugeMetric(name, value, attributes)
    }

    /**
     * Record count metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param interval Metric interval in milliseconds.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordCountMetric(name: string, value: number, interval: number, attributes?: Record<string, any>): boolean {
        return this.nrHarvest.recordCountMetric(name, value, interval, attributes)
    }

    /**
     * Record summary metric.
     * 
     * @param name Metric name.
     * @param count Metric count.
     * @param max Metric max.
     * @param min Metric min.
     * @param sum Metric sum.
     * @param interval Metric interval.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordSummaryMetric(name: string, count: number, max: number, min: number, sum: number, interval: number, attributes?: Record<string, any>) {
        return this.nrHarvest.recordSummaryMetric(name, count, max, min, sum, interval, attributes)
    }

    /**
     * Set a user ID attribute.
     * 
     * @param userId User ID.
     */
    setUserId(userId: string) {
        this.setAttribute("userId", userId)
    }

    /**
     * Record custom errror.
     * 
     * @param error Error object.
     * @param attributes (optional) Event attributes.
     * @returns True if added, false otherwise.
     */
    recordError(error: Error, attr?: Record<string, any>): boolean {
        let attributes: {[index: string]:any}
        if (attr == undefined) {
            attributes = {}
        } else {
            attributes = attr
        }
        attributes['name'] = error.name || ""
        attributes['errorMessage'] = error.message || ""
        if (error.stack) {
            attributes['errorStack'] = error.stack
        }
        return this.recordCustomEvent(ERROR_EVENT_TYPE, attributes)
    }

    /**
     * Record system event.
     * 
     * @param attributes (optional) Event attributes.
     * @returns True if added, false otherwise.
     */
    recordSystemEvent(attributes?: Record<string, any>): boolean {
        return this.recordCustomEvent(SYSTEM_EVENT_TYPE, attributes)
    }

    /**
     * Record breadcrumb event.
     * 
     * @param attributes (optional) Event attributes.
     * @returns True if added, false otherwise.
     */
    recordBreadcrumb(name: string, attr?: Record<string, any>): boolean {
        let attributes: {[index: string]:any}
        if (attr == undefined) {
            attributes = {}
        } else {
            attributes = attr
        }
        attributes['name'] = name
        return this.recordCustomEvent(BREADCRUMB_EVENT_TYPE, attributes)
    }

    /**
     * Record fetch request.
     * 
     * @param args Fetch arguments.
     * @param requestId Id of current request.
     */
    recordFetchRequest(args: any[], requestId: string) {
        if (args.length == 1) {
            if (typeof(args[0]) == 'string') {
                this.recordFetchRequestWithUrl(args[0], requestId)
            } if (typeof(args[0]) == 'object') {
                this.recordFetchRequestWithObject(args[0], requestId)
            }
        } else if (args.length == 2) {
            this.recordFetchRequestWithUrl(args[0], requestId, args[1])
        }
    }
    
    /**
     * Record fetch request with URL argument.
     * 
     * @param url URL.
     * @param requestId Id of current request.
     * @param config (optional) config object.
     */
    private recordFetchRequestWithUrl(url: string, requestId: string, config?: Record<string, any>) {
        // @ts-ignore
        console._nrLog("Record Fetch request with URL and Config = ", url, config)

        let attr: {[index: string]:any} = {}
        attr['name'] = 'FetchRequest'
        attr['url'] = url
        attr['requestId'] = requestId
        
        if (config) {
            attr['method'] = config['method'] || "GET"
        } else {
            attr['method'] = "GET"
        }

        this.recordSystemEvent(attr)
    }

    /**
     * Record fetch request with Request object argument.
     * 
     * @param request Request object.
     * @param requestId Id of current request.
     */
    private recordFetchRequestWithObject(request: Request, requestId: string) {
        // @ts-ignore
        console._nrLog("Record Fetch request with Request obj = ", request)

        if (request['url']) {
            let attr: {[index: string]:any} = {}
            attr['requestId'] = requestId
            attr['name'] = 'FetchRequest'
            attr['url'] = request['url']
            attr['method'] = request['method'] || "GET"
            
            this.recordSystemEvent(attr)
        }
    }

    /**
     * Record fetch response.
     * 
     * @param response Response object.
     * @param requestId Id of current request.
     * @param timeSinceReqMs Time since request has happened in milliseconds.
     */
    recordFetchResponse(response: Response, requestId: string, timeSinceReqMs: number) {
        // @ts-ignore
        console._nrLog("Record Fetch response = ", response)

        let attr: {[index: string]:any} = {}
        attr['name'] = 'FetchResponse'
        attr['timeSinceRequest'] = timeSinceReqMs
        attr['requestId'] = requestId
        attr['url'] = response['url'] || ""
        attr['responseType'] = response['type'] || ""
        attr['status'] = response['status'] || 0
        attr['responseIsOk'] = response['ok'] || true
        attr['statusText'] = response['statusText'] || ""
        
        this.recordSystemEvent(attr)
    }

    /**
     * Record fetch response.
     * 
     * @param error Rejection error object.
     * @param requestId Id of current request.
     * @param timeSinceReqMs Time since request has happened in milliseconds.
     */
    recordFetchRejection(error: Error, requestId: string, timeSinceReqMs: number) {
        // @ts-ignore
        console._nrLog("Record Fetch rejection = ", error)

        let attr: {[index: string]:any} = {}
        attr['name'] = 'FetchRejection'
        attr['timeSinceRequest'] = timeSinceReqMs
        attr['requestId'] = requestId
        // Fill error data
        attr['errorName'] = error.name || ""
        attr['errorMessage'] = error.message || ""
        if (error.stack) {
            attr['errorStack'] = error.stack
        }

        this.recordSystemEvent(attr)
    }
    
    /**
     * Set attribute. If already exists, overwrites it and returns previous value.
     * 
     * @param name Attribute name.
     * @param value Attribute value.
     */
    setAttribute(name: string, value: ValidVal): ValidVal | undefined {
        return this.nrHarvest.setAttribute(name, value)
    }

    /**
     * Remove attribute. If exists, returns previous value.
     * 
     * @param name Attribute name.
     */
    removeAttribute(name: string): ValidVal | undefined {
        return this.nrHarvest.removeAttribute(name)
    }

    /**
     * Remove custom attributes.
     */
    removeAllAttributes() {
        this.nrHarvest.removeAllAttributes()
    }
}