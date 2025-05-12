
/**
 * Utility for loading Markdown content from files
 */

// Helper function to load markdown content
export async function loadMarkdownFile(fileName: string): Promise<string> {
  try {
    // In Vite, we can use the special import.meta.glob to load files
    const markdownFiles = import.meta.glob('/src/content/*.md', { as: 'raw' });
    
    // Check if the file exists in our collection
    const filePath = `/src/content/${fileName}.md`;
    const importFile = markdownFiles[filePath];
    
    if (!importFile) {
      console.error(`Markdown file not found: ${filePath}`);
      return '';
    }
    
    // Load the file content
    const content = await importFile();
    return content;
  } catch (error) {
    console.error('Error loading markdown file:', error);
    return '';
  }
}
