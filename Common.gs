function updateCurrentSongListSheet(spreadSheetId, likedSongs) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var currentSheet = spreadSheet.getSheetByName("CURRENT");

  currentSheet.clearContents();

  var maxRows = currentSheet.getMaxRows();
  if (maxRows < likedSongs.length) {
    currentSheet.insertRows(1, likedSongs.length - maxRows);
  }
  else if (likedSongs.length < maxRows) {
    currentSheet.deleteRows(1, maxRows - likedSongs.length);
  }

  var currentSongs = [];

  for (var i = 0; i < likedSongs.length; i++) {
    var song = likedSongs[i];
    
    var songInfo = [
      `=IMAGE(\"${song.track.album.images[0].url}\")`,
      song.track.name,
      song.track.artists[0].name,
      song.track.album.name,
      Utilities.formatDate(new Date(song.added_at), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.track.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.track.id}\";\"Link\")`
    ];
    
    currentSongs.push(songInfo);
  }

  currentSheet.getRange(1, 1, likedSongs.length, 7).setValues(currentSongs);
}

function addSheetEntriesForAddedSongs(spreadSheetId, addedSongs) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var logSheet = spreadSheet.getSheetByName("LOG");

  for (var i = 0; i < addedSongs.length; i++) {
    var song = addedSongs[i];
    
    var songInfo = [
      "Added",
      `=IMAGE(\"${song.track.album.images[0].url}\")`,
      song.track.name,
      song.track.artists[0].name,
      song.track.album.name,
      Utilities.formatDate(new Date(song.added_at), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.track.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.track.id}\";\"Link\")`
    ];
    
    logSheet.appendRow(songInfo);
  }
}

function addSheetEntriesForRemovedSongs(spreadSheetId, removedSongs) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var logSheet = spreadSheet.getSheetByName("LOG");

  for (var i = 0; i < removedSongs.length; i++) {
    var song = removedSongs[i];
    
    var songInfo = [
      "Removed",
      `=IMAGE(\"${song.track.album.images[0].url}\")`,
      song.track.name,
      song.track.artists[0].name,
      song.track.album.name,
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.track.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.track.id}\";\"Link\")`
    ];
    
    logSheet.appendRow(songInfo);
  }
}

function addSongToPlaylist(accessToken, songUri, playlistId) {
  var payload =
  {
    position: 0,
    uris: [songUri]
  };

  var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  var params =
  {
    method: "POST",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  var result = UrlFetchApp.fetch(url, params);

  var data = JSON.parse(result.getContentText());

  //return result.getResponseCode() == 200;
}

function removeSongFromPlaylist(accessToken, songUri, playlistId) {
  var payload =
  {
    tracks: [{uri: songUri}]
  };

  var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  var params =
  {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  var result = UrlFetchApp.fetch(url, params);

  var data = JSON.parse(result.getContentText());

  //return result.getResponseCode() == 200;
}

function getPlaylistSongs(accessToken, playlistId) {
  var playlistSongs = [];

  do {
    var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?offset=" + playlistSongs.length;
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var result = UrlFetchApp.fetch(url, params);

    var data = JSON.parse(result.getContentText());

    playlistSongs = playlistSongs.concat(data.items);

    Utilities.sleep(100);
  }
  while (playlistSongs.length < data.total);

  return playlistSongs;
}

function getLikedSongs(accessToken) {
  var likedSongs = [];

  do {
    var url = "https://api.spotify.com/v1/me/tracks?offset=" + likedSongs.length;
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var result = UrlFetchApp.fetch(url, params);

    var data = JSON.parse(result.getContentText());

    likedSongs = likedSongs.concat(data.items);

    Utilities.sleep(100);
  }
  while (likedSongs.length < data.total);

  return likedSongs;
}

function getAccessToken(clientId, clientSecret, refreshToken) {
  var url = "https://accounts.spotify.com/api/token";
  var params =
  {
    method: "POST",
    headers: { "Authorization": "Basic " + Utilities.base64Encode(clientId + ":" + clientSecret) },
    payload: { grant_type: "refresh_token", refresh_token: refreshToken },
  };

  var result = UrlFetchApp.fetch(url, params);

  var data = JSON.parse(result.getContentText());

  return data.access_token;
}
