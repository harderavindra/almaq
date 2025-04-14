// utils/generateSignedUrl.js
import { bucket } from './gcsClient.js'; // Ensure you import your initialized bucket from your GCS client module

/**
 * Generates a signed URL for a file stored in Google Cloud Storage.
 * 
 * @param {string} url - The original URL (expected to contain the base URL).
 * @returns {string|null} A signed URL valid for 10 minutes, or null if an error occurs.
 */
export const generateSignedUrl = async (url) => {
  try {
    // Decode the provided URL
    const decodedUrl = decodeURIComponent(url);
    
    // Define the base URL for your GCS bucket
    const baseUrl =  `https://storage.googleapis.com/${bucket.name}`;
    
    // Extract the file path by removing the baseUrl and stripping any query parameters
    const filePath = decodedUrl.replace(baseUrl, "").split('?')[0];
    
    // Get a reference to the file in your bucket
    const file = bucket.file(filePath);
    
    // Generate a signed URL for reading the file, valid for 10 minutes (600,000 ms)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
    });
    
    return signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
};
/**
 * Generates a signed URL that allows uploading a file to GCS
 * @param {string} filename
 * @param {string} contentType
 * @returns {Promise<string>} Signed URL
 */
export const generateSignedUploadUrl = async (fileName, contentType) => {
    const file = bucket.file(fileName);
  
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
  
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
    return { signedUrl, fileUrl: publicUrl };
  };