

let accessToken;
const clientID = '070cc543d9674dbfb2f50057211efe01';
const redirectURI = "http://localhost:3000/";

const Spotify = {
    getAccessToken() {
        console.log('1 got here');
        if (accessToken) {
            // console.log(accessToken);
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
            // console.log('got in if');
            return accessToken; 
            } else {
                const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
                window.location = accessURL;
            }
    },
    search(term) { 
        const accessToken = Spotify.getAccessToken();
        let fetchAddress = `https://api.spotify.com/v1/me/search?type=track&q=${term}`;
        console.log(fetchAddress);
        console.log(accessToken);
        return fetch(fetchAddress, 
        {headers: {
            Authorizarition: `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist[0].name,
                album: track.album,
                uri: track.uri
            }))
        })
    },
    savePlaylist(playlistName, trackUris) {
        if (!playlistName || !trackUris.length) {
            return;
        } 
        const accessToken = Spotify.getAccessToken();
        const headers  = { Authorizarition : `Bearer ${accessToken}`};
        let userId;

        return fetch('https://api.spotify.com/v1/me', { headers: headers })
            .then(response => response.json())
            .then(jsonResponse => {
                userId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
                { 
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ playlistName: playlistName })
                })
            }).then(response => response.json()).then(jsonResponse => {
                    const playlistId = jsonResponse.id;
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({ uris: trackUris })
                    })
                })
            
    }
}

export default Spotify;