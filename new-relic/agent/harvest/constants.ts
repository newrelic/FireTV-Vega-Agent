/** Kepler Agent default eventType */
export const SYSTEM_EVENT_TYPE = "KeplerSystem"
export const ERROR_EVENT_TYPE = "KeplerError"
export const BREADCRUMB_EVENT_TYPE = "KeplerBreadcrumb"

/** Default harvest time in seconds (2 minutes) */
export const DEFAULT_HARVEST_TIME = 120
/** Minimum allowed harvest time in seconds */
export const MIN_HARVEST_TIME = 60
/** Maximum allowed harvest time in seconds (10 minutes) */
export const MAX_HARVEST_TIME = 600
/** Increase/Decrease time delta in seconds */
export const HARVEST_TIME_DELTA = 60

/** Default buffer size */
export const DEFAULT_BUFFER_SIZE = 1000
/** Minimum allowed buffer size */
export const MIN_BUFFER_SIZE = 100
/** Maximum allowed buffer size */
export const MAX_BUFFER_SIZE = 1000
/** Increase/Decrease buffer size delta */
export const BUFFER_SIZE_DELTA = 100