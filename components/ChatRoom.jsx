import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'; // Import moment.js for formatting timestamps

export default function ChatRoom({ route }) {
    // Access data from route.params
    const { data, fivaId, setMessageSent, messageSent } = route.params;
    const { username, pfp } = data;
    const [messages, setMessages] = useState("");
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        // Function to fetch messages from Firestore
        const fetchMessages = () => {
            const docId = createDocId(fivaId, data.fivaId);

            // Listen to real-time updates
            const unsubscribe = firestore()
                .collection('chatrooms')
                .doc(docId)
                .collection('messages')
                .orderBy('time', 'asc')
                .onSnapshot(snapshot => {
                    const fetchedMessages = snapshot.docs.map(doc => doc.data());
                    setChatMessages(fetchedMessages);
                });

            return () => unsubscribe(); // Clean up the listener on unmount
        };

        fetchMessages();
    }, [fivaId, data.fivaId]);

    const renderChatItem = ({ item }) => {
        const isSent = item.sentBy === fivaId;
        let formattedTime = 'Unknown';
        if (item.time) {
            try {
                const date = item.time.toDate ? item.time.toDate() : new Date(item.time);
                formattedTime = moment(date).format('HH:mm');
            } catch (error) {
                console.error('Error formatting time: ', error);
            }
        }

        return (
            <View style={[styles.chat, isSent ? styles.sent : styles.received]}>
                <Text style={isSent ? styles.sentText : styles.receivedText}>{item.message}</Text>
                <Text style={isSent ? styles.sentTime : styles.receivedTime}>
                    {formattedTime}
                </Text>
            </View>
        );
    };

    const generateUUID = () => {
        return 'xxxxxxxx-xxxxxxx-4xxx-yxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const createDocId = (id1, id2) => {
        const str1 = id1.toString();
        const str2 = id2.toString();
        return str1.localeCompare(str2, undefined, { numeric: true, sensitivity: 'base' }) < 0
            ? `${str1}-${str2}`
            : `${str2}-${str1}`;
    };

    const sendMessage = () => {
        const msg = messages;
        const sentBy = fivaId;
        const sentTo = data.fivaId;
        const msgId = generateUUID();
        const docId = createDocId(sentBy, sentTo);

        firestore()
            .collection('chatrooms')
            .doc(docId)
            .collection('messages')
            .add({
                sentBy,
                message: msg,
                time: firestore.FieldValue.serverTimestamp(),
                messageId: msgId
            })
            .then(() => {
                console.log('Message sent successfully');
                setMessages(""); // Clear the message input field
                setMessageSent(!messageSent)
            })
            .catch((error) => {
                console.error('Error sending message: ', error);
            });
            
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>
                <Image style={styles.pfp} source={{ uri: pfp }} />
                <Text style={styles.username}>{username}</Text>
            </View>
            <FlatList
                data={chatMessages}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.messageId}
                contentContainerStyle={styles.chatCover}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    mode='flat'
                    value={messages}
                    onChangeText={(text) => setMessages(text)}
                    style={styles.textInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#12090e',
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: "10%",
        padding: 15,
        backgroundColor: "#97175b",
    },
    pfp: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    username: {
        fontSize: 18,
        color: "white",
        marginLeft: 15,
        fontWeight: "bold",
    },
    chatCover: {
        flex: 1,
        padding: 10,
    },
    chat: {
        borderRadius: 20,
        marginBottom: 10,
        padding: 10,
    },
    receivedText: {
        color: "black",
        fontSize: 17,
    },
    received: {
        backgroundColor: "#edeaec",
        alignSelf: "flex-start",
    },
    sent: {
        backgroundColor: "#97175b",
        alignSelf: "flex-end",
    },
    sentText: {
        color: "#edeaec",
        fontSize: 17,
    },
    sentTime: {
        color: "lightgray",
        fontSize: 12,
        marginTop: 5,
        textAlign: 'right',
    },
    receivedTime: {
        color: "",
        fontSize: 12,
        marginTop: 5,
        textAlign: 'left',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#171717',
    },
    textInput: {
        flex: 1,
        backgroundColor: "lightgrey",
    },
    sendBtn: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#97175b',
        borderRadius: 5,
    },
    sendText: {
        color: 'white',
        fontSize: 20,
    }
});
