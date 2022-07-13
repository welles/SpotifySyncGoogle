function updateCurrentSongListSheet_(likedSongs) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  let currentSheet = spreadSheet.getSheetByName('CURRENT');
  if (!currentSheet) {
    spreadSheet.insertSheet('CURRENT');
    currentSheet = spreadSheet.getSheetByName('CURRENT');
  }

  currentSheet.clearContents();

  const maxRows = currentSheet.getMaxRows();
  if (maxRows < likedSongs.length) {
    currentSheet.insertRows(1, likedSongs.length - maxRows);
  }
  else if (likedSongs.length < maxRows) {
    currentSheet.deleteRows(1, maxRows - likedSongs.length);
  }

  let currentSongs = [];

  for (song of likedSongs) {
    let songInfo = [
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

function addSheetEntriesForAddedSongs_(addedSongs) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  
  let logSheet = spreadSheet.getSheetByName('LOG');
  if (!logSheet) {
    spreadSheet.insertSheet('LOG');
    logSheet = spreadSheet.getSheetByName('LOG');
  }

  for (song of addedSongs) {
    const songInfo = [
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

function addSheetEntriesForRemovedSongs_(removedSongs) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  let logSheet = spreadSheet.getSheetByName('LOG');
  if (!logSheet) {
    spreadSheet.insertSheet('LOG');
    logSheet = spreadSheet.getSheetByName('LOG');
  }

  for (song of removedSongs) {
    const songInfo = [
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

function addSongToPlaylist_(accessToken, songUri, playlistId) {
  const payload =
  {
    position: 0,
    uris: [songUri]
  };

  const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  const params =
  {
    method: "POST",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  getJsonResult_(url, params);
}

function removeSongFromPlaylist_(accessToken, songUri, playlistId) {
  const payload =
  {
    tracks: [{uri: songUri}]
  };

  const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  const params =
  {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  getJsonResult_(url, params);
}

function getPlaylistSongs_(accessToken, playlistId) {
  let playlistSongs = [];
  let total = 0;

  do {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?offset=" + playlistSongs.length;
    const params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    const data = getJsonResult_(url, params);

    if (data.total > total) {
      total = data.total;
    }

    playlistSongs = playlistSongs.concat(data.items);
  }
  while (playlistSongs.length < total);

  return playlistSongs;
}

function getLikedSongs_(accessToken) {
  let likedSongs = [];
  let total = 0;

  do {
    const url = "https://api.spotify.com/v1/me/tracks?limit=50&offset=" + likedSongs.length;

    const params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    const data = getJsonResult_(url, params);

    if (data.total > total) {
      total = data.total;
    }

    likedSongs = likedSongs.concat(data.items);
  }
  while (likedSongs.length < total);

  if (likedSongs.length == 0) {      
    throw "Lied songs list was empty! That can't be right!"
  }

  return likedSongs;
}

function getJsonResult_(url, params) {
  //Override HTTP exception handling
  params.muteHttpExceptions = true;

  let response;
  let responseMessage;
  let tries = 0;

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

    if (!isSuccess_(response)) {
      Logger.log("Request [" + params.method + "] \"" + url + "\" with parameters " + JSON.stringify(params) + " failed with error \"" + responseMessage + "\". (Attempt #" + tries + ")");

      Utilities.sleep(5000);
    }
  }
  while (!isSuccess_(response) && tries < 10)

  if (!isSuccess_(response)) {
    throw "Request [" + params.method + "] \"" + url + "\" was not able to complete after " + tries + " attempts!";
  }

  const json = response.getContentText();

  const data = JSON.parse(json);

  return data;
}

function isSuccess_(response) {
  if (response != null && response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
    return true;
  }

  return false;
}
