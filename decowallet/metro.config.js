/* eslint-disable import/unambiguous */
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');

function getConfig(appDir, options = {}) {
  return {
    watchFolders: [path.resolve(appDir, '../../node_modules'), path.resolve(appDir, '/node_modules')],
    transformer: {
      getTransformOptions: () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resetCache: true,
  };
}

module.export = getConfig(__dirname);
