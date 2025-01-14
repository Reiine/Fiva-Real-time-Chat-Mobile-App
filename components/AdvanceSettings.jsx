import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdvancedSettings = ({userId, navigation,setChangeState,changeState}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(prevState => !prevState);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('token');
      setChangeState(!changeState);
      navigation.navigate('Landing')
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reference to the user document
              const userDocRef = firestore().collection('users').doc(userId);

              // Delete the user document
              await userDocRef.delete();

              Alert.alert('Success', 'User has been deleted successfully.');
              handleLogout();
            } catch (error) {
              console.error('Error deleting user document:', error);
              Alert.alert(
                'Error',
                'Failed to delete the user. Please try again.',
              );
            }
          },
        },
      ],
    );
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
        <Text style={styles.buttonText}>
          {isOpen ? 'Hide' : 'Show'} Advanced Settings
        </Text>
      </TouchableOpacity>

      {/* Wrapper with fixed height */}
      <View style={styles.dropdownWrapper}>
        {isOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={handleDelete} style={styles.option}>
              <Text style={styles.optionText}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.option}>
              <Text style={styles.optionText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    marginTop: -100,
  },
  button: {
    padding: 15,
    backgroundColor: '#150d15',
    borderRadius: 5,
    marginBottom: 10,
    height: 60,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    height: 100,
    justifyContent: 'center',
  },
  dropdown: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'whitesmoke',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AdvancedSettings;
