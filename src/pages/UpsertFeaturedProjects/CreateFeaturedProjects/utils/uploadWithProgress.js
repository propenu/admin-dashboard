// utils/uploadWithProgress.js
export const getUploadProgressConfig = (onProgress) => ({
  headers: {
    "Content-Type": "multipart/form-data",
  },
  onUploadProgress: (evt) => {
    if (evt.total) {
      const percent = Math.round((evt.loaded * 100) / evt.total);
      onProgress(percent);
    }
  },
});
 