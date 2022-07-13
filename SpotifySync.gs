function savedSongs() {
  const userProperties = PropertiesService.getUserProperties();

  const savedSongsPlaylistId = userProperties.getProperty('SPOTIFY_SAVED_SONGS_PLAYLIST_ID');
  const savedArchivePlaylistId = userProperties.getProperty('SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID');
  const ONE_SECOND = 1000;
  const ONE_MINUTE = ONE_SECOND * 60;
  const MAX_EXECUTION_TIME = ONE_MINUTE * 5;
  const START = Date.now();
  const timeOver = function() { return MAX_EXECUTION_TIME < Date.now() - START };

  const service = getService_();
  const accessToken = service.getAccessToken();

  const likedSongs = getLikedSongs_(accessToken);

  Logger.log("Liked Songs: " + likedSongs.length);

  const savedSongs = getPlaylistSongs_(accessToken, savedSongsPlaylistId);

  Logger.log("Saved Songs: " + savedSongs.length);

  const addedSongs = likedSongs.filter(s => !savedSongs.map(x => x.track.id).includes(s.track.id)).reverse();

  Logger.log("Added Songs: " + addedSongs.length);

  const removedSongs = savedSongs.filter(s => !likedSongs.map(x => x.track.id).includes(s.track.id));

  Logger.log("Removed Songs: " + removedSongs.length);

  for (song of addedSongs) {
    Logger.log("Adding \"%s\" by %s to saved songs...", song.track.name, song.track.artists[0].name);
    
    addSongToPlaylist_(accessToken, song.track.uri, savedSongsPlaylistId);

    if (timeOver()) {
      Logger.log("Ran out of time!");
      return;
    }

    Utilities.sleep(5000);
  }

  for (song of removedSongs) {
    Logger.log("Removing \"%s\" by %s from saved songs...", song.track.name, song.track.artists[0].name);
    
    removeSongFromPlaylist_(accessToken, song.track.uri, savedSongsPlaylistId);

    addSongToPlaylist_(accessToken, song.track.uri, savedArchivePlaylistId);

    if (timeOver()) {
      Logger.log("Ran out of time!");
      return;
    }
    
    Utilities.sleep(5000);
  }

  if (addedSongs.length > 0) {
    Logger.log("Adding added songs to sheet...");

    addSheetEntriesForAddedSongs_(addedSongs);
  }

  if (removedSongs.length > 0) {
    Logger.log("Adding removed songs to sheet...");

    addSheetEntriesForRemovedSongs_(removedSongs);
  }

  if (addedSongs.length > 0 || removedSongs.length > 0) {
    Logger.log("Updating current songs list sheet...");

    updateCurrentSongListSheet_(likedSongs);
  }

  Logger.log("Finished successfully!");
}

function discoverWeekly() {
  const userProperties = PropertiesService.getUserProperties();
  const discoverWeeklyPlaylistId = userProperties.getProperty("SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID");
  const discoverWeeklyBackupPlaylistId = userProperties.getProperty("SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID");

  const service = getService_();
  const accessToken = service.getAccessToken();

  const discoverWeeklySongs = getPlaylistSongs_(accessToken, discoverWeeklyPlaylistId).reverse();

  Logger.log("Found " + discoverWeeklySongs.length + " songs in Discover Weekly playlist.");

  for (song of discoverWeeklySongs) {
    if (!song.track) {
      Logger.log("Skipping a song because the associated track object does not exist (anymore)...")
      
      continue;
    }

    Logger.log("Adding \"%s\" by %s to Discover Weekly Backup...", song.track.name, song.track.artists[0].name);
    
    addSongToPlaylist_(accessToken, song.track.uri, discoverWeeklyBackupPlaylistId);

    Utilities.sleep(5000);
  }

  Logger.log("Finished successfully!");
}

function releaseRadar() {
  const userProperties = PropertiesService.getUserProperties();
  const releaseRadarPlaylistId = userProperties.getProperty("SPOTIFY_RELEASE_RADAR_PLAYLIST_ID");
  const releaseRadarBackupPlaylistId = userProperties.getProperty("SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID");

  const service = getService_();
  const accessToken = service.getAccessToken();

  const releaseRadarSongs = getPlaylistSongs_(accessToken, releaseRadarPlaylistId).reverse();

  Logger.log("Found " + releaseRadarSongs.length + " songs in Release Radar playlist.");

  for (song of releaseRadarSongs) {
    if (!song.track) {
      Logger.log("Skipping a song because the associated track object does not exist (anymore)...")
      
      continue;
    }

    Logger.log("Adding \"%s\" by %s to Release Radar Backup...", song.track.name, song.track.artists[0].name);
    
    addSongToPlaylist_(accessToken, song.track.uri, releaseRadarBackupPlaylistId);

    Utilities.sleep(5000);
  }

  Logger.log("Finished successfully!");
}
