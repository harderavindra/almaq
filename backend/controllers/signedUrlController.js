import { generateSignedUrl, generateSignedUploadUrl } from '../utils/generateSignedUrl.js';

/**
 * Handles both upload and view signed URL generation
 * @route GET /api/signed-url
 * @query {type} 'upload' | 'view'
 * @query {fileName} required for upload
 * @query {contentType} optional, for upload
 * @query {url} required for view
 */ 
export const getSignedUrlHandler = async (req, res) => {
  try {
    const { type, fileName, contentType, url } = req.query;

    if (type === 'upload') {
      if (!fileName) {
        return res.status(400).json({ error: 'Missing fileName for upload' });
      }

      const { signedUrl, fileUrl } = await generateSignedUploadUrl(fileName, contentType || 'application/octet-stream');
      return res.json({ signedUrl, fileUrl });
    }

    if (type === 'view') {
      if (!url) {
        return res.status(400).json({ error: 'Missing URL for view' });
      }

      const signedUrl = await generateSignedUrl(url);
      if (!signedUrl) {
        return res.status(500).json({ error: 'Could not generate signed URL' });
      }

      return res.json({ signedUrl });
    }

    return res.status(400).json({ error: 'Invalid type parameter' });

  } catch (err) {
    console.error('Error in getSignedUrlHandler:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
