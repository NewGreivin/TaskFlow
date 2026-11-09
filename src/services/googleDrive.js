import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_AUTH_ENDPOINT = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENDPOINT;
const GOOGLE_DRIVE_API = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_API;
const GOOGLE_UPLOAD_API = process.env.EXPO_PUBLIC_GOOGLE_UPLOAD_API;

export async function authorizeGoogleDrive() {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const authRequest = new AuthSession.AuthRequest({
    clientId: GOOGLE_OAUTH_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    redirectUri,
    responseType: 'token',
  });

  const result = await authRequest.promptAsync(
    new AuthSession.DiscoveryDocument({
      authorizationEndpoint: GOOGLE_AUTH_ENDPOINT,
    })
  );

  if (result.type === 'success') {
    const token = result.params.access_token;
    await AsyncStorage.setItem('google_drive_token', token);
    return token;
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Usuario cancelo la autorizacion de Google Drive.');
  }

  throw new Error('Autorizacion fallida.');
}

export async function getGoogleDriveToken() {
  return await AsyncStorage.getItem('google_drive_token');
}

export async function logoutGoogleDrive() {
  await AsyncStorage.removeItem('google_drive_token');
  await AsyncStorage.removeItem('google_drive_backup_id');
}

export async function uploadBackupToDrive(jsonContent) {
  let token = await getGoogleDriveToken();
  if (!token) {
    token = await authorizeGoogleDrive();
  }

  const existingFileId = await AsyncStorage.getItem('google_drive_backup_id');

  const metadata = {
    name: 'taskflow_backup.json',
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([jsonContent], { type: 'application/json' }));

  let url = `${GOOGLE_UPLOAD_API}/files?uploadType=multipart`;
  let method = 'POST';

  if (existingFileId) {
    url = `${GOOGLE_UPLOAD_API}/files/${existingFileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  let response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (response.status === 401) {
    token = await authorizeGoogleDrive();
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
  }

  if (!response.ok) {
    throw new Error('Error al suber la backup a Google Drive.');
  }

  const data = await response.json();
  if (data.id && method === 'POST') {
    await AsyncStorage.setItem('google_drive_backup_id', data.id);
  }

  return data;
}

export async function getBackupFromDrive() {
  let token = await getGoogleDriveToken();
  if (!token) {
    token = await authorizeGoogleDrive();
  }

  const fileId = await AsyncStorage.getItem('google_drive_backup_id');

  if (!fileId) {
    // Try to search for it if we don't have the ID cached
    const searchUrl = `${GOOGLE_DRIVE_API}/files?q=name='taskflow_backup.json'&spaces=drive`;
    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchResponse.status === 401) {
        token = await authorizeGoogleDrive();
        // retry search
    }

    if (!searchResponse.ok) {
        throw new Error('Error al buscar la backup.');
    }

    const searchData = await searchResponse.json();
    if (searchData.files && searchData.files.length > 0) {
        const foundId = searchData.files[0].id;
        await AsyncStorage.setItem('google_drive_backup_id', foundId);
        return await downloadFile(foundId, token);
    }

    throw new Error('No existing backup found in Google Drive.');
  }

  return await downloadFile(fileId, token);
}

async function downloadFile(fileId, token) {
  const url = `${GOOGLE_DRIVE_API}/files/${fileId}?alt=media`;
  let response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    token = await authorizeGoogleDrive();
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (!response.ok) {
    throw new Error('Error en la descargar de Google Drive.');
  }

  const text = await response.text();
  return JSON.parse(text);
}
