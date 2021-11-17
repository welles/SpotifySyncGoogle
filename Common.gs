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

  var data = getJsonResult(url, params);
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

  var data = getJsonResult(url, params);
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

    var data = getJsonResult(url, params);

    playlistSongs = playlistSongs.concat(data.items);
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

    var data = getJsonResult(url, params);

    likedSongs = likedSongs.concat(data.items);
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
    payload: { grant_type: "refresh_token", refresh_token: refreshToken }
  };

  var data = getJsonResult(url, params);

  return data.access_token;
}

function getJsonResult(url, params) {
  //Override HTTP exception handling
  params.muteHttpExceptions = true;

  var response;
  var responseMessage;
  var tries = 0;

  do {
    tries++;
    try {
      response = UrlFetchApp.fetch(url, params);
      responseMessage = response.getResponseCode();
    }
    catch(exception) {
      response = null;
      responseMessage = exception;
    }    

    if (!isSuccess(response)) {
      Utilities.sleep(5000);
    }
  }
  while (!isSuccess(response) && tries < 10)

  if (!isSuccess(response)) {
    throw "Request [" + params.method + "] \"" + url + "\" failed with error " + responseMessage + " after " + tries + " tries!";
  }

  var json = response.getContentText();

  var data = JSON.parse(json);

  return data;
}

function isSuccess(response) {
  if (response != null && response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
    return true;
  }

  return false;
}