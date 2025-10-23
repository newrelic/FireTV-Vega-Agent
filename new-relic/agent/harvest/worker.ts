import { NrBuffer, SerializableBuffer } from './buffer'
import { NrSample } from './models/sample'
import { gzip } from 'pako'
import { MAX_HARVEST_TIME, HARVEST_TIME_DELTA, MIN_BUFFER_SIZE, BUFFER_SIZE_DELTA } from './constants'

/** New Relic endpint */
export enum NrEndpoint {
    /// Endpoint for US-based accounts.
    US,
    /// Endpoint for EU-based accounts.
    EU
}

/** Function to build the endpoint URL */
export type UrlBuilder = (endpoint: NrEndpoint, accountId: string) => string

/** Harvest worker */
export class NrHarvestWorker<T extends NrSample> {
    private harvestTimerId: NodeJS.Timeout
    private isHarvesting: boolean
    private definedDurationSeconds: number
    private actualDurationSeconds: number
    private definedBufferSize: number
    private apiKey: string
    private accountId: string
    private endpoint: NrEndpoint
    private urlBuilder: UrlBuilder

    buffer: NrBuffer<T>
    
    /**
     * Construct a harvest worker.
     * 
     * @param apiKey New Relic API key.
     * @param accountId New Relic account ID.
     * @param endpoint New Relic endpoint, either US or EU.
     * @param seconds Harvest time in seconds.
     * @param bufferSize Sample buffer size.
     * @param bufferSerializer Buffer serializer to generate a model accepted by the API.
     * @param urlBuilder Function to generate the endpoint URL.
     */
    constructor(apiKey: string, accountId: string, endpoint: NrEndpoint, seconds: number, bufferSize: number, serBuff: SerializableBuffer<T>, urlBuilder: UrlBuilder) {
        this.isHarvesting = false
        this.apiKey = apiKey
        this.accountId = accountId
        this.endpoint = endpoint
        this.buffer = new NrBuffer(bufferSize, serBuff)
        this.definedBufferSize = bufferSize
        this.urlBuilder = urlBuilder
        this.definedDurationSeconds = this.actualDurationSeconds = seconds
        // This is just to make happy the typescript checker (uninitialized variable)
        this.harvestTimerId = this.startHarvest()
    }

    /**
     * Set harvest time. Restarts the timer.
     * @param seconds 
     */
    setHarvestTime(seconds: number) {
        this.cancelHarvest()
        this.definedDurationSeconds = this.actualDurationSeconds = seconds
        this.startHarvest()
    }

    /**
     * Get current harvest duration.
     * 
     * @returns Duration in seconds.
     */
    getHarvestDuration(): number {
        return this.actualDurationSeconds
    }
    
    /**
     * Harvest immediately. Also resets the harvest timer.
     */
    harvestNow() {
        if (!this.isHarvesting) {
            this.cancelHarvest()
            this.harvestHandler()
        }
    }

    /**
     * Cancel harvest timer. Call `setHarvestTime` or `harvestNow` to restart the timer.
     */
    cancelHarvest() {
        clearTimeout(this.harvestTimerId)
    }

    /**
     * Start harvest timer. It doesn't check for running timers, make sure there is no other timers before calling it.
     * 
     * @returns Timer ID.
     */
    private startHarvest(): NodeJS.Timeout {
        this.harvestTimerId = setTimeout(() => this.harvestHandler(), this.actualDurationSeconds * 1000)
        return this.harvestTimerId
    }
    
    private harvestHandler() {
        if (!this.isHarvesting) {
            if (this.buffer.length() > 0) {
                this.isHarvesting = true
                // @ts-ignore
                console._nrLog("HARVEST DATA = ", this.buffer.getBuffer())

                let json = this.buffer.buildNrApiModel()

                // @ts-ignore
                console._nrLog("Serialized data = ", json)

                let url = this.urlBuilder(this.endpoint, this.accountId)
                this.postToNrApi(url, json).then((data) => {
                    // @ts-ignore
                    console._nrLog("Response from New Relic API = ", data)
                }).catch((error) => {
                    // This is probably unnecessary, we never reject the promise in postToNrApi
                    // @ts-ignore
                    console._nrLog("Error posting data to NR = ", error)
                }).finally(() => {
                    this.isHarvesting = false
                    this.startHarvest()
                })
            } else {
                // @ts-ignore
                console._nrLog("Harvest started, but buffer is empty. Do nothing.")
                this.startHarvest()
            }
        } else {
            // @ts-ignore
            console._nrLog("WARNING: harvestHandler called while still harvesting")
        }
    }

    private async postToNrApi(url: string, json_body: string) {
        const body_gzip = gzip(json_body)
        let response: any
        try {
            // @ts-ignore
            response = await global._nrFetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Encoding": "gzip",
                    "Api-Key": this.apiKey
                },
                body: body_gzip
            })
        } catch (error) {
            // @ts-ignore
            console._nrLog("Error calling fetch from postToNrApi = ", error)
            return ""
        }

        // @ts-ignore
        console._nrLog("Response code = ", response.status)

        if (this.status_ok(response.status)) {
            this.response_ok()
        } else if (response.status == 413) {
            this.err_big_payload()
        } else if (response.status == 429) {
            this.err_many_requests()
        } else if (response.status == 408) {
            // Request took too long, we don't know why, but we will treat it as a payload too big + too many requests.
            this.err_big_payload()
            this.err_many_requests()
        } else if (this.status_server_err(response.status)) {
            // 5XX error, we will retry later.
        } else {
            // Some other error, probably unrecoverable, clear buffer
            this.buffer.clear()
        }

        return response.json()
    }

    private status_ok(status: number): boolean {
        return (status >= 200 && status <= 299)
    }

    private status_server_err(status: number): boolean {
        return (status >= 500 && status <= 599)
    }

    // OK, clear buffer and return to defaults.
    private response_ok() {
        this.buffer.clear()
        // Progressively return to harvest time defaults.
        if (this.actualDurationSeconds > this.definedDurationSeconds) {
            this.actualDurationSeconds -= HARVEST_TIME_DELTA
        }
        // Progressively return to buffer size defaults.
        let currentBufferSize = this.buffer.getSize()
        if (currentBufferSize < this.definedBufferSize) {
            this.buffer.incrementSize(BUFFER_SIZE_DELTA)
        }
    }

    // Payload too big, shrink buffer.
    private err_big_payload() {
        let currentBufferSize = this.buffer.getSize()
        if (currentBufferSize > MIN_BUFFER_SIZE) {
            this.buffer.resample(currentBufferSize - BUFFER_SIZE_DELTA)
        }
    }

    // Too many requests, increase harvest time.
    private err_many_requests() {
        if (this.actualDurationSeconds < MAX_HARVEST_TIME) {
            this.actualDurationSeconds += HARVEST_TIME_DELTA
        }
    }
}