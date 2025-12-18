/**
 * Pollinations AI Image Generation Utility
 * Free AI image generation without API keys
 * https://pollinations.ai
 */

export interface PollinationsOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
}

/**
 * Generate an image URL using Pollinations AI
 * @param prompt - The text prompt describing the image
 * @param options - Optional parameters for image generation
 * @returns The URL to the generated image
 */
export const generatePollinationsImageUrl = (
  prompt: string,
  options: PollinationsOptions = {}
): string => {
  const {
    width = 512,
    height = 512,
    seed,
    nologo = true,
  } = options;

  // Safely encode the prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);

  // Build URL with parameters
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}`;

  if (nologo) {
    url += '&nologo=true';
  }

  if (seed !== undefined) {
    url += `&seed=${seed}`;
  }

  return url;
};

/**
 * Generate and fetch an image as a blob
 * @param prompt - The text prompt describing the image
 * @param options - Optional parameters for image generation
 * @returns Promise resolving to the image blob and URL
 */
export const generatePollinationsImage = async (
  prompt: string,
  options: PollinationsOptions = {}
): Promise<{ imageUrl: string; blob?: Blob }> => {
  const url = generatePollinationsImageUrl(prompt, options);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return { imageUrl: url, blob };
  } catch (error) {
    console.error('Pollinations image generation error:', error);
    throw error;
  }
};

/**
 * Download an image from URL
 * @param imageUrl - The URL of the image to download
 * @param filename - The filename for the downloaded file
 */
export const downloadImage = async (imageUrl: string, filename: string = 'kris-generated-image.png') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
