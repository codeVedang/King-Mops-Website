import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase.js';

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

export const uploadProductImages = async (productId, files) => {
  const selected = Array.from(files || []).filter(Boolean);
  if (!selected.length) return [];
  if (!storage) {
    throw new Error('Firebase Storage is not configured yet.');
  }

  const urls = [];
  for (const file of selected.slice(0, 5)) {
    const error = validateImageFile(file);
    if (error) throw new Error(error);
    const extension = file.name.split('.').pop();
    const imageRef = ref(storage, `products/${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    urls.push(await getDownloadURL(imageRef));
  }
  return urls;
};
