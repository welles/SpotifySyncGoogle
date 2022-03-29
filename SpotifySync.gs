function SavedSongs() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  var savedSongsPlaylistId = spreadSheet.getRangeByName("SAVED_SONGS_PLAYLIST_ID").getValue();
  var savedArchivePlaylistId = spreadSheet.getRangeByName("SAVED_ARCHIVE_PLAYLIST_ID").getValue();

  var service = GetService_();
  var accessToken = service.getAccessToken();

  var likedSongs = GetLikedSongs_(accessToken);

  Logger.log("Liked Songs: " + likedSongs.length);

  var savedSongs = GetPlaylistSongs_(accessToken, savedSongsPlaylistId);

  Logger.log("Saved Songs: " + savedSongs.length);

  var addedSongs = likedSongs.filter(s => !savedSongs.map(x => x.track.id).includes(s.track.id)).reverse();

  Logger.log("Added Songs: " + addedSongs.length);

  for (var i = 0; i < addedSongs.length; i++) {
    Logger.log("Adding \"%s\" by %s to saved songs...", addedSongs[i].track.name, addedSongs[i].track.artists[0].name);
    
    AddSongToPlaylist_(accessToken, addedSongs[i].track.uri, savedSongsPlaylistId);

    Utilities.sleep(5000);
  }

  var removedSongs = savedSongs.filter(s => !likedSongs.map(x => x.track.id).includes(s.track.id));

  Logger.log("Removed Songs: " + removedSongs.length);

  for (var i = 0; i < removedSongs.length; i++) {
    Logger.log("Removing \"%s\" by %s from saved songs...", removedSongs[i].track.name, removedSongs[i].track.artists[0].name);
    
    RemoveSongFromPlaylist_(accessToken, removedSongs[i].track.uri, savedSongsPlaylistId);

    AddSongToPlaylist_(accessToken, removedSongs[i].track.uri, savedArchivePlaylistId);
    
    Utilities.sleep(5000);
  }

  if (addedSongs.length > 0) {
    Logger.log("Adding added songs to sheet...");

    AddSheetEntriesForAddedSongs_(addedSongs);
  }

  if (removedSongs.length > 0) {
    Logger.log("Adding removed songs to sheet...");

    AddSheetEntriesForRemovedSongs_(removedSongs);
  }

  if (addedSongs.length > 0 || removedSongs.length > 0) {
    Logger.log("Updating current songs list sheet...");

    UpdateCurrentSongListSheet_(likedSongs);
  }

  Logger.log("Finished successfully!");
}

function DiscoverWeekly() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var discoverWeeklyPlaylistId = spreadSheet.getRangeByName("DISCOVER_WEEKLY_PLAYLIST_ID").getValue();
  var discoverWeeklyBackupPlaylistId = spreadSheet.getRangeByName("DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID").getValue();

  var service = GetService_();
  var accessToken = service.getAccessToken();

  var discoverWeeklySongs = GetPlaylistSongs_(accessToken, discoverWeeklyPlaylistId).reverse();

  Logger.log("Found %s songs in Discover Weekly playlist.", discoverWeeklySongs.length);

  for (var i = 0; i < discoverWeeklySongs.length; i++) {
    if (!discoverWeeklySongs[i].track) {
      Logger.log("Skipping a song because the associated track object does not exist (anymore)...")
      
      continue;
    }

    Logger.log("Adding \"%s\" by %s to Discover Weekly Backup...", discoverWeeklySongs[i].track.name, discoverWeeklySongs[i].track.artists[0].name);
    
    AddSongToPlaylist_(accessToken, discoverWeeklySongs[i].track.uri, discoverWeeklyBackupPlaylistId);

    Utilities.sleep(5000);
  }

  Logger.log("Finished successfully!");
}

function ReleaseRadar() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var releaseRadarPlaylistId = spreadSheet.getRangeByName("RELEASE_RADAR_PLAYLIST_ID").getValue();
  var releaseRadarBackupPlaylistId = spreadSheet.getRangeByName("RELEASE_RADAR_BACKUP_PLAYLIST_ID").getValue();

  var service = GetService_();
  var accessToken = service.getAccessToken();

  var releaseRadarSongs = GetPlaylistSongs_(accessToken, releaseRadarPlaylistId).reverse();

  Logger.log("Found %s songs in Release Radar playlist.", releaseRadarSongs.length);

  for (var i = 0; i < releaseRadarSongs.length; i++) {
    if (!releaseRadarSongs[i].track) {
      Logger.log("Skipping a song because the associated track object does not exist (anymore)...")
      
      continue;
    }

    Logger.log("Adding \"%s\" by %s to Release Radar Backup...", releaseRadarSongs[i].track.name, releaseRadarSongs[i].track.artists[0].name);
    
    AddSongToPlaylist_(accessToken, releaseRadarSongs[i].track.uri, releaseRadarBackupPlaylistId);

    Utilities.sleep(5000);
  }

  Logger.log("Finished successfully!");
}
