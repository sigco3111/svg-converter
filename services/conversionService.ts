
/**
 * Converts an SVG string to a PNG data URL.
 * @param svgContent The string content of the SVG file.
 * @param width The desired width of the output PNG.
 * @param height The desired height of the output PNG.
 * @returns A promise that resolves with the PNG data URL.
 */
export const convertSvgToPng = (svgContent: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return reject(new Error('캔버스 컨텍스트를 가져올 수 없습니다.'));
    }

    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const pngDataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(img.src); // Clean up the object URL
      resolve(pngDataUrl);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(img.src); // Clean up on error too
      reject(new Error(`SVG를 이미지 객체로 불러오는데 실패했습니다. 오류: ${e}`));
    };
    
    // Use btoa for robust handling of special characters in SVG
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  });
};

/**
 * Converts a PNG data URL to an SVG data URL by embedding the PNG.
 * This does not perform tracing; it wraps the raster image in an SVG element.
 * @param pngDataUrl The data URL of the PNG image.
 * @param width The width of the image.
 * @param height The height of the image.
 * @returns A promise that resolves with the SVG data URL.
 */
export const convertPngToSvg = (pngDataUrl: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve) => {
    const svgString = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <title>변환된 PNG</title>
        <desc>이 SVG는 PNG 이미지를 포함하여 생성되었습니다. 완전한 벡터 그래픽이 아닙니다.</desc>
        <image href="${pngDataUrl}" width="${width}" height="${height}" />
      </svg>
    `.trim();

    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    resolve(svgDataUrl);
  });
};