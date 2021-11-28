import { AppRegistry } from 'react-native';
import './shim.js';
import { name as appName } from './app.json';
import Root from './src/Root';

AppRegistry.registerComponent(appName, () => Root);
