import { NrEvent } from '../harvest/models/event'
import { NrEventBufferSerializer } from '../harvest/serializers/event-ser'
import { NrGaugeMetric, NrCountMetric, NrSummaryMetric, NrMetric } from '../harvest/models/metric'
import { NrMetricBufferSerializer } from '../harvest/serializers/metric-ser'
import { NrLog } from '../harvest/models/log'
import { NrLogBufferSerializer } from '../harvest/serializers/log-ser'
import { NrBuffer } from '../harvest/buffer'

// @ts-ignore
console._nrLog = jest.fn(() => {});

describe('model serielizers', () => {
    test('event serializer', () => {
        let buffer = new NrBuffer<NrEvent>(10, new NrEventBufferSerializer())
        let ev0 = new NrEvent("Test", {index: 0})
        ev0.setTimestamp(0)
        let ev1 = new NrEvent("Test", {index: 1})
        ev1.setTimestamp(0)
        let ev2 = new NrEvent("Test", {index: 2})
        ev2.setTimestamp(0)
        buffer.put(ev0)
        buffer.put(ev1)
        buffer.put(ev2)
        let ser = JSON.parse(buffer.buildNrApiModel())
        expect(ser).toEqual([
            {
                "eventType": "Test",
                "timestamp":0,
                "index": 0
            },
            {
                "eventType": "Test",
                "timestamp":0,
                "index": 1
            },
            {
                "eventType": "Test",
                "timestamp":0,
                "index": 2
            }
        ])
    })

    test('metric serializer', () => {
        let buffer = new NrBuffer<NrMetric>(10, new NrMetricBufferSerializer())
        let mt0 = new NrGaugeMetric("Test", 10, {index: 0})
        mt0.setTimestamp(0)
        let mt1 = new NrCountMetric("Test", 10, 1000, {index: 1})
        mt1.setTimestamp(0)
        let mt2 = new NrSummaryMetric("Test", 10, 20, 5, 100, 1000, {index: 2})
        mt2.setTimestamp(0)
        buffer.put(mt0)
        buffer.put(mt1)
        buffer.put(mt2)
        let ser = JSON.parse(buffer.buildNrApiModel())
        expect(ser).toEqual([{
            "common": {},
            "metrics": [
                {
                    "name": "Test",
                    "type": "gauge",
                    "value": 10,
                    "timestamp": 0,
                    "attributes": {
                        "index": 0
                    }
                },
                {
                    "name": "Test",
                    "type": "count",
                    "value": 10,
                    "interval.ms": 1000,
                    "timestamp": 0,
                    "attributes": {
                        "index": 1
                    }
                },
                {
                    "name": "Test",
                    "type": "summary",
                    "value": {
                        "count": 10,
                        "sum": 100,
                        "min": 5,
                        "max": 20,
                    },
                    "interval.ms": 1000,
                    "timestamp": 0,
                    "attributes": {
                        "index": 2
                    }
                }
            ]
        }])
    })

    test('log serializer', () => {
        let buffer = new NrBuffer<NrLog>(10, new NrLogBufferSerializer())
        let lg0 = new NrLog("Test", {index: 0})
        lg0.setTimestamp(0)
        let lg1 = new NrLog("Test", {index: 1})
        lg1.setTimestamp(0)
        let lg2 = new NrLog("Test", {index: 2})
        lg2.setTimestamp(0)
        buffer.put(lg0)
        buffer.put(lg1)
        buffer.put(lg2)
        let ser = JSON.parse(buffer.buildNrApiModel())
        expect(ser).toEqual([{
            "common": {},
            "logs": [
                {
                    "message": "Test",
                    "timestamp": 0,
                    "attributes": {
                        "index": 0
                    }
                },
                {
                    "message": "Test",
                    "timestamp": 0,
                    "attributes": {
                        "index": 1
                    }
                },
                {
                    "message": "Test",
                    "timestamp": 0,
                    "attributes": {
                        "index": 2
                    }
                }
            ]
        }])
    })
})