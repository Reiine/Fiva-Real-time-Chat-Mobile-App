import { SafeAreaView, StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'; // For formatting the date

export default function ChatPreview({ data, fivaId, messageSent }) {
    const { pfp, username } = data;
    const [lastMessage, setLastMessage] = useState('');
    const [lastMessageTime, setLastMessageTime] = useState('');

    useEffect(() => {
        const fetchLastChat = async () => {
            try {
                const docId = createDocId(fivaId, data.fivaId);

                const querySnapshot = await firestore()
                    .collection('chatrooms')
                    .doc(docId)
                    .collection('messages')
                    .orderBy('time', 'desc') // Order by time descending
                    .limit(1) // Get only the most recent message
                    .get();

                if (!querySnapshot.empty) {
                    const lastMessageDoc = querySnapshot.docs[0].data();
                    const messageText = lastMessageDoc.message || '';
                    const messageTime = lastMessageDoc.time ? lastMessageDoc.time.toDate() : new Date();
                    setLastMessage(messageText);
                    setLastMessageTime(moment(messageTime).format('HH:mm')); // Format time
                } else {
                    setLastMessage(''); // Ensure it's empty if no messages
                }
            } catch (error) {
                console.error('Error fetching last chat message: ', error);
            }
        };

        fetchLastChat();
    }, [messageSent]);

    const createDocId = (id1, id2) => {
        const str1 = id1.toString();
        const str2 = id2.toString();
        return str1.localeCompare(str2, undefined, { numeric: true, sensitivity: 'base' }) < 0
            ? `${str1}-${str2}`
            : `${str2}-${str1}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.singleUserChat}>
                <View style={styles.imgDes}>
                    <Image
                        style={styles.otherUsersPfp}
                        source={{ uri: pfp || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
                    />
                    <View style={styles.otherUsersInfo}>
                        <Text style={styles.otherUsername}>{username}</Text>
                        {lastMessage ? (
                            <Text
                                style={styles.chatPreview}
                                numberOfLines={1} // Truncate text to one line
                                ellipsizeMode='tail' // Add '...' at the end
                            >
                                {lastMessage}
                            </Text>
                        ) : null}
                    </View>
                </View>
                {lastMessageTime ? (
                    <Text style={styles.date}>{lastMessageTime}</Text>
                ) : null}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    singleUserChat: {
        flexDirection: 'row',
        alignItems: 'center', // Center vertically
        marginBottom: 10, // Added margin for spacing between chat previews
        paddingHorizontal: 40,
        marginTop:15,
        justifyContent:"center"
    },
    otherUsersInfo: {
        marginLeft: 10,
        flex: 1, // Allow this view to take available space
        justifyContent: 'center', // Center content vertically
    },
    otherUsersPfp: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    otherUsername: {
        fontSize: 18,
        color: "#edeaec",
    },
    chatPreview: {
        color: "#ac8298",
        fontSize: 15, // Ensure font size is suitable for the chat preview
    },
    date: {
        color: "#ac8298",
        fontSize: 14, // Ensure font size is suitable for the date
    },
    imgDes: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
