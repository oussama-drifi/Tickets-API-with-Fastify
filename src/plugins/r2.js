import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Minimal env validation for required R2 credentials
if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Missing R2 configuration: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required');
}

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

function normalizePublicUrl(url) {
    if (!url) return '';
    return url.replace(/\/+$/g, '');
}

async function uploadBuffer(bucket, publicUrl, buffer, contentType, ext) {
    const key = `${randomUUID()}${ext}`;
    try {
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));
    } catch (err) {
        console.error('R2 upload — S3 PutObject failed:', err);
        return { error: 'Failed to upload image to storage' };
    }
    const base = normalizePublicUrl(publicUrl) || '';
    const url = base ? `${base}/${key}` : key;
    return { url, key };
}

async function deleteFromR2(bucket, imageUrl) {
    if (!imageUrl) return;
    // Strip query string and fragment if present
    const cleanUrl = imageUrl.split('?')[0].split('#')[0];
    const key = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
    if (!key) return;

    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    } catch (err) {
        // Log delete errors for easier debugging — not fatal
        console.error('R2 deletion — S3 DeleteObject failed:', err);
    }
}

export async function saveProfileImage(filePart) {
    // keep backward compatible behavior: return { url }
    const res = await uploadForTicketOrProfile(process.env.R2_PROFILES_BUCKET, process.env.R2_PROFILES_PUBLIC_URL, filePart, { makeThumb: false });
    if (res.error) return res;
    return { url: res.fullUrl };
}

export async function deleteProfileImage(imageUrl) {
    return deleteFromR2(process.env.R2_PROFILES_BUCKET, imageUrl);
}

async function uploadForTicketOrProfile(bucket, publicUrl, filePart, options = { makeThumb: true }) {
    if (!ALLOWED_IMAGE_TYPES.includes(filePart.mimetype)) {
        return { error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    let buffer;
    try {
        buffer = await filePart.toBuffer();
    } catch (err) {
        console.error('R2 upload — failed to read file buffer:', err);
        return { error: 'Failed to read uploaded file' };
    }

    const extIndex = filePart.filename ? filePart.filename.lastIndexOf('.') : -1;
    const ext = extIndex !== -1 ? filePart.filename.substring(extIndex) : '';

    // Upload original
    const originalResult = await uploadBuffer(bucket, publicUrl, buffer, filePart.mimetype, ext);
    if (originalResult.error) return originalResult;

    let thumbResult = null;
    if (options.makeThumb) {
        try {
            const thumbBuffer = await sharp(buffer).resize({ width: 400 }).webp({ quality: 75 }).toBuffer();
            thumbResult = await uploadBuffer(bucket, publicUrl, thumbBuffer, 'image/webp', '.webp');
            if (thumbResult.error) {
                // cleanup original if thumb failed
                await deleteFromR2(bucket, originalResult.url || originalResult.key);
                return thumbResult;
            }
        } catch (err) {
            console.error('Thumbnail creation failed:', err);
            // cleanup original
            await deleteFromR2(bucket, originalResult.url || originalResult.key);
            return { error: 'Failed to process thumbnail' };
        }
    }

    // Build returned URLs consistently
    const basePublic = normalizePublicUrl(publicUrl);
    const fullUrl = originalResult.key ? (basePublic ? `${basePublic}/${originalResult.key}` : originalResult.key) : originalResult.url;
    const thumbUrl = thumbResult ? (thumbResult.key ? (basePublic ? `${basePublic}/${thumbResult.key}` : thumbResult.key) : thumbResult.url) : null;

    return { fullUrl, thumbUrl };
}

export async function saveTicketImage(filePart) {
    return uploadForTicketOrProfile(process.env.R2_TICKETS_BUCKET, process.env.R2_TICKETS_PUBLIC_URL, filePart, { makeThumb: true });
}

export async function deleteTicketImage(imageUrlOrObj) {
    // Accept either a single url string or an object { fullUrl, thumbUrl }
    if (!imageUrlOrObj) return;
    if (typeof imageUrlOrObj === 'string') {
        return deleteFromR2(process.env.R2_TICKETS_BUCKET, imageUrlOrObj);
    }
    if (imageUrlOrObj.fullUrl) await deleteFromR2(process.env.R2_TICKETS_BUCKET, imageUrlOrObj.fullUrl);
    if (imageUrlOrObj.thumbUrl) await deleteFromR2(process.env.R2_TICKETS_BUCKET, imageUrlOrObj.thumbUrl);
}