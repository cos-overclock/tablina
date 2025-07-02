export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    // Parse the Rust debug format and convert to readable date
    const timestamp = Date.parse(dateString);
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toLocaleDateString();
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export function getFileIcon(filename: string, isDirectory: boolean): string {
  if (isDirectory) {
    return '📁';
  }
  
  const extension = getFileExtension(filename);
  
  const iconMap: Record<string, string> = {
    // Documents
    txt: '📄',
    md: '📝',
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    
    // Code
    js: '📜',
    ts: '📜',
    html: '🌐',
    css: '🎨',
    json: '📋',
    xml: '📋',
    
    // Archives
    zip: '📦',
    rar: '📦',
    tar: '📦',
    gz: '📦',
    
    // Audio/Video
    mp3: '🎵',
    wav: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
  };
  
  return iconMap[extension] || '📄';
}