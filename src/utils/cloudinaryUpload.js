const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * validate cloudinary config
 * returns true if config is valid, false otherwise
 */

function validateCloudinaryConfig() {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing");
  }
}

/**
 * Compress image using canvas API (client-side)
 * Resizes if needed and applies JPEG compression
 */
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if larger than 1500px on either dimension
        const MAX_WIDTH = 1500;
        const MAX_HEIGHT = 1500;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG blob with 75% quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.75,
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToCloudinary(file) {
  validateCloudinaryConfig();

  const originalSize = file.size;
  console.log(
    `⬆ Starting image upload: ${file.name} (${Math.round(originalSize / 1024)}KB)`,
  );

  let fileToUpload = file;
  let compressedSize = originalSize;

  //compress image first
  try {
    fileToUpload = await compressImage(file);
    compressedSize = fileToUpload.size;
    const savings = Math.round((1 - compressedSize / originalSize) * 100);
    console.log(
      `✓ Image compressed: ${Math.round(originalSize / 1024)}KB → ${Math.round(
        compressedSize / 1024,
      )}KB (${savings}% saved)`,
    );
  } catch (compressErr) {
    console.error("❌ Image compression failed:", compressErr);
    throw compressErr;
  }

  //create formData for cloudinary upload
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", uploadPreset);
  // Optional: add tags for organization
  formData.append("tags", "aestheticpulse");

  try {
    console.log(
      `⬆ Uploading to Cloudinary: ${fileToUpload.name} (${Math.round(compressedSize / 1024)}KB)...`,
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Cloudinary upload failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();

    // Construct optimized CDN URL with transformations
    // c_auto: auto-format (webp for modern browsers, jpg fallback)
    // q_auto: auto-quality optimization
    // dpr_auto: device pixel ratio optimization
    const optimizedUrl = `${data.secure_url.replace("/upload/", "/upload/c_auto,q_auto,dpr_auto/")}`;

    console.log(`✓ Image uploaded successfully: ${data.public_id}`);
    console.log(`✓ CDN URL: ${optimizedUrl}`);

    return optimizedUrl;
  } catch (e) {
    const msg = `❌ Cloudinary upload failed: ${e.message}`;
    console.error(msg);
    throw new Error(msg);
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} - Array of Cloudinary URLs
 */
export async function uploadImagesToCloudinary(files) {
  validateCloudinaryConfig();
  return Promise.all(files.map((file) => uploadImageToCloudinary(file)));
}
