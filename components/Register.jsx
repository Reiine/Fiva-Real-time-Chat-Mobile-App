import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, StatusBar } from 'react-native';
import { TextInput } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export default function Register({ navigation }) {
    const [fivaId, setFivaId] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pfp, setPfp] = useState('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };



    const handleRegister = async () => {
        try {
            setLoading(true);
            // Check if all fields are filled
            if (!username || !fivaId || !password) {
                Alert.alert('Please fill all details');
                setLoading(false);
                return;
            }

            // Trim and validate Fiva ID
            const trimmedFivaId = fivaId.trim();
            if (trimmedFivaId.length === 0) {
                Alert.alert('Invalid Fiva ID');
                setLoading(false);
                return;
            }

            // Save user data to Firestore
            const userRef = firestore().collection('users').doc(trimmedFivaId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                Alert.alert('Fiva ID already exists. Please choose another one.');
                setLoading(false);
                return;
            }

            await userRef.set({
                username,
                password, // Note: In production, passwords should be hashed for security
                pfp,
                fivaId
            });
            setLoading(false);
            Alert.alert('Registered successfully');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('An error occurred. Please try again.');
            setLoading(false);
        }
    }


    const pickImageAndUpload = async () => {
        try {
            setLoading(true);
            const result = await launchImageLibrary({ quality: 0.5 });

            if (result.didCancel) {
                console.log('User cancelled image picker');
                setPfp(defaultPfpUrl); // Use default image URL
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
                    const fileName = generateUUID(); // Generate a unique file name with extension
                    const reference = storage().ref(`/user-profile/${fileName}`);

                    await reference.putFile(fileUri);
                    const downloadURL = await reference.getDownloadURL();
                    setPfp(downloadURL);
                    Alert.alert('Success', 'Image uploaded successfully');
                } else {
                    console.log('No file URI found');
                    Alert.alert('Error', 'No file URI found.');
                    setPfp(defaultPfpUrl); // Use default image URL
                }
            } else {
                console.log('No assets found in the result');
                Alert.alert('Error', 'No image assets found.');
                setPfp(defaultPfpUrl); // Use default image URL
            }
            setLoading(false);
        } catch (error) {
            console.error('Error picking or uploading image:', error);
            Alert.alert('Error', 'An error occurred while picking or uploading the image.');
            setPfp(defaultPfpUrl); // Use default image URL in case of error
            setLoading(false);
        }
    };

    const handleFivaIdChange = (text) => {
        const trimmedText = text.startsWith('@') ? text.substring(1) : text;
        setFivaId(trimmedText);
    };

    return (
        <KeyboardAvoidingView behavior='height' keyboardVerticalOffset={-100}>
            <SafeAreaView style={styles.wrapper}>
                {loading ? <ActivityIndicator size={"large"} color={"#171717"} style={styles.loadingContainer} /> :
                    <>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Landing')}>
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <View style={styles.headerView}>
                            <Text style={styles.headertxt}>Register</Text>
                        </View>
                        <View style={styles.userinfo}>
                            <TouchableOpacity activeOpacity={0.9} onPress={pickImageAndUpload}>
                                <Image
                                    style={styles.image}
                                    source={{ uri: pfp }}
                                />
                            </TouchableOpacity>
                            <TextInput
                                mode='flat'
                                textColor='white'
                                placeholder='Cool Name'
                                placeholderTextColor={"#d1a8cf"}
                                style={styles.nameInput}
                                cursorColor='white'
                                activeUnderlineColor='transparent'
                                underlineColor="transparent"
                                onChangeText={text => setUserName(text)}
                            />
                            <View style={styles.formBox}>
                                <TextInput
                                    mode='outlined'
                                    style={styles.fivaIdInput}
                                    cursorColor='black'
                                    onChangeText={handleFivaIdChange}
                                    paddingHorizontal={10}
                                    textAlign="left"
                                    autoCapitalize='none'
                                    label={"Your Fiva Id"}
                                    theme={{roundness:12}}
                                    outlineColor='#773674'
                                    
                                />
                                <TextInput
                                    mode='outlined'
                                    style={styles.fivaIdInput}
                                    cursorColor='black'
                                    onChangeText={text => setPassword(text)}
                                    paddingHorizontal={10}
                                    textAlign="left"
                                    autoCapitalize='none'
                                    label={"Your Password"}
                                    theme={{roundness:12}}
                                    outlineColor='#773674'
                                />
                                <TouchableOpacity activeOpacity={0.8} style={styles.donebtn} onPress={handleRegister}>
                                    <Text style={styles.donebtntxt}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#97175b",
        height: "100%",
        display: "flex",
    },
    headertxt: {
        color: "#edeaec",
        fontSize: 46,
        alignSelf: "center",
        fontWeight: "bold",
    },
    userinfo: {
        backgroundColor: "#081506",
        height: "200%",
        flex: 2,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerView: {
        flex: 1.2,
        justifyContent: "center",
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "white",
        position: "absolute",
        top: -75,
        alignSelf: "center",
    },
    nameInput: {
        backgroundColor: "transparent",
        width: "70%",
        alignSelf: "center",
        textAlign: "center",
        marginTop: 80,
        fontSize: 32,
        color: "white",
    },
    backText: {
        fontSize: 20,
        position: "absolute",
        marginTop: 50,
        marginLeft: 20,
        color: "#efe8ee",
    },
    formBox: {
        height: "57%",
        backgroundColor: "#edeaec",
        alignSelf: "center",
        borderRadius: 24,
        borderBottomRightRadius: 0,
        marginTop: 30,
        borderColor: "#110711",
        borderWidth:1,
        padding:15,
        width:"86%"
    },
    normalTxt: {
        color: "#150d15",
        fontWeight: "bold",
        marginLeft: 20,
        marginTop: 20,
        fontSize: 16,
    },
    fivaIdInput: {
        backgroundColor: "#edeaec",
        fontSize: 16,
        marginTop: -10,
        width:"90%",
        alignSelf:"center",
        marginTop:20,
    },
    passwordBox: {
        alignSelf: "center",
        width: "90%",
        height: 50,
        marginTop: 10,
        backgroundColor:"#edeaec"
    },
    donebtn: {
        backgroundColor: "#97175b",
        width: "90%",
        alignSelf: "center",
        marginTop: 30,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        borderWidth:1,
        borderColor:"#150d15"
    },
    donebtntxt: {
        textAlign: "center",
        fontSize: 24,
        color: "#edeaec",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
