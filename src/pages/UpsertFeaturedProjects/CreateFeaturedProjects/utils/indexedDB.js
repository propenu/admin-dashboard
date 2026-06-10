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


export const saveImage = async (file, type = "gallery", prefix = "img") => {
  const db = await getDB();

  const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;

  const fileName = file.name || "image.jpg";

  const key = `${prefix}__${Date.now()}__${fileName}`;

  // Original file size
  console.log("File name:", file.name);
  console.log("Bytes:", file.size);
  console.log("KB:", (file.size / 1024).toFixed(2), "KB");
  console.log("MB:", (file.size / (1024 * 1024)).toFixed(2), "MB");

  // ✅ FORCE BLOB
  const blob = new Blob([file], { type: file.type });

  await db.put(storeName, blob, key);

  return key;
};;


//
// ✅ GET SINGLE IMAGE
//
export const getImage = async (key, type = "gallery") => {
  const db = await getDB();

  const storeName = type === "gallery" ? STORES.GALLERY : STORES.OTHER;
//error
  const blob = await db.get(storeName, key);

  if (blob) {
    console.log("Retrieved image size:");
    console.log("Bytes:", blob.size);
    console.log("KB:", (blob.size / 1024).toFixed(2), "KB");
    console.log("MB:", (blob.size / (1024 * 1024)).toFixed(2), "MB");
  }
//error

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

// export const getFileFromKey = async (key, type = "other") => {
//   if (!key) return null;

//   const blob = await getImage(key, type);
//   if (!blob) return null;

//   const name =
//     typeof key === "string" && key.includes("__")
//       ? key.split("__")[2] // because prefix__timestamp__filename
//       : "image.jpg";

//       console.log("✅ Retrieved file:", name);

//   return new File([blob], name, {
//     type: blob.type,
//   });
// };

//
// ✅ GET ALL GALLERY IMAGES ONLY
//


export const getFileFromKey = async (key, type = "other") => {
  if (!key) return null;

  const blob = await getImage(key, type);

  if (!blob) {
    console.error("❌ No blob found for key:", key);
    return null;
  }

  const parts = key.split("__");
  const name = parts.slice(2).join("__") || "image.jpg";

  console.log("✅ Retrieved file:", name);

  return new File([blob], name, {
    type: blob.type,
  });
};

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
