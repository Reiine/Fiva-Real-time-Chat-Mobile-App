import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatPreview from './ChatPreview';
import firestore from '@react-native-firebase/firestore';
import SearchBar from './SearchBar';

export default function ChatScreen({ navigation, setChangeState, changeState, fivaId }) {
    const [pfp, setPfp] = useState('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]); // Initialize as empty array
    const [isLoading, setIsLoading] = useState(false)
    const [messageSent, setMessageSent] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDocRef = firestore().collection('users').doc(fivaId);
                const userDoc = await userDocRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    setUsername(userData.username);
                    setPfp(userData.pfp);
                    return userData;
                } else {
                    console.log('No such user!');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [fivaId]);

    useEffect(() => {
        const fetchOtherUsers = async () => {
            setIsLoading(true);
            const createDocId = (id1, id2) => {
                const str1 = id1.toString();
                const str2 = id2.toString();
                return str1.localeCompare(str2, undefined, { numeric: true, sensitivity: 'base' }) < 0
                    ? `${str1}-${str2}`
                    : `${str2}-${str1}`;
            };

            try {
                // Fetch other users
                const getUserSnapshot = await firestore().collection('users').where('fivaId', "!=", fivaId).get();
                if (!getUserSnapshot || getUserSnapshot.empty) {
                    console.log('No users found.');
                    setUsers([]);
                    setIsLoading(false);
                    return;
                }

                const allUsers = getUserSnapshot.docs.map(docSnap => docSnap.data());
                setAllUsers(allUsers);

                // Filter users with messages
                const filteredUsers = await Promise.all(allUsers.map(async (user) => {
                    const docId = createDocId(fivaId, user.fivaId);
                    const messagesSnapshot = await firestore().collection('chatrooms').doc(docId).collection('messages').get();

                    // Check if there are any messages
                    if (!messagesSnapshot.empty) {
                        return user; // Return user if they have messages
                    }
                    return null; // Return null if no messages
                }));

                // Remove null entries
                const validUsers = filteredUsers.filter(user => user !== null);

                setUsers(validUsers);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching other users:', error);
                setUsers([]);
                setIsLoading(false);
            }
        };

        fetchOtherUsers();
    }, [fivaId]);



    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem("isLoggedIn");
            await AsyncStorage.removeItem('token');
            setChangeState(!changeState);
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatRoom = (data) => {
        navigation.navigate('ChatRoom', { data, fivaId, setMessageSent, messageSent });

    };

    return (
        <SafeAreaView style={styles.wrapper}>
            {isLoading ? <ActivityIndicator size={"large"} color={"#773674"} style={styles.loadingContainer} /> :
                <>
                    <View style={styles.headerCover}>
                        <View style={styles.userInfoCover}>
                            <View style={styles.userProfile}>
                                <TouchableOpacity activeOpacity={0.8}>
                                    <Image
                                        style={styles.userImage}
                                        source={{ uri: pfp }}
                                    />
                                </TouchableOpacity>
                                <View style={styles.nameAndIdDiv}>
                                    <Text style={styles.username}>{username}</Text>
                                    <Text style={styles.fivaId}>@{fivaId}</Text>
                                </View>
                            </View>
                            <Image
                                style={styles.shareIcon}
                                source={{ uri: "https://static.vecteezy.com/system/resources/previews/014/455/886/non_2x/share-icon-on-transparent-background-free-png.png" }}
                            />
                        </View>
                        <SearchBar allUsers={allUsers} handleChatRoom={handleChatRoom} />
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.chatsCover}>
                            {users.length > 0 && (
                                users.map((data, index) => (
                                    <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => handleChatRoom(data)}>
                                        <ChatPreview
                                            data={data}
                                            fivaId={fivaId}
                                            messageSent={messageSent}
                                        />
                                    </TouchableOpacity>
                                ))
                            )}
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                                <Text style={styles.logoutText}>Temporary Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#97175b",
    },
    userImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    userInfoCover: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        paddingHorizontal: 20,
        alignItems: "flex-start"
    },
    userProfile: {
        flexDirection: "row",
        alignItems: "center",
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        color: "whitesmoke",
    },
    chatsCover: {
        backgroundColor: "#150d15",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        height: "100%",
    },
    shareIcon: {
        width: 40,
        height: 40,
        marginRight: 10,
        marginTop: 10
    },
    scrollContainer: {
        flexGrow: 1,
    },
    ChatText: {
        fontSize: 42,
        color: "#efe8ee",
        paddingLeft: 20,
        zIndex:-1,
        fontWeight:"bold"
    },
    logoutButton: {
        alignSelf: "center",
        marginTop: "50%",
        backgroundColor: "red",
        padding: 20,
    },
    logoutText: {
        fontSize: 20,
        color: "#171717",
    },
    nameAndIdDiv: {
        justifyContent: "center",
        marginLeft: 10
    },
    fivaId: {
        color: "#d1a8cf"
    },
    noChatsText: {
        color: "white",
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCover:{
        height:"21%"
    }
});
