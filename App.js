/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TakePicture from './TakePicture';

function HomeScreen({ navigation }) {
  const [count, setCount] = React.useState(0);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Button onPress={() => setCount(c => c + 1)} title="메뉴" />
          <Button onPress={() => setCount(c => c + 1)} title="추가" />
          <TouchableOpacity style={{margin: 10}} onPress={()=>{alert("you clicked me")}}>
            <Text>Click Me!</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
      <Text>Count: {count}</Text>
      <Button
        title="사진 찍기 테스트"
        onPress={() => navigation.navigate('TakePicture')}
      />
    </View>
  );
}

function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Details... again"
        onPress={() => navigation.push('Details')}
      />
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Overview' }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="TakePicture" component={TakePicture} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
});

export default App;
