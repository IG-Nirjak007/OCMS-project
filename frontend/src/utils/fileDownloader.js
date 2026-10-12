import client from '../api/client';

/**
 * Downloads a file from an authenticated endpoint and saves it to disk.
 *
 * @param {string} endpoint - API relative path (e.g. `/materials/${id}/download`)
 * @param {string} fallbackFilename - default file name if server does not provide one
 */
export const downloadAuthenticatedFile = async (endpoint, fallbackFilename = 'downloaded_file') => {
  try {
    const response = await client.get(endpoint, { responseType: 'blob' });
    const contentDisposition = response.headers['content-disposition'];
    let filename = fallbackFilename;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('File download failed:', err);
    alert('Failed to download file. Please try again.');
  }
};
