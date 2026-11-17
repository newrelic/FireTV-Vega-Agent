const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const agentRoot = path.resolve(__dirname, '../..');

const config = {
  watchFolders: [agentRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(agentRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);