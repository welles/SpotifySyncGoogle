function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('SpotifySync')
    .addItem('Configure Script Parameters', 'showSettingsForm')
    .addSeparator()
    .addSubMenu(ui.createMenu('Authorization')
      .addItem('Authorize with Spotify', 'authorize')
      .addItem('Show Callback URL', 'showCallback')
      .addItem('Logout', 'logout'))
    .addSubMenu(ui.createMenu('Manual Trigger')
      .addItem('Saved Songs', 'savedSongs')
      .addItem('Discover Weekly', 'discoverWeekly')
      .addItem('Release Radar', 'releaseRadar'))
  .addToUi();
}

function showSettingsForm() {
  const ui = SpreadsheetApp.getUi();
  const userProperties = PropertiesService.getUserProperties();

  const template = HtmlService.createTemplateFromFile('SettingsForm.html');
  template.SPOTIFY_CLIENT_ID = userProperties.getProperty('SPOTIFY_CLIENT_ID');
  template.SPOTIFY_CLIENT_SECRET = userProperties.getProperty('SPOTIFY_CLIENT_SECRET');
  template.SPOTIFY_SAVED_SONGS_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_SAVED_SONGS_PLAYLIST_ID');
  template.SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID');
  template.SPOTIFY_RELEASE_RADAR_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_RELEASE_RADAR_PLAYLIST_ID');
  template.SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID');
  template.SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID');
  template.SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID = userProperties.getProperty('SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID');
  
  const output = template.evaluate().setHeight(566);

  ui.showModelessDialog(output, 'Configure Script Parameters');
}

function processSettingsForm(formObject) {
  const ui = SpreadsheetApp.getUi();
  const userProperties = PropertiesService.getUserProperties();

  const SPOTIFY_CLIENT_ID = formObject.SPOTIFY_CLIENT_ID;
  if (SPOTIFY_CLIENT_ID) {
    userProperties.setProperty('SPOTIFY_CLIENT_ID', SPOTIFY_CLIENT_ID);
  }

  const SPOTIFY_CLIENT_SECRET = formObject.SPOTIFY_CLIENT_SECRET;
  if (SPOTIFY_CLIENT_SECRET) {
    userProperties.setProperty('SPOTIFY_CLIENT_SECRET', SPOTIFY_CLIENT_SECRET);
  }

  const SPOTIFY_SAVED_SONGS_PLAYLIST_ID = formObject.SPOTIFY_SAVED_SONGS_PLAYLIST_ID;
  if (SPOTIFY_SAVED_SONGS_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_SAVED_SONGS_PLAYLIST_ID', SPOTIFY_SAVED_SONGS_PLAYLIST_ID);
  }

  const SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID = formObject.SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID;
  if (SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID', SPOTIFY_SAVED_ARCHIVE_PLAYLIST_ID);
  }

  const SPOTIFY_RELEASE_RADAR_PLAYLIST_ID = formObject.SPOTIFY_RELEASE_RADAR_PLAYLIST_ID;
  if (SPOTIFY_RELEASE_RADAR_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_RELEASE_RADAR_PLAYLIST_ID', SPOTIFY_RELEASE_RADAR_PLAYLIST_ID);
  }

  const SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID = formObject.SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID;
  if (SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID', SPOTIFY_DISCOVER_WEEKLY_PLAYLIST_ID);
  }

  const SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID = formObject.SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID;
  if (SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID', SPOTIFY_RELEASE_RADAR_BACKUP_PLAYLIST_ID);
  }

  const SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID = formObject.SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID;
  if (SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID) {
    userProperties.setProperty('SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID', SPOTIFY_DISCOVER_WEEKLY_BACKUP_PLAYLIST_ID);
  } 

  ui.alert('Parameter values updated successfully!');
}
