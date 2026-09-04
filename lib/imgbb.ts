/**
 * Reusable ImgBB image uploader for Prayatna Mathematics
 * Uses API endpoint https://api.imgbb.com/1/upload
 */

const IMGBB_API_KEY = "799ab2f2c7b4e888fa19cffe4a7b3ce2";
const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

export interface ImgBBUploadResponse {
  url: string;
  displayUrl: string;
  thumbUrl?: string;
  deleteUrl?: string;
  title?: string;
}

export async function uploadToImgBB(file: File): Promise<ImgBBUploadResponse> {
  // Validate file
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Size limit check (max 16MB)
  if (file.size > 16 * 1024 * 1024) {
    throw new Error("File size exceeds 16MB limit.");
  }

  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", file);

  const response = await fetch(IMGBB_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json?.error?.message || "Failed to upload image to ImgBB. Please try again.";
    throw new Error(errorMsg);
  }

  return {
    url: json.data.url,
    displayUrl: json.data.display_url || json.data.url,
    thumbUrl: json.data.thumb?.url,
    deleteUrl: json.data.delete_url,
    title: json.data.title,
  };
}
