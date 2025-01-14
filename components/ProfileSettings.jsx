import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TextInput, Modal, Portal, PaperProvider} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {Base64} from 'js-base64';
import AdvancedSettings from './AdvanceSettings';

export default function ProfileSettings({fivaId,navigation,setChangeState,changeState}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [userId, setUserId] = useState(null);
  const [pfp, setPfp] = useState(
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  );

  useEffect(() => {
    const fetchPfp = async () => {
      try {
        setLoading(true);
        const userRef = firestore()
          .collection('users')
          .where('fivaId', '==', fivaId);
        const snap = await userRef.get();

        if (!snap.empty) {
          const userData = snap.docs[0];
          const userPfp = userData.data()?.pfp;
          const userName = userData.data()?.username;
          setUserId(userData.id);
          setUserName(userName);
          if (userPfp) {
            setPfp(userPfp);
          } else {
          }
        } else {
          console.log('No user found with fivaId:', fivaId);
        }
      } catch (error) {
        console.log('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fivaId) {
      fetchPfp();
    }
  }, [fivaId]);

  const onSaveChanges = async () => {
    try {
      setLoading(true);
      setVisible(true);
    } catch (error) {
      console.log('Error saving changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      setLoading(true);
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
      };
      const result = await launchImageLibrary({quality: 0.5});
      if (result.didCancel) {
        console.log('User cancelled image picker');
        setPfp('https://example.com/default-pfp.png'); // Set default image URL
        setLoading(false);
        return;
      }

      if (result.errorCode) {
        console.error('Image picker error:', result.errorMessage);
        Alert.alert('Error', 'An error occurred while picking the image.');
        setLoading(false);
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileUri = asset.uri;

        if (fileUri) {
          const fileName = generateUUID();
          const reference = storage().ref(`/user-profile/${fileName}`);

          await reference.putFile(fileUri);
          const downloadURL = await reference.getDownloadURL();
          setPfp(downloadURL);
          Alert.alert('Success', 'Image uploaded successfully');
        } else {
          console.log('No file URI found');
          Alert.alert('Error', 'No file URI found.');
          setPfp('https://example.com/default-pfp.png');
        }
      } else {
        console.log('No assets found in the result');
        Alert.alert('Error', 'No image assets found.');
        setPfp('https://example.com/default-pfp.png');
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const generateSalt = () => {
    return 'xxxxxxxxxxxx4xxxyxxx1xxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const userRef = firestore().collection('users').doc(userId);
      const userDataToUpdate = {};

      const pass = Base64.decode((await userRef.get()).data().password);

      if (username.trim() !== '') {
        userDataToUpdate.username = username;
      }
      if (password.trim() !== '' && pass === confirmPassword) {
        const encodedPassword = Base64.encode(password);
        const salt = generateSalt();
        userDataToUpdate.salt = salt;
        userDataToUpdate.password = encodedPassword;
      }

      if (pfp.trim() !== '') {
        userDataToUpdate.pfp = pfp;
      }

      if (Object.keys(userDataToUpdate).length > 0) {
        await userRef.update(userDataToUpdate);
        console.log('Profile updated successfully!');
      } else {
        console.log('No changes to update.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
      setVisible(false);
      fetchPfp();
    }
  };

  return (
    <PaperProvider>
      <ScrollView>
        {loading ? (
          <ActivityIndicator
            size={'large'}
            color={'#773674'}
            style={styles.loadingContainer}
          />
        ) : (
          <SafeAreaView style={styles.wrapper}>
            <KeyboardAvoidingView behavior="height">
              <View style={styles.header}>
                <Text style={styles.headerText}>Profile Settings</Text>
              </View>
              <View style={styles.imageCover}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleImagePicker}>
                  <Image style={styles.image} source={{uri: pfp}} />
                </TouchableOpacity>
              </View>
              <View style={styles.formBox}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 30,
                    color: '#150d15',
                    fontWeight: 'bold',
                  }}>
                  Edit Profile
                </Text>
                <View style={styles.userInfo}>
                  <Text style={styles.normalText}>Your Username:</Text>
                  <TextInput
                    mode="outlined"
                    outlineColor="#773674"
                    style={styles.fivaIdInput}
                    onChangeText={text => setUsername(text)}
                    textColor="black"
                    label={userName}
                  />
                  <Text style={styles.normalText}>Change Password:</Text>
                  <TextInput
                    mode="outlined"
                    outlineColor="#773674"
                    style={styles.fivaIdInput}
                    secureTextEntry={true}
                    onChangeText={text => setPassword(text)}
                    textColor="black"
                  />
                </View>
                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.8}
                  onPress={onSaveChanges}>
                  <Text style={styles.btnTxt}>Save Changes</Text>
                </TouchableOpacity>

                <Portal>
                  <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    contentContainerStyle={styles.modal}>
                    <Image
                      style={styles.lockImage}
                      source={{
                        uri: 'https://static.vecteezy.com/system/resources/previews/009/589/656/original/lock-icon-transparent-free-png.png',
                      }}
                    />
                    <Text style={styles.modalTxt}>
                      Enter your password to confirm save changes:
                    </Text>
                    <TextInput
                      mode="outlined"
                      style={styles.modalInput}
                      secureTextEntry={true}
                      textColor="black"
                      onChangeText={text => setConfirmPassword(text)}
                    />
                    <TouchableOpacity
                      style={[styles.btn, {marginBottom: 40, width: '100%'}]}
                      activeOpacity={0.8}
                      onPress={updateProfile}>
                      <Text style={styles.btnTxt}>Confirm</Text>
                    </TouchableOpacity>
                  </Modal>
                </Portal>
              </View>
              
            </KeyboardAvoidingView>
            <AdvancedSettings userId={userId} navigation={navigation} setChangeState={setChangeState} changeState={changeState} />
          </SafeAreaView>
        )}
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#150d15',
    height:900
  },
  header: {
    height: '10%',
    backgroundColor: '#97175b',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'whitesmoke',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    alignSelf: 'center',
  },
  imageCover: {
    marginTop: 30,
  },
  userInfo: {
    marginTop: 20,
    marginLeft: 20,
  },
  fivaIdInput: {
    backgroundColor: '#edeaec',
    fontSize: 16,
    marginTop: -10,
    width: '90%',
    marginTop: 0.5,
    height: 60,
    marginBottom: 10,
  },
  normalText: {
    fontSize: 16,
    color: '#97175b',
  },
  formBox: {
    height: '50%',
    backgroundColor: '#edeaec',
    alignSelf: 'center',
    borderRadius: 24,
    borderBottomRightRadius: 0,
    marginTop: 30,
    borderColor: '#110711',
    borderWidth: 1,
    padding: 15,
    width: '86%',
  },
  btn: {
    backgroundColor: '#97175b',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 50,
  },
  btnTxt: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'whitesmoke',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    margin: 20,
    borderRadius: 10,
    borderColor: '#97175b',
    borderWidth: 1,
  },
  modalInput: {
    backgroundColor: '#edeaec',
    fontSize: 16,
    marginBottom: 20,
    height: 60,
  },
  modalTxt: {
    fontSize: 16,
    color: '#97175b',
    textAlign: 'center',
  },
  lockImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97175b',
  },
});
