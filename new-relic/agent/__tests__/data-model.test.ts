import { NrEvent } from '../harvest/models/event'
import { NrGaugeMetric, NrCountMetric, NrSummaryMetric } from '../harvest/models/metric'
import { NrLog } from '../harvest/models/log'

// @ts-ignore
console._nrLog = jest.fn(() => {});

describe('data models', () => {
    test('events', () => {
        let ev = new NrEvent("Test", {test: true})
        ev.setTimestamp(0)
        expect(ev.repr()).toEqual({
            "eventType": "Test",
            "timestamp": 0,
            "test": true
        })
    })

    test('metrics', () => {
        let gau = new NrGaugeMetric("Test", 10, {test: true})
        gau.setTimestamp(0)
        expect(gau.repr()).toEqual({
            "name": "Test",
            "value": 10,
            "timestamp": 0,
            "type": "gauge",
            "attributes": {
                "test": true
            }
        })

        let cnt = new NrCountMetric("Test", 10, 1000, {test: true})
        cnt.setTimestamp(0)
        expect(cnt.repr()).toEqual({
            "name": "Test",
            "value": 10,
            "interval.ms": 1000,
            "timestamp": 0,
            "type": "count",
            "attributes": {
                "test": true
            }
        })

        let sum = new NrSummaryMetric("Test", 10, 99, 1, 100, 1000, {test: true})
        sum.setTimestamp(0)
        expect(sum.repr()).toEqual({
            "name": "Test",
            "value": {
                "count": 10,
                "max": 99,
                "min": 1,
                "sum": 100
            },
            "interval.ms": 1000,
            "timestamp": 0,
            "type": "summary",
            "attributes": {
                "test": true
            }
        })
    })

    test('logs', () => {
        let ev = new NrLog("Test", {test: true})
        ev.setTimestamp(0)
        expect(ev.repr()).toEqual({
            "message": "Test",
            "timestamp": 0,
            "attributes": {
                "test": true
            }
        })
    })
})