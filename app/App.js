import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Text } from 'react-native';

// Force RTL layout for Hebrew UI
I18nManager.forceRTL(true);

import HomeScreen from './screens/HomeScreen';
import AdminScreen from './screens/AdminScreen';
import GameScreen from './screens/GameScreen';
import { GameSettingsProvider } from './context/GameSettings';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GameSettingsProvider>
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#16213e',
            borderTopColor: '#0f3460',
          },
          tabBarActiveTintColor: '#e94560',
          tabBarInactiveTintColor: '#a8dadc',
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'בית',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Game"
          component={GameScreen}
          options={{
            tabBarLabel: 'משחק',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎲</Text>,
          }}
        />
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarLabel: 'ניהול',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </GameSettingsProvider>
  );
}
