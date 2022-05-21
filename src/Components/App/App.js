import React from 'react';
import './App.css';
import { Playlist } from './../Playlist/Playlist';
import { SearchBar } from './../SearchBar/SearchBar';
import { SearchResults } from './../SearchResults/SearchResults';
import Spotify from '/Users/mateusmotter/Desktop/Coding/Projects/jammming-test2/src/util/Spotify.js';

class App extends React.Component {
  constructor(prop) {
    super(prop);
    
    this.state = {
      searchResults: []
  ,
      playlistName: 'New Playlist',
      playlistTracks: [] 
      ,
    };
    this.addTracks = this.addTracks.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTracks(track) {
    let tracks = this.state.playlistTracks;
      if (tracks.find(savedTrack => savedTrack.id === track.id)) {
        return;
      } 
      tracks.push(track);
      this.setState({ playlistTracks: tracks });
  }
  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);

    this.setState({ playlistTracks: tracks });
  }
  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }
  savePlaylist() {
    const trackUris = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
      this.setState({
      playlistName : 'New Playlist',
      playlistTracks : []
    })});
  }

  // Currently developing a logic to remove a track from the search results once it has already been added to the new playlist
  search(term) {
    Spotify.search(term).then(searchResults => {

      // creates a new array containing all IDs from the songs returned from the search
      let searchResultsIDs = searchResults.map(track => track.id);
      
      // creates a new array containing all IDs from the songs saved in the new playlist
      let savedTrackIDs = this.state.playlistTracks.map(track => track.id);
      let songsToBeRemovedFromSearch = [];

      // loops though both new arrays and compare each of the items, adds to 'songsToBeRemovedFromSearch' if any of the IDs is the same;
      for (let searchId of searchResultsIDs) {
        for (let savedId of savedTrackIDs) {
          if (searchId === savedId) {
            console.log(searchId);
            songsToBeRemovedFromSearch.push(searchId);          
          }
        }
      }
      
      let filteredSearchResults = [];
      
      // loops through search results, adding to 'filteredSearchResults' songs that have not been included in 'songsToBeRemovedFromSearch';
      for (let track of searchResults) {
          if (songsToBeRemovedFromSearch.includes(track.id)) {
            console.log('don\'t add this one!!!');
          } else {
            filteredSearchResults.push(track);
            console.log('added!')
          }
        }
      // sets the state of 'searchResults' to 'filteredSearchResults', meaning songs that have already been added to the playlist won't be displayed to be added again in another search
      this.setState({ searchResults: filteredSearchResults });
      
    })
  }
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} 
              onAdd={this.addTracks}/>
            <Playlist playlistName={this.state.playlistName} 
              playlistTracks={this.state.playlistTracks} 
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
              onRemove={this.removeTrack}/>
          </div>
        </div>
      </div>
    )
  }
}

export default App;