import React from 'react';
import {ImageSourcePropType, StyleSheet, Text} from 'react-native';

export interface TileData {
  id: string;
  label: string;
  accessibilityLabel: string;
  description?: string | React.JSX.Element;
  icon: ImageSourcePropType;
  onPress?: () => void;
}

const descStyles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
});

export const tiles: TileData[] = [
  {
    id: 'nr-fetch',
    label: 'Fetch\nAPI',
    accessibilityLabel: 'Fetch API',
    description: 'Makes a real HTTP request via api.ipify.org. New Relic records the FetchRequest and FetchResponse events.',
    icon: require('../assets/get-started.png'),
  },
  {
    id: 'nr-fetch-error',
    label: 'Fetch\nError',
    accessibilityLabel: 'Fetch Error',
    description: 'Makes an HTTP request to an invalid host. New Relic records the FetchRejection event.',
    icon: require('../assets/debug.png'),
  },
  {
    id: 'nr-error',
    label: 'Trigger\nError',
    accessibilityLabel: 'Trigger Error',
    description: 'Throws an unhandled promise rejection. New Relic captures it as a VegaError event.',
    icon: require('../assets/debug.png'),
  },
  {
    id: 'nr-harvest',
    label: 'Harvest\nNow',
    accessibilityLabel: 'Harvest Now',
    description: 'Forces an immediate flush of all buffered events, logs, and metrics to New Relic.',
    icon: require('../assets/vega.png'),
  },
  {
    id: 'nr-event',
    label: 'Record\nEvent',
    accessibilityLabel: 'Record Custom Event',
    description: 'Records a custom VegaMyEvent event with sample attributes to New Relic.',
    icon: require('../assets/learn-more.png'),
  },
];
