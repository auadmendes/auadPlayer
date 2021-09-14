import React from 'react';

//Play audio
export const play = async (playbackObj, uri) => {
    try {
        return await playbackObj.loadAsync({ uri }, { shouldPlay: true });
       
    } catch (error) {
        console.log('error inside the play ', + error.message );
    }

};

//pause audio
export const pause = async (playbackObj,) => {
    try {
        return await playbackObj.setStatusAsync({shouldPlay: false});
       
    } catch (error) {
        console.log('error inside the pause ', + error.message );
    }

};

//resume audio
export const resume = async (playbackObj,) => {
    try {
        return await playbackObj.playAsync();
       
    } catch (error) {
        console.log('error inside the resume ', + error.message );
    }

};

export const playNext = async (playbackObj, uri) => {
    try {
        await playbackObj.stopAsync();
        await playbackObj.unloadAsync();
       return await play(playbackObj, uri)
        
    } catch (error) {
        console.log('error inside the playNex ', + error.message );
    }
}
//select another audio