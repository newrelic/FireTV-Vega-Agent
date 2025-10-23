/*
 * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
 *
 * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
 */

import React, {useState} from 'react';
import {StyleSheet, Text, ImageBackground, View, Image} from 'react-native';
import {Link} from './components/Link';
import NewRelicAgent from 'newrelic-kepler-agent'

const images = {
  kepler: require('./assets/kepler.png'),
  learn: require('./assets/learn.png'),
  support: require('./assets/support.png'),
  build: require('./assets/build.png'),
};

export const App = () => {
  const [image, setImage] = useState(images.kepler);
  let lastTime = 0;

  const styles = getStyles();

  return(
      <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
    <View style={styles.background}>
      <Link
            linkText={'Fetch'}
            onPress={() => {
              fetch("https://api.ipify.org?format=json")
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
            linkText={'Throw JS error'}
            onPress={() => {
              new Promise((resolve, reject) => {
                reject(new Error('Unhandled promise rejection!'))
              })
            }}
        />
      <Link
            linkText={'Harvest Now'}
            onPress={() => {
              NewRelicAgent.harvestNow()
            }}
        />
      <Link
            linkText={'Record custom event'}
            onPress= {() => {
              NewRelicAgent.recordCustomEvent("KeplerMyEvent", {"one": 1, "name": "Joe"});
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
