import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const driveService = google.drive({ version: 'v3', auth });

export const uploadFileToDrive = async (filePath, fileName) => {
  const fileMetadata = {
    name: fileName,
    parents: process.env.GOOGLE_FOLDER_ID ? [process.env.GOOGLE_FOLDER_ID] : [],
  };

  const media = {
    mimeType: 'image/jpeg', // Adjust if needed
    body: fs.createReadStream(filePath),
  };

  const res = await driveService.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });

  return res.data; // { id, webViewLink, webContentLink }
};
