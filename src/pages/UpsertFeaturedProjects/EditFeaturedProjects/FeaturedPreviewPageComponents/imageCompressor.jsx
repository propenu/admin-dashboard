import imageCompression from "browser-image-compression";
import { toast } from "sonner";

export const compressImage = async (
  file,
  type = "default",
  label = "Image",
) => {
  const toastId = toast.loading(`${label} compressing... ⏳`);

  let options = {};

  // ✅ HERO IMAGE SETTINGS
  if (type === "hero") {
    options = {
      maxSizeMB: 1.2,
      maxWidthOrHeight: 1920,
      initialQuality: 0.85,
      useWebWorker: true,
    };
  }

  // ✅ LOGO SETTINGS
  else if (type === "logo") {
    options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 500,
      initialQuality: 0.7,
      useWebWorker: true,
    };
  }

  // ✅ GALLERY SETTINGS
  else if (type === "gallery") {
    options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1400,
      initialQuality: 0.75,
      useWebWorker: true,
    };
  }

  // ✅ DEFAULT
  else {
    options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      initialQuality: 0.7,
      useWebWorker: true,
    };
  }

  try {
    console.log("Original:", (file.size / 1024 / 1024).toFixed(2), "MB");

    const compressedFile = await imageCompression(file, options);

    console.log(
      "Compressed:",
      (compressedFile.size / 1024 / 1024).toFixed(2),
      "MB",
    );

    // ✅ Blob → File conversion
    const finalFile = new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });

    console.log("✅ FINAL FILE:", finalFile);

    console.log("✅ FINAL FILE instanceof File:", finalFile instanceof File);

    toast.success(`${label} compressed successfully ✅`, {
      id: toastId,
    });

    return finalFile;
  } catch (error) {
    console.error(error);

    toast.error(`${label} compression failed ❌`, {
      id: toastId,
    });

    return file;
  }
};
