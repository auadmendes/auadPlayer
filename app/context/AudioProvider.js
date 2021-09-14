import React, { Component, createContext } from 'react';
import { render } from 'react-dom';
import { Text, View, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { DataProvider } from 'recyclerlistview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import{ Audio } from 'expo-av';
import { storeAudioForNextOpening } from '../misc/herlper';
import { playNext } from '../misc/audioController';
export const AudioContext = createContext()
export class AudioProvider extends Component {

    constructor(props) {
        super(props)
        this.state = {
            audioFiles: [],
            playList: [],
            addToPlayList: null,
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1 !== r2),
            playbackObj: null,
            soundObj: null,
            currentAudio: {},
            isPlaying: false,
            currentAudioIndez: null,
            playbackPosition: null,
            playbackDuration: null,
        };
        this.totalAudioCount = 0;
    }

    permissionAllert = () => {
        Alert.alert("Permission Required", "This app needs to read audio files",
            [{
                text: 'I am ready',
                onPress: this.getPermission()
            }, {
                text: 'Cancel',
                onPress: () => this.permissionAllert()
            }
            ])
    }

    getAudioFiles = async () => {
        const { dataProvider, audioFiles } = this.state
        let media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio'
        });
        media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: media.totalCount
        });
        this.totalAudioCount = media.totalCount
        this.setState({
            ...this.state, dataProvider: dataProvider.cloneWithRows([...audioFiles, ...media.assets]),
            audioFiles: [...audioFiles, ...media.assets]
        })
        //console.log(media.assets.length);
    };

    loadPreviousAudio = async () => {
        // we need to load audio from async storage
        let previousAudio = await AsyncStorage.getItem('previousAudio');
        let currentAudio;
        let currentAudioIndez;

        if (previousAudio === null) {            
            currentAudio = this.state.audioFiles[0];
            currentAudioIndez = 0
        } else {            
            previousAudio = JSON.parse(previousAudio);
            currentAudio = previousAudio.audio
            currentAudioIndez = previousAudio.index            
        }
        this.setState({...this.state, currentAudio, currentAudioIndez});
    }

    getPermission = async () => {
        const permission = await MediaLibrary.getPermissionsAsync()
        if (permission.granted) {
            //getl all audio files
            this.getAudioFiles();
        }

        if (!permission.canAskAgain && !permission.granted) {
            this.setState({ ...this.state, permissionError: true })
        }

        if (!permission.granted && permission.canAskAgain) {
            const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'denied' && canAskAgain) {
                //message to user, needss to allow permission to use the app
                this.permissionAllert()
            }
            if (status === 'granted') {
                //get the media files
                this.getAudioFiles();
            }
            if (status === 'denied' && !canAskAgain) {
                //Display error to user
                this.setState({ ...this.state, permissionError: true })
            }
        }

    }

    componentDidMount() {
        this.getPermission();
        if(this.state.playbackObj === null){
            this.setState({...this.state, playbackObj: new Audio.Sound()})
        }
    }

    //update seekbar

    onplaybackStatusUpdate = async (playbackstatus) => {
        if (playbackstatus.isLoaded && playbackstatus.isPlaying) {
            this.updateState(this, {
                playbackPosition: playbackstatus.positionMillis,
                playbackDuration: playbackstatus.durationMillis,
            });
        }
        if (playbackstatus.didJustFinish) {
            const nextAudioIndex = this.state.currentAudioIndez + 1;
            //there is no next audio or the current audio is the las
            if (nextAudioIndex >= this.totalAudioCount) {
                this.state.playbackObj.unloadAsync();
                this.updateState(this, {
                    soundObj: null,
                    currentAudio: this.audioFiles[0],
                    isPlaying: false,
                    currentAudioIndez: [0],
                    playbackDuration: null,
                    playbackPosition: null,
                });
                return await storeAudioForNextOpening(this.audioFiles[0], 0);
            }
            //otherwise we select the next audio
            const audio = this.state.audioFiles[nextAudioIndex];
            const status = await playNext(this.state.playbackObj, audio.uri);
            this.updateState(this, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndez: nextAudioIndex,
            });
            await storeAudioForNextOpening(audio, nextAudioIndex);
        }
    };

    //updateseekbar

    updateState = (prevState, newState = {}) => {
        this.setState({ ...prevState, ...newState })
    }
    render() {
        const {
            audioFiles,
            playList,
            addToPlayList,
            dataProvider,
            permissionError,
            playbackObj,
            soundObj,
            currentAudio,
            isPlaying,
            currentAudioIndez,
            playbackPosition,
            playbackDuration,
        } = this.state
        if (permissionError) return <View>
            <Text>It looks like you haven't accept the permission</Text>
        </View>
        return (
            <AudioContext.Provider value={{
                audioFiles,
                playList,
                addToPlayList,
                dataProvider,
                playbackObj,
                soundObj,
                currentAudio,
                isPlaying,
                currentAudioIndez,
                playbackPosition,
                playbackDuration,
                totalAudioCount: this.totalAudioCount,
                updateState: this.updateState,
                loadPreviousAudio: this.loadPreviousAudio,
                onplaybackStatusUpdate: this.onplaybackStatusUpdate,
            }}>
                {this.props.children}
            </AudioContext.Provider>
        );
    }
}

export default AudioProvider;