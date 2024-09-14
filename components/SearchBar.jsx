import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native-paper';
import ChatPreview from './ChatPreview'; // Ensure this is imported

export default function SearchBar({ allUsers, handleChatRoom, fivaId, messageSent }) {

    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        if (searchText === '') {
            setFilteredUsers([]);
        } else {
            const users = allUsers.filter((user) =>
                user.fivaId.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredUsers(users);
        }
    }, [searchText, allUsers]);

    return (
        <View style={styles.wrapper}>
            <TextInput
                mode='outlined'
                style={styles.searchInput}
                theme={{ roundness: 12 }}
                placeholder='Search...'
                value={searchText}
                onChangeText={text => setSearchText(text)}
                outlineColor='transparent'
                activeOutlineColor='transparent'
                placeholderTextColor={"#ac8298"}
            />
            {searchText !== '' && (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.fivaId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleChatRoom(item)}
                            style={styles.listItem}
                        >
                            <ChatPreview
                                data={item}
                                fivaId
                                messageSent={messageSent}
                            />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContainer}
                    style={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        padding: 10,
        position: 'relative',
    },
    searchInput: {
        width: '100%',
        height: 50,
        marginBottom: 10,
        backgroundColor:"#edeaec"
    },
    listContainer: {
        flexGrow: 1,
    },
    list: {
        position: 'absolute',
        top: 60, // Adjust based on the height of the search input
        left: 0,
        right: 0,
        backgroundColor: '#171717',
        zIndex: 1,
        maxHeight: 300,
    },
    listItem: {
        marginBottom: 10,
    },
});
