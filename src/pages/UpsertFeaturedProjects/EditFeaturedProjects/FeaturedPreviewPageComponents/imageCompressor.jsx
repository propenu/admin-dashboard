import { compressProjectImage } from "../../../../utils/compressProjectImage";

/**
 * Edit-project image helper — same rule as create.
 * Loading / success toasts with compress icon come from compressProjectImage.
 */
export const compressImage = (file, _type = "default", label = "Image") =>
  compressProjectImage(file, { label, silent: false });
