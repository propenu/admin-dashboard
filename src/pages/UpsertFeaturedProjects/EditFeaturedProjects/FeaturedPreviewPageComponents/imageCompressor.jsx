import {
  compressProjectImage,
  getImageRejectError,
} from "../../../../utils/compressProjectImage";

/**
 * Edit-project image helper — same rule as create:
 * images only; ≤1MB no compress; >1MB → ~0.9MB @ quality 0.8
 */
export const compressImage = async (
  file,
  _type = "default",
  label = "Image",
) => {
  const reject = getImageRejectError(file, label);
  if (reject) {
    throw new Error(reject);
  }

  return compressProjectImage(file, { label });
};
