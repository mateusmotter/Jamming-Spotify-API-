
import playlistTracks from '/Users/mateusmotter/Desktop/Coding/Projects/jammming-test2/src/Components/App/App.js';

let accessToken;
const clientID = "Your Client ID";
const redirectURI = "http://localhost:3000/";

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
    
        //check for token match;
        const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (tokenMatch && expiresInMatch) {
            accessToken = tokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken; 
            } else {
                const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
                window.location = accessURL;
            }
    },

    async search (termSearch){
        const accessToken = Spotify.getAccessToken();
		let TrackList = [];
		let url = `https://api.spotify.com/v1/search?type=track&q=${termSearch}`
		try {
			let response =  await fetch (url, {headers: {Authorization: `Bearer ${accessToken}`}})
			if (response.ok){
				const trackList = await response.json().then((response)=>{
					response.tracks.items.map((track, index) => {
					TrackList[index] = {'id':track.id, 
										'name':track.name,
										'artist':track.artists[0].name,
										'album': track.album.name,
										'uri': track.uri
                                        }})
				});
                
				return TrackList
			}	
		}catch(error){
			console.log(`There was a problem - maybe I need to retrieve again the access token. This is the error ${error}`)
		}
	},

    async savePlaylist(playlistName, URI_arrays){
		if (playlistName && URI_arrays){
			try{
				// Getting the userID
                const accessToken = Spotify.getAccessToken(); //added line
				let headers = {Authorization: `Bearer ${accessToken}`};
				let response =  await fetch ('https://api.spotify.com/v1/me', {headers: headers});
				let userID = await response.json().then((response => response.id));

				// Creating the Spotify list		
				let body = {name:playlistName}
				let postMethod = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,
                    {
                        headers:headers, 
                        method: 'POST', 
                        body:JSON.stringify(body)
                    })
				let playListId = await postMethod.json().then((response => response.id));


				//Add Tracks to the list
				body = {uris:URI_arrays};
				let postMethodAdd = await fetch(`https://api.spotify.com/v1/playlists/${playListId}/tracks`, 
                    {
                        headers:headers, 
                        method: 'POST', 
                        body:JSON.stringify(body)
                    })
				let responseAddTrack = await postMethodAdd.json().then((response => response));
			}catch(error){
				console.log(error);
			}
			}
		else{
			return;
			}
	}
}

export default Spotify;
