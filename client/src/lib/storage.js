import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase.js';

const inlineImageMaxBytes = 160 * 1024;

export const validateImageFile = (file) => {
  if (!file) return null;
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return 'Only JPG and PNG files are allowed.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Each image must be 5MB or smaller.';
  }
  return null;
};

const dataUrlBytes = (dataUrl) => Math.ceil((dataUrl.length * 3) / 4);

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read selected image.'));
    image.src = URL.createObjectURL(file);
  });

const imageToInlineUrl = async (file) => {
  const image = await loadImage(file);
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(image.src);

  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlBytes(dataUrl) <= inlineImageMaxBytes) {
      return dataUrl;
    }
  }

  throw new Error('Selected image is too large. Paste an image URL or configure Firebase Storage.');
};

const uploadToFirebaseStorage = async (productId, file) => {
  if (!storage) return null;
  const extension = file.name.split('.').pop();
  const imageRef = ref(storage, `products/${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
};

export const uploadProductImages = async (productId, files) => {
  const selected = Array.from(files || []).filter(Boolean);
  if (!selected.length) return [];

  const urls = [];
  for (const file of selected.slice(0, 5)) {
    const error = validateImageFile(file);
    if (error) throw new Error(error);
    try {
      const firebaseUrl = await uploadToFirebaseStorage(productId, file);
      urls.push(firebaseUrl || (await imageToInlineUrl(file)));
    } catch {
      urls.push(await imageToInlineUrl(file));
    }
  }
  return urls;
};
