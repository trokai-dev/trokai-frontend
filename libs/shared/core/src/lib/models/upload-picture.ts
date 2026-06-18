export interface UploadPictureItem {
  /** Resized/cropped JPEG blob. null for unmodified server images. */
  blob: Blob | null;
  /** Image _id on the server. null for new local images. Used in pictures_map on PATCH. */
  serverId: string | null;
  /** Full https URL of the .lg (large) server image. Used for blob-fetching on crop/duplicate. */
  serverUrl: string | null;
  /** Full https URL of the .sm (small) server image. Used for display in the picker. */
  smUrl: string | null;
}
