// storage/MediaStorage.js
/**
 * @typedef {Object} UploadInput
 * @property {Buffer|Uint8Array|import('stream').Readable} data
 * @property {string} [filename]
 * @property {string} [contentType]
 * @property {string} [folder]
 *
 * @typedef {Object} UploadResult
 * @property {string} id          // provider-agnostic asset id (e.g., public_id or key)
 * @property {string} url         // public URL (or your CDN URL)
 * @property {number} [bytes]
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [contentType]
 */

/**
 * @interface MediaStorage
 * upload(input: UploadInput): Promise<UploadResult>
 * delete(id: string): Promise<void>
 * getUrl(id: string, opts?: { width?: number, height?: number, format?: string, signed?: boolean }): Promise<string>
 */
export {};