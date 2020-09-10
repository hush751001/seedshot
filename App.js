/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import RNFS from 'react-native-fs';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TakePicture from './pages/TakePicture';
import Main from './pages/Main';
import Detail from './pages/Detail';

const Stack = createStackNavigator();

export const rootFolderPath = `${RNFS.ExternalStorageDirectoryPath}/SeedShot`;
RNFS.mkdir(rootFolderPath);

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={Main}
          options={{title: '메인화면'}}
        />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen
          name="TakePicture"
          component={TakePicture}
          options={{
            header: () => {
              return null;
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
