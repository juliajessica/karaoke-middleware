import * as types from './../constants/ActionTypes';
import v4 from 'uuid/v4';

export const nextLyric = (currentSongId) => ({
  type: types.NEXT_LYRIC,
  currentSongId
});

export const restartSong = (currentSongId) => ({
  type: types.RESTART_SONG,
  currentSongId
});

export const changeSong = (newSelectedSongId) => ({
  type: types.CHANGE_SONG,
  newSelectedSongId
});

export function fetchSongId(title){
  return function (dispatch) { //Thunk - action that pause/delay another action to complete extra logic.
    const localSongId = v4();
    dispatch(requestSong(title, localSongId)); //creates a spot to add new song title & UUI to add to state
    title = title.replace(' ', '_');

    return fetch('http://api.musixmatch.com/ws/1.1/track.search?&q_track=' + title + '&page_size=1&s_track_rating=desc&apikey=2692f7892b2ca8068c444cceb319c3b0').then(
      response => response.json(), //1st API call
      error => console.log('An error occured.', error)
    ).then(function(json){
      if (json.message.body.track_list.length > 0) {
        const musicMatchId = json.message.body.track_list[0].track.track_id;
        const artist = json.message.body.track_list[0].track.artist_name;
        const title = json.message.body.track_list[0].track.track_name;
        fetchLyrics(musicMatchId, artist, title, localSongId, dispatch);//seperate fuction that passed these details as parameters. This is the action that will query Musixmatch for lyrics corresponding to the Musixmatch ID.
        //console.log('CHECK OUT THIS SWEET API RESPONSE:', json);
      } else {
        console.log('We couldn\'t locate a song under that ID!');
      }
    }); //print to the console
  };
}  //async action: a Redux action performing an asynchronous task.

export function fetchLyrics(musicMatchId, artist, title, localSongId, dispatch){
  //pass dispatch method to dispatch another Redux action
  return fetch('http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + musicMatchId + '&apikey=2692f7892b2ca8068c444cceb319c3b0').then(//2nd API call
    response => response.json(),
    error => console.log('An error occurred.', error)
  ).then(function(json){
    if(json.message.body.lyrics) {
      let lyrics = json.message.body.lyrics.lyrics_body;
      lyrics = lyrics.replace('"', '');
      const songArray = lyrics.split(/\n/g).filter(entry => entry !='');
      dispatch(receiveSong(title, artist, localSongId, songArray));
      dispatch(changeSong(localSongId));
    } else {
      console.log('We couldn\'t locate lyrics for this song!');
    }
    //console.log('HEY WOW, A SECOND API RESPONSE!', json);
  });
}//returns lyrics

export const requestSong = (title, localSongId) => ({
  type: types.REQUEST_SONG,
  title,
  songId: localSongId //uuid
});

export const receiveSong = (title, artist, songId, songArray) => ({
  type: types.RECEIVE_SONG,
  songId,
  title,
  artist,
  songArray,
  receivedAt: Date.now()
});
