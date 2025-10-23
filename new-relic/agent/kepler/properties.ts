import { AppState, Platform, I18nManager } from '@amazon-devices/react-native-kepler';
import { getSystemName, getSystemVersion,
    getApplicationName, getDeviceId, getDeviceType,
    getModel, getVersion, getBrand, getBuildNumber,
    getBundleId } from '@amazon-devices/react-native-device-info'

/** Collect Kepler system properties */
export class KeplerProperties {
    /**
     * Build system properties.
     * 
     * @returns Attributes.
     */
    static build(): Record<string, any> {
        return {
            /** App is in foreground (boolean) */
            isActive: AppState.currentState == "active",
            /** OS (string) */
            oS: Platform.OS,
            /** OS Variant (string) */
            // @ts-ignore
            oSVariant: Platform.constants.keplerOSVariant,
            /** OS Version (string) */
            oSVersion: Platform.Version || "",
            /** React Native version (string) */
            reactNativeVersion: `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}`,
            /** Is a TV (boolean) */
            isTV: Platform.isTV,
            /** Is a testing environment (boolean) */
            isTesting: Platform.isTesting,
            /** System timezone (string) */
            // @ts-ignore
            timezone: I18nManager.getSystemTimezone(),
            /** System locale (string) */
            // @ts-ignore
            locale: I18nManager.getSystemLocale(),
            /** App Name */
            appName: getApplicationName() || 'empty',
            /** App version */
            appVersion: getVersion(),
            /** App build number */
            appBuild: getBuildNumber(),
            /** App bundle id */
            appBundleId: getBundleId(),
            /** System Name */
            systemName: getSystemName(),
            /** System Version */
            systemVersion: getSystemVersion(),
            /** Device ID */
            deviceId: getDeviceId(),
            /** Device type */
            deviceType: getDeviceType(),
            /** Device Model */
            deviceModel: getModel(),
            /** Device brand */
            deviceBrand: getBrand(),
        }
    }
}