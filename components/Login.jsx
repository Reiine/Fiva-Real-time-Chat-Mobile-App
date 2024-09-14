import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation, setChangeState, changeState }) {
    const [fivaId, setFivaId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setTimeout(()=>{
            setIsLoading(false);
        },5000)
        try {
            if (!fivaId || !password) {
                Alert.alert('Please enter both Fiva ID and password');
                setIsLoading(false);
                return;
            }

            // Trim and validate Fiva ID
            const trimmedFivaId = fivaId.trim();
            if (trimmedFivaId.length === 0) {
                Alert.alert('Invalid Fiva ID');
                setIsLoading(false);
                return;
            }

            // Check user credentials in Firestore
            const userRef = firestore().collection('users').doc(trimmedFivaId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                Alert.alert('User not found. Please check your Fiva ID.');
                setIsLoading(false);
                return;
            }

            const userData = userDoc.data();
            if (userData.password !== password) {
                Alert.alert('Incorrect password. Please try again.');
                setIsLoading(false);
                return;
            }

            // Store user data in AsyncStorage (or any other state management)
            await AsyncStorage.setItem('userFivaId', trimmedFivaId);
            await AsyncStorage.setItem('userProfilePic', userData.pfp);
            await AsyncStorage.setItem("isLoggedIn", 'true')
            setChangeState(!changeState)

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={-100}>
        <SafeAreaView style={styles.wrapper}>
            {isLoading ? <ActivityIndicator style={styles.loadingContainer} size={"large"} color={"#773674"} /> :
                <>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButton}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerView}>
                        <Text style={styles.headertxt}>Login</Text>
                    </View>
                    <View style={styles.userinfo}>
                        <View style={styles.formBox}>
                            <TextInput
                                mode='outlined'
                                style={styles.fivaIdInput}
                                cursorColor='black'
                                activeUnderlineColor='#171717'
                                underlineColor="#171717"
                                paddingHorizontal={10}
                                textAlign="left"
                                onChangeText={(text) => setFivaId(text)}
                                autoCapitalize='none'
                                label={"Enter Fiva Id"}
                                outlineColor='#773674'
                            />
                            <TextInput
                                mode='outlined'
                                secureTextEntry
                                style={styles.passwordBox}
                                underlineColor="transparent"
                                onChangeText={(text) => setPassword(text)}
                                autoCapitalize='none'
                                label={"Enter Password"}
                                outlineColor='#773674'
                            />
                            <TouchableOpacity
                                onPress={handleLogin}
                                activeOpacity={0.8}
                                style={styles.donebtn}
                            >
                                <Text style={styles.donebtntxt}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            }
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
        backgroundColor: "#1C1917",
        height: "100%",
        flex: 2,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: "center"
    },
    headerView: {
        flex: 1.2,
        justifyContent: "center",
    },
    backButton: {
        fontSize: 20,
        position: "absolute",
        marginTop: 50,
        marginLeft: 20,
        color: "#efe8ee"
    },
    formBox: {
        height: "57%",
        backgroundColor: "#edeaec",
        width: "86%",
        padding:15,
        alignSelf: "center",
        borderRadius: 24,
        borderBottomRightRadius: 0,
        marginTop: 30,
        borderWidth: 0,
        borderColor: "#03a083",
    },
    normalTxt: {
        color: "#171717",
        fontWeight: "bold",
        marginLeft: 20,
        marginTop: 20,
        fontSize: 16
    },
    fivaIdInput: {
        backgroundColor: "#edeaec",
        color: "black",
        fontSize: 16,
        marginTop: -10,
        width: "90%",
        alignSelf: "center",
        marginTop:20
    },
    passwordBox: {
        alignSelf: "center",
        width: "90%",
        backgroundColor: "#edeaec",
        height: 50,
        marginTop: 10,
    },
    donebtn: {
        backgroundColor: "#97175b",
        width: "90%",
        alignSelf: "center",
        marginTop: 30,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        borderWidth:1
    },
    donebtntxt: {
        textAlign: "center",
        fontSize: 24,
        color: "#edeaec"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
