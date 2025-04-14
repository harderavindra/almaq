import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

// Export your bucket (assumes bucket name 'brand-treasury')
export const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

export const testGCSConnection = async () => {
  try {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets found:');
    buckets.forEach((b) => console.log(' -', b.name));

    const [exists] = await bucket.exists();
    if (exists) {
      console.log(`Bucket "${bucket.name}" exists and is accessible.`);
    } else {
      console.warn(`Bucket "${bucket.name}" does not exist.`);
    }
  } catch (err) {
    console.error('GCS Connection Error:', err.message);
  }
};
