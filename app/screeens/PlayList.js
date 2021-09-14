import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import color from '../misc/color';

import PlayListInputModel from '../components/PlaylistInputModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioContext } from '../context/AudioProvider';
import { resume } from '../misc/audioController';
import PlayListDetail from '../components/PlayListdetail';

let selectedPlayList = {}
const Playlist = () => {
    const [modalVisible, setModalVisble] = useState(false);
    const [showPlayList, setShowPlayList] = useState(false);

    const context = useContext(AudioContext);
    const { playList, addToPlayList, updateState } = context;

    const createPlayList = async playListName => {
        const result = await AsyncStorage.getItem('playlist');
        if (result !== null) {
            const audios = [];

            if (addToPlayList) {
                audios.push(addToPlayList);
            }
            const newList = {
                id: Date.now(),
                title: playListName,
                audios: audios
            }
            const updatedList = [...playList, newList];
            updateState(context, { addToPlayList: null, playList: updatedList });
            await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))
        }
        setModalVisble(false);
    }

    const renderPlayList = async () => {
        const result = await AsyncStorage.getItem('playlist');
        if (result === null) {
            const defaultPlaylist = {
                id: Date.now(),
                title: 'My favorite',
                audios: []
            }

            const newPlayList = [...playList, defaultPlaylist];
            updateState(context, { playList: [...newPlayList] });
            return await AsyncStorage.setItem('playlist', JSON.stringify([...newPlayList]));
        }
        updateState(context, { playList: JSON.parse(result) });
    }

    useEffect(() => {
        if (!playList.length) {
            renderPlayList()
        }
    }, []);

    const handleBannerPress = async playList => {
        //update playList if there is any seelcted audio
        if (addToPlayList) {
            // want to check is that same audio is already inside the list
            const result = await AsyncStorage.getItem('playlist');

            let oldList = [];
            let sameAudio = false;
            let updatedList = [];

            if (result !== null) {
                oldList = JSON.parse(result);

                updatedList = oldList.filter(list => {
                    if (list.id === playList.id) {
                        for (let audio of list.audios) {
                            if (audio.id === addToPlayList.id) {
                                //alert with message
                                sameAudio = true;
                                return
                            }
                        }
                        //otherwise update the playlist
                        list.audios = [...list.audios, addToPlayList];
                    }
                    return list;
                })
            }
            if (sameAudio === true) {
                Alert.alert('Found same audio!', `${addToPlayList.filename} is already inside the list`);
                sameAudio = false;
                return updatedList(context, { addToPlayList: null });
            }
            updateState(context, { addToPlayList: null, playList: [...updatedList] });
            return AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]));
        }
        // if there is no audio selected open the list.
        selectedPlayList = playList
        setShowPlayList(true);
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.Container}>
                {playList.length ? playList.map(item =>
                    <TouchableOpacity
                        key={item.id.toString()}
                        style={styles.playListBanner}
                        onPress={() => handleBannerPress(item)}
                    >
                        <Text>{item.title}</Text>
                        <Text style={styles.audioCount}>{item.audios.length > 1
                            ? `${item.audios.length} Songs`
                            : `${item.audios.length} Song`}
                        </Text>
                    </TouchableOpacity>) : null}
                <TouchableOpacity onPress={() => setModalVisble(true)}>
                    <Text style={styles.playlistBtn}> + Add New Playlist</Text>
                </TouchableOpacity>
                <PlayListInputModel
                    visible={modalVisible}
                    onClose={() => setModalVisble(false)}
                    onSubmit={createPlayList}
                />
            </ScrollView>
            <PlayListDetail visible={showPlayList} playList={selectedPlayList} onClose={() => setShowPlayList(false)} />
        </>
    )
}

const styles = StyleSheet.create({
    Container: {
        padding: 20,
    },
    audioCount: {
        marginTop: 3,
        opacity: 0.5,
        fontSize: 14,
    },
    playListBanner: {
        padding: 5,
        backgroundColor: 'rgba(204,204,204, 0.3)',
        borderRadius: 3,
        marginBottom: 15,
    },
    playlistBtn: {
        color: color.ACTIVE_BG,
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 14,
        padding: 5,
    }
})

export default Playlist;