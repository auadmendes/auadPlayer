import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import color from '../misc/color';

const PlayListInputModel = ({ visible, onClose, onSubmit }) => {

    const [playListName, setPlayListName] = useState('');

    const handleOnSubmit = () => {
        if(!playListName.trim()){
            onClose();
        }else{
            onSubmit(playListName);
            onClose();
            setPlayListName('');
        }
    }

    return (
        <Modal visible={visible} animationType='fade' transparent>
            <View style={styles.modalContainer}>
                <View style={styles.inputContainer}>
                    <Text style={{ color: color.ACTIVE_BG }}>Create New Playlist</Text>
                    <TextInput value={playListName} onChangeText={(text) => setPlayListName(text)} style={styles.input} />
                    <AntDesign
                        style={styles.submitIcon}
                        name="check" size={24}
                        color={color.ACTIVE_FONT} 
                        onPress={handleOnSubmit}                       
                    />
                </View>
            </View>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[StyleSheet.absoluteFillObject, styles.modalBg]} />
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: width - 20,
        borderRadius: 10,
        height: 200,
        backgroundColor: color.ACTIVE_FONT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: width - 40,
        borderBottomWidth: 1,
        borderBottomColor: color.ACTIVE_BG,
        fontSize: 18,
        paddingVertical: 5,

    },
    submitIcon: {
        padding: 10,
        backgroundColor: color.ACTIVE_BG,
        borderRadius: 50,
        marginTop: 15,
    },
    modalBg: {
        backgroundColor: color.MODAL_BG,
        zIndex: -1,
    }
});

export default PlayListInputModel;