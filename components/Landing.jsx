import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity } from 'react-native';


export default function Landing({ navigation }) {
    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.headerView}>
                <Text style={styles.headertxt}>Welcome To Fiva!</Text>
                <Text style={styles.welcometxt}>Chat freely, your privacy is our number one  priority!</Text>
            </View>
            <View style={styles.userinfo}>
                <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate("Register")}><Text style={styles.btnTxt}>Register</Text></TouchableOpacity>
                <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate("Login")}><Text style={styles.btnTxt}>Login</Text></TouchableOpacity>
            </View>
        </SafeAreaView>
    )
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
        width: "80%",
        textAlign: "center",
        marginTop: "60%",

    },
    userinfo: {
        marginTop: 10,
        marginHorizontal: 30,
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        padding: 15,
        borderRadius: 24,
        borderBottomLeftRadius: 0,
        backgroundColor: "#edeaec",
        height: "30%",
        borderColor:"#081506",
        borderWidth:1,
    },
    headerView: {
        justifyContent: "center",
    },
    button: {
        width: "90%",
        backgroundColor: "#97175b",
        height: 70,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#150d15"
    },
    btnTxt: {
        fontSize: 20,
        color: "#edeaec"
    },
    welcometxt: {
        alignSelf: "center",
        fontSize: 20,
        color: "#efe8ee",
        marginVertical: 40,
        textAlign: "center",
        width: "80%",
        marginTop: 10
    },
    image: {
        width: "50%",
        height: "40%",
        position: "absolute",
        top: -75,
        alignSelf: "center",
        borderRadius: 20
    }
})