function SavedSongs() {
  var userProperties = PropertiesService.getUserProperties();

  var clientId = userProperties.getProperty("CLIENT_ID");
  var clientSecret = userProperties.getProperty("CLIENT_SECRET");
  var refreshToken = userProperties.getProperty("REFRESH_TOKEN");
  var savedSongsPlaylistId = userProperties.getProperty("SAVED_SONGS_PLAYLIST_ID");
  var savedArchivePlaylistId = userProperties.getProperty("SAVED_ARCHIVE_PLAYLIST_ID");
  var spreadSheetId = userProperties.getProperty("SPREADSHEET_ID");

  var accessToken = getAccessToken(clientId, clientSecret, refreshToken);

  var likedSongs = getLikedSongs(accessToken);

  Logger.log("Liked Songs: " + likedSongs.length);

  var savedSongs = getPlaylistSongs(accessToken, savedSongsPlaylistId);

  Logger.log("Saved Songs: " + savedSongs.length);

  var addedSongs = likedSongs.filter(s => !savedSongs.map(x => x.track.id).includes(s.track.id)).reverse();

  Logger.log("Added Songs: " + addedSongs.length);

  for (var i = 0; i < addedSongs.length; i++) {
    Logger.log("Adding \"%s\" by %s to saved songs...", addedSongs[i].track.name, addedSongs[i].track.artists[0].name);
    
    addSongToPlaylist(accessToken, addedSongs[i].track.uri, savedSongsPlaylistId);    

    Utilities.sleep(1000);
  }

  var removedSongs = savedSongs.filter(s => !likedSongs.map(x => x.track.id).includes(s.track.id));

  Logger.log("Removed Songs: " + removedSongs.length);

  for (var i = 0; i < removedSongs.length; i++) {
    Logger.log("Removing \"%s\" by %s from saved songs...", removedSongs[i].track.name, removedSongs[i].track.artists[0].name);
    
    removeSongFromPlaylist(accessToken, removedSongs[i].track.uri, savedSongsPlaylistId);

    addSongToPlaylist(accessToken, removedSongs[i].track.uri, savedArchivePlaylistId);

    Utilities.sleep(1000);
  }

  if (addedSongs.length > 0) {
    Logger.log("Adding added songs to sheet...");

    addSheetEntriesForAddedSongs(spreadSheetId, addedSongs);
  }

  if (removedSongs.length > 0) {
    Logger.log("Adding removed songs to sheet...");

    addSheetEntriesForRemovedSongs(spreadSheetId, removedSongs);
  }

  if (addedSongs.length > 0 || removedSongs.length > 0) {
    Logger.log("Updating current songs list sheet...");

    updateCurrentSongListSheet(spreadSheetId, likedSongs);
  }

  Logger.log("Finished successfully!");
}

function DiscoverWeekly() {
  var userProperties = PropertiesService.getUserProperties();

  var clientId = userProperties.getProperty("CLIENT_ID");
  var clientSecret = userProperties.getProperty("CLIENT_SECRET");
  var refreshToken = userProperties.getProperty("REFRESH_TOKEN");
  var discoverWeeklyPlaylistId = userProperties.getProperty("DISCOVER_WEEKLY_PLAYLIST_ID");
  var discoverWeeklyBackupPlaylistId = userProperties.getProperty("DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID");

  var accessToken = getAccessToken(clientId, clientSecret, refreshToken);

  var discoverWeeklySongs = getPlaylistSongs(accessToken, discoverWeeklyPlaylistId).reverse();

  Logger.log("Found %s songs in Discover Weekly playlist.", discoverWeeklySongs.length);

  for (var i = 0; i < discoverWeeklySongs.length; i++) {
    Logger.log("Adding \"%s\" by %s to Discover Weekly Backup...", discoverWeeklySongs[i].track.name, discoverWeeklySongs[i].track.artists[0].name);
    
    addSongToPlaylist(accessToken, discoverWeeklySongs[i].track.uri, discoverWeeklyBackupPlaylistId);    

    Utilities.sleep(1000);
  }

  Logger.log("Finished successfully!");
}

function ReleaseRadar() {
  var userProperties = PropertiesService.getUserProperties();

  var clientId = userProperties.getProperty("CLIENT_ID");
  var clientSecret = userProperties.getProperty("CLIENT_SECRET");
  var refreshToken = userProperties.getProperty("REFRESH_TOKEN");
  var releaseRadarPlaylistId = userProperties.getProperty("RELEASE_RADAR_PLAYLIST_ID");
  var releaseRadarBackupPlaylistId = userProperties.getProperty("RELEASE_RADAR_BACKUP_PLAYLIST_ID");

  var accessToken = getAccessToken(clientId, clientSecret, refreshToken);

  var releaseRadarSongs = getPlaylistSongs(accessToken, releaseRadarPlaylistId).reverse();

  Logger.log("Found %s songs in Release Radar playlist.", releaseRadarSongs.length);

  for (var i = 0; i < releaseRadarSongs.length; i++) {
    Logger.log("Adding \"%s\" by %s to Release Radar Backup...", releaseRadarSongs[i].track.name, releaseRadarSongs[i].track.artists[0].name);
    
    addSongToPlaylist(accessToken, releaseRadarSongs[i].track.uri, releaseRadarBackupPlaylistId);    

    Utilities.sleep(1000);
  }

  Logger.log("Finished successfully!");
}
