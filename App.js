/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TakePicture from './pages/TakePicture';
import Main from './pages/Main';
import RNFS from 'react-native-fs';

function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Details... again"
        onPress={() => navigation.push('Details')}
      />
      <Button title="Go to Main" onPress={() => navigation.navigate('Main')} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />
    </View>
  );
}

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
          options={{ title: '메인화면' }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="TakePicture" component={TakePicture} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
