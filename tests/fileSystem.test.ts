import { FileSystemManager } from './fileSystem';

// Mock fetch for testing
global.fetch = jest.fn();

describe('FileSystemManager', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getAllNotes', () => {
    it('should fetch notes list from API', async () => {
      const mockNotes = [
        {
          id: 'test.md',
          title: 'Test Note',
          isFolder: false,
          filePath: 'test.md'
        }
      ];
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotes)
      });

      const notes = await FileSystemManager.getAllNotes();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/notes');
      expect(notes).toEqual(mockNotes);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(FileSystemManager.getAllNotes()).rejects.toThrow('Network error');
    });
  });

  describe('readNote', () => {
    it('should read note content from API', async () => {
      const mockContent = '# Test Note\n\nThis is a test note content.';
      const filePath = 'test.md';
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: mockContent })
      });

      const content = await FileSystemManager.readNote(filePath);
      
      expect(fetch).toHaveBeenCalledWith(`http://localhost:3001/api/notes/${encodeURIComponent(filePath)}`);
      expect(content).toBe(mockContent);
    });

    it('should handle note not found', async () => {
      const filePath = 'nonexistent.md';
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(FileSystemManager.readNote(filePath)).rejects.toThrow('Note not found');
    });
  });
});