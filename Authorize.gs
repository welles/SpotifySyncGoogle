// https://github.com/googleworkspace/apps-script-oauth2

function getService_() {
  const userProperties = PropertiesService.getUserProperties();
  const clientId = userProperties.getProperty('SPOTIFY_CLIENT_ID');
  const clientSecret = userProperties.getProperty('SPOTIFY_CLIENT_SECRET');
  const scopes = 'ugc-image-upload user-read-private user-read-email user-library-modify user-library-read playlist-read-private playlist-modify-private playlist-read-collaborative playlist-modify-public';

  return OAuth2.createService('Spotify')
    .setAuthorizationBaseUrl('https://accounts.spotify.com/authorize')
    .setTokenUrl('https://accounts.spotify.com/api/token')
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCache(CacheService.getUserCache())
    .setScope(scopes)
    .setParam('response_type', 'code')
}

function authorize() {
  const service = getService_();
  if (!service.hasAccess()) {
    const authorizationUrl = service.getAuthorizationUrl();
    const template = HtmlService.createTemplate('<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a><br/>Reopen the window when the authorization is complete.');
    template.authorizationUrl = authorizationUrl;
    const htmlOutput = template.evaluate();
    SpreadsheetApp.getUi().showModelessDialog(htmlOutput, 'Authorization');
  }
  else {
    const htmlOutput = HtmlService.createHtmlOutput('The Service is already authorized.');
    SpreadsheetApp.getUi().showModelessDialog(htmlOutput, 'Authorization');
  }
}

function logout() {
  const service = getService_();

  service.reset();
}

function authCallback(request) {
  const service = getService_();
  const isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function showCallback() {
  SpreadsheetApp.getUi().alert('This is the callback URL that needs to be added to the Spotify Client: \n' + 'https://script.google.com/macros/d/' + ScriptApp.getScriptId() + '/usercallback');
}
