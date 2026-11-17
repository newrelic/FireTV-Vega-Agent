import React, {useState} from 'react';
import {StyleSheet, Text, ImageBackground, View} from 'react-native';
import {TVFocusGuideView} from '@amazon-devices/react-native-kepler';
import NewRelicVegaAgent from 'newrelic-vega-agent';
import {Tile} from './components/Tile';
import {tiles} from './data/tiles';

const nrActions: Record<string, () => void> = {
  'nr-fetch': () => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => console.log('Fetch response:', d))
      .catch(e => console.log('Fetch error:', e));
  },
  'nr-fetch-error': () => {
    fetch('https://api.ipify-x.org?format=json')
      .then(r => r.json())
      .catch(e => console.log('Fetch rejection:', e));
  },
  'nr-error': () => {
    new Promise((_, reject) => {
      reject(new Error('Unhandled promise rejection!'));
    });
  },
  'nr-harvest': () => {
    NewRelicVegaAgent.harvestNow();
    console.log('Harvest triggered');
  },
  'nr-event': () => {
    NewRelicVegaAgent.recordCustomEvent('VegaMyEvent', {one: 1, name: 'Joe'});
    console.log('Custom event recorded');
  },
};

export const App = () => {
  const [focusedTileId, setFocusedTileId] = useState<string>('nr-fetch');

  const focusedTile = tiles.find((t) => t.id === focusedTileId);

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
      <View style={styles.headerArea}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.focusedTitle}>{focusedTile?.label}</Text>
        </View>
        {focusedTile?.description && (
          <Text style={styles.focusedDescription}>
            {focusedTile.description}
          </Text>
        )}
      </View>

      <TVFocusGuideView style={styles.tileRowContent}>
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            label={tile.label}
            icon={tile.icon}
            isFocused={focusedTileId === tile.id}
            onFocus={() => setFocusedTileId(tile.id)}
            onBlur={() => {}}
            onPress={nrActions[tile.id]}
            testID={`tile-${tile.id}`}
            accessibilityLabel={tile.accessibilityLabel}
            hasTVPreferredFocus={tile.id === 'nr-fetch'}
          />
        ))}
      </TVFocusGuideView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 64,
    paddingVertical: 32,
  },
  headerArea: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '600',
    flexShrink: 1,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 24,
    flexShrink: 1,
  },
  vegaLogo: {
    width: 280,
    height: 200,
    marginLeft: 40,
  },
  focusedTitle: {
    color: '#FFFFFF',
    fontSize: 64,
    lineHeight: 72,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  focusedDescription: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 32,
    flex: 1,
    marginLeft: 20,
    paddingTop: 10,
  },
  tileRowContent: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
