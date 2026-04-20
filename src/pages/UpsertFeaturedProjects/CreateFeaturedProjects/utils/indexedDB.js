import { openDB } from "idb";

const DB_NAME = "featured-db";
const DB_VERSION = 2;

// 🔥 STORE NAMES
const STORES = {
  GALLERY: "gallery-images",
  OTHER: "other-images",
};

//
// ✅ INIT DB
//
export const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Gallery store
      if (!db.objectStoreNames.contains(STORES.GALLERY)) {
        db.createObjectStore(STORES.GALLERY);
      }

      // Other images store
      if (!db.objectStoreNames.contains(STORES.OTHER)) {
        db.createObjectStore(STORES.OTHER);
      }
    },
  });
};

//
// ✅ SAVE IMAGE
// type = "gallery" | "other"
//
// export const saveImage = async (file, type = "gallery") => {
//   const db = await getDB();

//   if (!file || !(file instanceof Blob)) {
//     console.error("❌ Invalid file:", file);
//     return null;
//   }

//   const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;

//   // 🔥 keep original filename
//   const fileName = file.name || `image_${Date.now()}.jpg`;

//   const key = `${Date.now()}__${fileName}`;

//   await db.put(storeName, file, key);

//   return key;
// };

export const saveImage = async (file, type = "gallery", prefix = "img") => {
  const db = await getDB();

  const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;

  const fileName = file.name || "image.jpg";

  // 🔥 UNIQUE KEY
  const key = `${prefix}__${Date.now()}__${fileName}`;

  await db.put(storeName, file, key);

  return key;
};

//
// ✅ GET SINGLE IMAGE
//
export const getImage = async (key, type = "gallery") => {
  const db = await getDB();

  const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;

  return db.get(storeName, key);
};

//
// ✅ DELETE IMAGE
//
export const deleteImage = async (key, type = "gallery") => {
  const db = await getDB();

  const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;

  if (!key) {
    console.error("❌ deleteImage: key missing");
    return;
  }

  await db.delete(storeName, key);
};

//
// ✅ CLEAR ALL
//
export const clearAllImages = async () => {
  const db = await getDB();

  await db.clear(STORES.GALLERY);
  await db.clear(STORES.OTHER);
};

export const getFileFromKey = async (key, type = "other") => {
  if (!key) return null;

  const blob = await getImage(key, type);
  if (!blob) return null;

  const name =
    typeof key === "string" && key.includes("__")
      ? key.split("__")[2] // because prefix__timestamp__filename
      : "image.jpg";

  return new File([blob], name, {
    type: blob.type,
  });
};

//
// ✅ GET ALL GALLERY IMAGES ONLY
//


export const getAllGalleryImages = async () => {
  const db = await getDB();
  const keys = await db.getAllKeys(STORES.GALLERY);

  const files = await Promise.all(
    keys.map(async (key) => {
      const blob = await db.get(STORES.GALLERY, key);

      const name =
        typeof key === "string" && key.includes("__")
          ? key.split("__")[2]
          : "image.jpg";

      return new File([blob], name, {
        type: blob.type,
      });
    }),
  );

  return files;
};

//
// ✅ GET ALL OTHER IMAGES (hero, logo, about, plans)
//
export const getAllOtherImages = async () => {
  const db = await getDB();
  const keys = await db.getAllKeys(STORES.OTHER);

  const result = {};

  for (const key of keys) {
    const blob = await db.get(STORES.OTHER, key);

    const name =
      typeof key === "string" && key.includes("__")
        ? key.split("__")[2]
        : "image.jpg";

    result[key] = new File([blob], name, {
      type: blob.type,
    });
  }

  return result;
};
