import { bucket } from './gcsClient.js'; // Ensure you import your initialized bucket from your GCS client module

/**
 * @param {string} url - The original URL (expected to contain the base URL).
 * @returns {string|null} A signed URL valid for 10 minutes, or null if an error occurs.
 */
export const generateSignedUrl = async (url) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const baseUrl = `https://storage.googleapis.com/${bucket.name}/`; // <- Notice the trailing slash
  
      // Remove baseUrl from the full URL
      let filePath = decodedUrl.replace(baseUrl, "").split('?')[0];
  
      // Extra safety: remove any leading slashes (if double slashes remain)
      filePath = filePath.replace(/^\/+/, '');
  
      const file = bucket.file(filePath);
  
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
  
      return signedUrl;
    } catch (err) {
      console.error('Error generating signed URL:', err);
      return null;
    }
  };
/**
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


  /**
 * Delete a file from GCS
 * @param {string} filePath - The path of the file to be deleted from GCS
 * @returns {Promise<boolean>} - Returns true if the file is successfully deleted, false if an error occurs
 */
  export const deleteFileFromGCS = async (fileUrl) => {
    try {
      const decodedUrl = decodeURIComponent(fileUrl);
      const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;
  
      let filePath = decodedUrl.replace(baseUrl, '');
      filePath = filePath.replace(/^\/+/, '');
  
      console.log('Sanitized GCS File Path:', filePath);
  
      // ✅ Define the file object from bucket
      const file = bucket.file(filePath);
  
      await file.delete();
  
      console.log(`File ${filePath} deleted successfully from GCS.`);
      return true;
    } catch (err) {
      console.error('Error deleting file from GCS:', err);
      return false;
    }
  };