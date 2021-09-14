import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Dimensions } from 'react-native';
import AudioListItem from '../components/AudioListItem';
import { Audio } from 'expo-av';
import { play, pause, resume, } from '../misc/audioController';
import color from '../misc/color';
import { AudioContext } from '../context/AudioProvider';
import PlayerButton from '../components/PlayerButton';




const PlayListDetail = ({ visible, playList, onClose, }) => {

    const audioListPlayer = [playList.AudioContext];
    const context = useContext(AudioContext);
    const handlePlayPause = async (playList) => {        
        
        //Play
        if (context.soundObj === null) {
            const audio = context.currentAudio;
            console.log(audioListPlayer);
            const status = await play(context.playbackObj, audioListPlayer.uri);
            context.playbackObj.setOnPlaybackStatusUpdate(context.onplaybackStatusUpdate);
            return context.updateState(context, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndez: context.currentAudioIndez,
            });
        }
        //Pause
        if (context.soundObj && context.soundObj.isPlaying) {
            const status = await pause(context.playbackObj)
            return context.updateState(context, {
                soundObj: status,
                isPlaying: false,
            });
        }
        //Resume
        if (context.soundObj && !context.soundObj.isPlaying) {
            const status = await resume(context.playbackObj)
            return context.updateState(context, {
                soundObj: status,
                isPlaying: true,
            });
        }

    }

    const handlePress = () => {
        alert("teste");
    }

    return (
        <Modal
            visible={visible}
            animationType='slide'
            onRequestClose={onClose}
            transparent>
            <View style={styles.container}>
                <Text style={styles.title}>{playList.title}</Text>
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={playList.audios}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: 10 }}>
                            <AudioListItem
                                title={item.filename}
                                duration={item.duration}
                                onAudioPress={handlePlayPause}
                            />
                            <PlayerButton onPress={handlePlayPause}
                                style={{ marginHorizontal: 25 }}
                                iconType={context.isPlaying ? 'PLAY' : 'PAUSE'} />                            
                        </View>
                    )}
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, styles.modalBg]} />
        </Modal>
    );
}

const { width, height } = Dimensions.get('window')
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        height: height - 150,
        width: width - 15,
        backgroundColor: '#fff',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    modalBg: {
        backgroundColor: color.MODAL_BG,
        zIndex: -1,
    },
    listContainer: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 5,
        fontWeight: 'bold',
        color: color.ACTIVE_BG
    },
    fileName: {
        color: color.ACTIVE_BG,
    }
});

export default PlayListDetail;