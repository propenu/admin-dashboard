// utils/compressPdfAdvanced.js

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url"; // ✅ FIX
import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

// ✅ Use local worker (NO CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const compressPdfAdvanced = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const newPdf = await PDFDocument.create();

    // ⚠️ LIMIT pages for performance (important)
    const maxPages = Math.min(pdf.numPages, 10); // tweak if needed

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);

      // 🔥 reduce scale for compression
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // 👉 canvas → blob
      const blob = await new Promise(
        (resolve) => canvas.toBlob(resolve, "image/jpeg", 38), // lower quality
      );

      // 🔥 compress image further
      const compressedImage = await imageCompression(blob, {
        maxSizeMB: 20,
        maxWidthOrHeight: 1500,
        useWebWorker: true,
      });

      const imgBytes = await compressedImage.arrayBuffer();
      const img = await newPdf.embedJpg(imgBytes);

      const pageNew = newPdf.addPage([img.width, img.height]);

      pageNew.drawImage(img, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    }

    const pdfBytes = await newPdf.save();

    return new File([pdfBytes], file.name, {
      type: "application/pdf",
    });
  } catch (err) {
    console.error("❌ Compression failed:", err);

    // fallback → return original file
    return file;
  }
};


