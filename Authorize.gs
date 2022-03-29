// https://github.com/googleworkspace/apps-script-oauth2

function GetService_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var clientId = spreadsheet.getRangeByName('CLIENT_ID').getValue();
  var clientSecret = spreadsheet.getRangeByName('CLIENT_SECRET').getValue();
  var scopes = 'ugc-image-upload user-read-private user-read-email user-library-modify user-library-read playlist-read-private playlist-modify-private playlist-read-collaborative playlist-modify-public';

  return OAuth2.createService('Spotify')
    .setAuthorizationBaseUrl('https://accounts.spotify.com/authorize')
    .setTokenUrl('https://accounts.spotify.com/api/token')
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setCallbackFunction('AuthCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCache(CacheService.getUserCache())
    .setScope(scopes)
    .setParam('response_type', 'code')
}

function ShowSidebar() {
  var service = GetService_();
  if (!service.hasAccess()) {
    var authorizationUrl = service.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
        'Reopen the sidebar when the authorization is complete.');
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  }
  else {
    var page = HtmlService.createHtmlOutput('The Service is already authorized.');
    SpreadsheetApp.getUi().showSidebar(page);
  }
}

function AuthCallback(request) {
  var service = GetService_();
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function ShowCallback() {
  SpreadsheetApp.getUi().alert('https://script.google.com/macros/d/' + ScriptApp.getScriptId() + '/usercallback');
}