import multer from 'multer';
import sharp from 'sharp';
import path from 'node:path';
import { mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import User from '../models/User.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({});
export const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'public/uploads');
export const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 20, fieldSize: 4096 },
  fileFilter(_req, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(Object.assign(new Error('Only JPEG, PNG, and WebP images are allowed'), { status: 400 }));
    cb(null, true);
  },
});
export async function saveImage(file) {
  if (!file) return '';
  let image;
  try { image = await sharp(file.buffer, { limitInputPixels: 16777216 }).rotate().resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(); }
  catch { throw Object.assign(new Error('Invalid or oversized image'), { status: 400 }); }
  const filename = randomUUID() + '.jpg';
  if (process.env.UPLOAD_BUCKET) {
    await s3.send(new PutObjectCommand({ Bucket: process.env.UPLOAD_BUCKET, Key: filename, Body: image, ContentType: 'image/jpeg' }));
  } else {
    await mkdir(uploadDirectory, { recursive: true });
    await sharp(image).toFile(path.join(uploadDirectory, filename));
  }
  return filename;
}
export async function removeImage(filename) {
  if (!filename) return;
  if (process.env.UPLOAD_BUCKET) await s3.send(new DeleteObjectCommand({ Bucket: process.env.UPLOAD_BUCKET, Key: filename }));
  else await unlink(path.join(uploadDirectory, filename)).catch(() => {});
}
export async function serveUpload(req, res) {
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(jpg|jpeg|png)$/.test(filename)) return res.sendStatus(404);
  const filter = { profileImage: filename };
  if (req.user.role !== 'admin') filter._id = req.user._id;
  if (!await User.exists(filter)) return res.sendStatus(404);
  if (process.env.UPLOAD_BUCKET) {
    try {
      const object = await s3.send(new GetObjectCommand({ Bucket: process.env.UPLOAD_BUCKET, Key: filename }));
      res.type(filename.endsWith('.png') ? 'png' : 'jpeg');
      res.set('Cache-Control', 'private, no-store');
      object.Body.on('error', () => res.destroy());
      object.Body.pipe(res);
    } catch (error) {
      if (error.name === 'NoSuchKey') return res.sendStatus(404);
      throw error;
    }
    return;
  }
  res.sendFile(filename, { root: uploadDirectory, dotfiles: 'deny', headers: { 'Cache-Control': 'private, no-store' } });
}
