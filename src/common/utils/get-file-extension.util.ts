export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase();
}
