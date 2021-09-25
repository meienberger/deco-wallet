import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import SendScreen from '../screens/SendScreen';

const IconStyle = { marginBottom: -3 };

// https://icons.expo.fyi/
function TabBarIcon(props: { name: 'ios-code'; color: string }) {
  const { color, name } = props;

  return <Ionicons size={30} name={name} style={IconStyle} color={color} />;
}

const HomeStack = createNativeStackNavigator();

const ReceiveStack = createNativeStackNavigator();

const SendStack = createNativeStackNavigator();

function HomeTabNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function ReceiveTabNavigator() {
  return (
    <ReceiveStack.Navigator>
      <ReceiveStack.Screen name="ReceiveScreen" component={ReceiveScreen} />
    </ReceiveStack.Navigator>
  );
}

function SendTabNavigator() {
  return (
    <SendStack.Navigator>
      <SendStack.Screen name="SendScreen" component={SendScreen} />
    </SendStack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator();

export default function BottomTabNavigator(): JSX.Element {
  return (
    <BottomTab.Navigator initialRouteName="Home">
      <BottomTab.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Receive"
        component={ReceiveTabNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Send"
        component={SendTabNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}
