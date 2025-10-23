/*
 * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
 *
 * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
 */

import React from 'react';
import {StyleSheet, Text, ImageBackground, View, Image} from 'react-native';
import {Link} from './components/Link';
import NewRelicAgent from 'firetv-vega-agent';

// Simple screen management state to simulate navigation
const SCREENS = {
  HOME: 'HomeScreen',
  SETTINGS: 'SettingsScreen', 
  VIDEO: 'VideoPlayerScreen',
  PROFILE: 'ProfileScreen'
};

export const App = () => {
  const [currentScreen, setCurrentScreen] = React.useState(SCREENS.HOME);
  const [navigationState, setNavigationState] = React.useState({
    index: 0,
    routes: [
      { key: 'home', name: 'HomeScreen' }
    ]
  });

  const styles = getStyles();

  // Simulate navigation state changes that trigger automatic breadcrumbs
  const navigateToScreen = (screenName: string) => {
    const newState = {
      index: navigationState.routes.length,
      routes: [
        ...navigationState.routes,
        { key: screenName.toLowerCase(), name: screenName }
      ]
    };
    
    // Call the agent's navigation listener to automatically generate breadcrumbs
    NewRelicAgent.onStateChange(newState);
    
    setNavigationState(newState);
    setCurrentScreen(screenName);
  };

  // Initialize with first screen navigation event
  React.useEffect(() => {
    NewRelicAgent.onStateChange(navigationState);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return (
          <View>
            <Text style={styles.screenTitle}>🏠 Home Screen</Text>
            <Text style={styles.screenDescription}>Welcome to the main screen</Text>
          </View>
        );
      case SCREENS.SETTINGS:
        return (
          <View>
            <Text style={styles.screenTitle}>⚙️ Settings Screen</Text>
            <Text style={styles.screenDescription}>Configure your preferences</Text>
          </View>
        );
      case SCREENS.VIDEO:
        return (
          <View>
            <Text style={styles.screenTitle}>📺 Video Player Screen</Text>
            <Text style={styles.screenDescription}>Watch your favorite content</Text>
          </View>
        );
      case SCREENS.PROFILE:
        return (
          <View>
            <Text style={styles.screenTitle}>👤 Profile Screen</Text>
            <Text style={styles.screenDescription}>Manage your account</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
      <View style={styles.background}>
        {/* Current Screen Display */}
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>

        {/* Navigation Buttons - These will trigger automatic breadcrumbs */}
        <Text style={styles.sectionTitle}>🧭 Navigation (Auto Breadcrumbs)</Text>
        <Link
          linkText={`Go to Home ${currentScreen === SCREENS.HOME ? '(Current)' : ''}`}
          onPress={() => navigateToScreen(SCREENS.HOME)}
        />
        <Link
          linkText={`Go to Settings ${currentScreen === SCREENS.SETTINGS ? '(Current)' : ''}`}
          onPress={() => navigateToScreen(SCREENS.SETTINGS)}
        />
        <Link
          linkText={`Go to Video Player ${currentScreen === SCREENS.VIDEO ? '(Current)' : ''}`}
          onPress={() => navigateToScreen(SCREENS.VIDEO)}
        />
        <Link
          linkText={`Go to Profile ${currentScreen === SCREENS.PROFILE ? '(Current)' : ''}`}
          onPress={() => navigateToScreen(SCREENS.PROFILE)}
        />

        {/* Other Test Functions */}
        <Text style={styles.sectionTitle}>🧪 Other Tests</Text>
        <Link
          linkText={'Fetch API'}
          onPress={() => {
            fetch('https://api.ipify.org?format=json')
              .then((response) => response.json())
              .then((data) => {
                console.log('ApiFy response = ', data);
              })
              .catch((error) => {
                console.log('ApiFy response error = ', error);
              });
          }}
        />
        <Link
          linkText={'Trigger Error'}
          onPress={() => {
            new Promise((resolve, reject) => {
              reject(new Error('Unhandled promise rejection!'));
            });
          }}
        />
        <Link
          linkText={'Harvest Now'}
          onPress={() => {
            NewRelicAgent.harvestNow();
          }}
        />
        <Link
          linkText={'Record Custom Event'}
          onPress={() => {
            NewRelicAgent.recordCustomEvent('KeplerMyEvent', {
              one: 1,
              name: 'Joe',
            });
          }}
        />
      </View>
    </ImageBackground>
  );
};

const getStyles = () =>
  StyleSheet.create({
    background: {
      color: 'white',
      flex: 1,
      flexDirection: 'column',
    },
    container: {
      flex: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerContainer: {
      marginLeft: 200,
    },
    headerText: {
      color: 'white',
      fontSize: 80,
      marginBottom: 10,
    },
    subHeaderText: {
      color: 'white',
      fontSize: 40,
    },
    links: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-around',
      height: 600,
    },
    image: {
      flex: 1,
      paddingLeft: 150,
    },
    textContainer: {
      justifyContent: 'center',
      flex: 1,
      marginLeft: 190,
    },
    text: {
      color: 'white',
      fontSize: 40,
    },
    screenContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
      marginBottom: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    screenTitle: {
      color: 'white',
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    screenDescription: {
      color: 'white',
      fontSize: 24,
      textAlign: 'center',
    },
    sectionTitle: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold',
      marginVertical: 15,
      textAlign: 'center',
    },
  });
