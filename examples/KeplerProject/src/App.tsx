import React from 'react';
import {StyleSheet, ImageBackground, View} from 'react-native';
import {Link} from './components/Link';
import NewRelicVegaAgent from 'newrelic-vega-agent';

export const App = () => {

  const styles = getStyles();

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
      <View style={styles.background}>
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
            linkText={'Fetch error'}
            onPress={() => {
              fetch("https://api.ipify-x.org?format=json")
                .then((response) => response.json())
                .then((data) => {
                  console.log("ApiFy response = ", data);
                })
                .catch((error) => {
                  console.log("ApiFy response error = ", error);
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
            NewRelicVegaAgent.harvestNow();
          }}
        />
        <Link
          linkText={'Record Custom Event'}
          onPress={() => {
            NewRelicVegaAgent.recordCustomEvent('VegaMyEvent', {
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
  });
