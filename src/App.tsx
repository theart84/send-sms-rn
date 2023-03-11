import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  NativeModules,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import socket from '../utilts/socket';
import {ConnectIcon} from './icons/ConnectIcon';
import {DisconnectIcon} from './icons/DisconnectIcon';

const DirectSms = NativeModules.DirectSms;

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<{phone: string; text: string}[]>([]);
  // @ts-ignore
  useEffect(() => {
    const getPermission = async () => {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'Send SMS App Sms Permission',
          message:
            'Send SMS App needs access to your inbox ' +
            'so you can send messages in background.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    };
    getPermission();

    try {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('message', ({phone, text}: {phone: string; text: string}) => {
        setLog(prev => [...prev, {text, phone}]);
        DirectSms.sendDirectSms(phone, text);
      });
    } catch (error) {
      console.log(error);
    }
    return () => socket.disconnect();
  }, []);

  const connectHandler = () => socket.connect();
  const disconnectHandler = () => socket.disconnect();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" />
      <Text style={styles.title}>WebSocket Send SMS</Text>
      <View style={styles.content}>
        <View style={styles.icon}>
          {isConnected ? <ConnectIcon /> : <DisconnectIcon />}
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={connectHandler}>
            <Text style={styles.text}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.disconnectBtn]}
            onPress={disconnectHandler}>
            <Text style={styles.text}>Disconnect</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.log}>
          {log.map(l => (
            <Text
              style={styles.logText}
              key={Date.now().toString(
                36,
              )}>{`[${new Date().toLocaleTimeString()}] tel: ${
              l.phone
            } | text: ${l.text}`}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#101828',
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    justifyContent: 'space-between',
  },
  icon: {
    alignItems: 'center',
    marginBottom: 64,
    height: 240,
  },
  log: {
    height: 150,
  },
  logText: {
    color: 'black',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  disconnectBtn: {
    backgroundColor: 'red',
  },
});

export default App;
