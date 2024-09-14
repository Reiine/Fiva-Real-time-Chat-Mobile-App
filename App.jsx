import { StyleSheet, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register from './components/Register';
import Landing from './components/Landing';
import Login from './components/Login';
import ChatScreen from './components/ChatScreen';
import ChatRoom from './components/ChatRoom';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Stack = createNativeStackNavigator();



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [changeState, setChangeState] = useState(false);
  const [fivaId, setFivaId] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const data = await AsyncStorage.getItem('isLoggedIn');
        const fivaId = await AsyncStorage.getItem('userFivaId');
        if (data === 'true') {
          setIsLoggedIn(true);
          setFivaId(fivaId);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Failed to get login status:', error);
      }
    };

    checkLoginStatus();
  }, [changeState]); // Empty dependency array means this runs once on mount


  function AuthNavigator() {
    return (
      <>
        <StatusBar translucent={true} backgroundColor={"transparent"} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login">
            {(props) => <Login {...props} setChangeState={setChangeState} changeState={changeState} />}
          </Stack.Screen>
        </Stack.Navigator>
      </>
    );
  }

  function AppNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChatScreen">
          {(props) => <ChatScreen {...props} setChangeState={setChangeState} changeState={changeState} fivaId={fivaId} />}
        </Stack.Screen>
        <Stack.Screen name="ChatRoom">
          {(props) => <ChatRoom {...props}  />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
