// 导入功能工具类
import { type Block } from '@blocknote/core';
import { parseMarkdownToBlocks } from './markdownToBlocks';
import { FileSystemManager } from './fileSystem';

export class ImportManager {
  // 用于存储进度提示框的引用
  private static progressAlert: HTMLElement | null = null;
  
  /**
   * 递归获取文件夹中的所有Markdown文件
   * @param dirHandle 文件夹句柄
   * @param basePath 基础路径
   * @returns 文件句柄数组
   */
  private static async getFilesFromDirectory(dirHandle: FileSystemDirectoryHandle, basePath: string): Promise<{handle: FileSystemFileHandle, path: string}[]> {
    const files: {handle: FileSystemFileHandle, path: string}[] = [];
    
    try {
      // 遍历文件夹中的所有条目
      // @ts-ignore TypeScript可能不识别values方法
      for await (const handle of dirHandle.values()) {
        // @ts-ignore TypeScript可能不识别name属性
        const name = handle.name;
        
        // 跳过以点(.)开头的文件/文件夹（隐藏项），但保留 .resources 目录用于图片处理
        if (name.startsWith('.')) {
          if (handle.kind === 'directory' && name === '.resources') {
            // 保留 .resources 目录，后续分支中进行递归处理
          } else {
            continue;
          }
        }
        
        if (handle.kind === 'file') {
          console.log(`检查文件: ${name}, 扩展名: ${name.substring(name.lastIndexOf('.'))}`);
          // 检查是否为Markdown文件或图片文件
          if (name.endsWith('.md') || name.endsWith('.txt') || 
              name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || 
              name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.svg')) {
            // 使用统一的正斜杠作为路径分隔符
            // 修复：确保basePath不以/开头，避免生成以/开头的路径
            const fullPath = basePath ? (basePath.startsWith('/') ? `${basePath.substring(1)}/${name}` : `${basePath}/${name}`) : name;
            console.log(`收集文件: ${name}, 完整路径: ${fullPath}, 文件类型: ${handle.kind}`);
            files.push({handle: handle as FileSystemFileHandle, path: fullPath});
          } else {
            console.log(`跳过文件: ${name}, 扩展名: ${name.substring(name.lastIndexOf('.'))}`);
          }
        } else if (handle.kind === 'directory') {
          console.log(`检查目录: ${name}`);
          // 特别处理.resources目录
          if (name === '.resources') {
            console.log('发现.resources目录，递归处理其中的文件');
            // 递归处理.resources目录
            const resourcesPath = basePath ? `${basePath}/.resources` : '.resources';
            const subFiles = await this.getFilesFromDirectory(handle as FileSystemDirectoryHandle, resourcesPath);
            files.push(...subFiles);
          } else {
            // 递归处理其他子文件夹
            // 使用统一的正斜杠作为路径分隔符
            // 修复：确保basePath不以/开头，避免生成以/开头的路径
            const nextBasePath = basePath ? (basePath.startsWith('/') ? `${basePath.substring(1)}/${name}` : `${basePath}/${name}`) : name;
            const subFiles = await this.getFilesFromDirectory(handle as FileSystemDirectoryHandle, nextBasePath);
            files.push(...subFiles);
          }
        } else if (handle.kind === 'directory') {
          console.log(`检查目录: ${name}`);
          // 递归处理子文件夹
          // 使用统一的正斜杠作为路径分隔符
          // 修复：确保basePath不以/开头，避免生成以/开头的路径
          const nextBasePath = basePath ? (basePath.startsWith('/') ? `${basePath.substring(1)}/${name}` : `${basePath}/${name}`) : name;
          const subFiles = await this.getFilesFromDirectory(handle as FileSystemDirectoryHandle, nextBasePath);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      console.error(`读取文件夹 ${basePath} 失败:`, error);
    }
    
    return files;
  }
  
  // 规范化路径为正斜杠
  private static normalizePosix(p: string): string {
    return p.replace(/\\/g, '/');
  }

  // 基于笔记所在目录解析相对路径（处理 ./ 和 ../）
  private static resolveRelative(baseDir: string, relPath: string): string {
    const base = baseDir ? baseDir.split('/').filter(Boolean) : [];
    const parts = relPath.split('/').filter(s => s.length > 0);
    const stack = [...base];
    for (const seg of parts) {
      if (seg === '.') continue;
      if (seg === '..') { if (stack.length) stack.pop(); continue; }
      stack.push(seg);
    }
    return stack.join('/');
  }

  // 新版图片路径替换：支持相对路径解析与 <img> 标签
  private static replaceImagePathsV2(content: string, uploadedImages: Record<string, string>, noteDirPath?: string): string {
    try {
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const imgTagRegex = /<img[^>]*src=[\"']([^\"']+)[\"'][^>]*>/gi;

      const replaceOne = (altText: string, rawPath: string, originalMatch: string): string => {
        const normalized = this.normalizePosix(rawPath);
        const tryKeys: string[] = [];

        // 原始路径（规范化）
        tryKeys.push(normalized);

        // 去掉前导 ./
        tryKeys.push(normalized.replace(/^(\.\/)+/, ''));

        // 基于笔记所在目录解析 ../ 等相对路径
        if (noteDirPath) {
          const resolved = this.resolveRelative(noteDirPath, normalized);
          tryKeys.push(resolved);
        }

        // .resources/images 特殊处理：如果路径中包含该段，尝试按文件名匹配
        const fileName = normalized.split('/').pop();
        const containsResources = normalized.includes('.resources/images/');

        for (const key of tryKeys) {
          if (uploadedImages[key]) {
            const url = uploadedImages[key];
            return `![${altText}](${url})`;
          }
        }

        if (containsResources && fileName) {
          const matchKey = Object.keys(uploadedImages)
            .find(k => this.normalizePosix(k).endsWith(`/.resources/images/${fileName}`) || this.normalizePosix(k).endsWith(`/images/${fileName}`));
          if (matchKey) {
            const url = uploadedImages[matchKey];
            return `![${altText}](${url})`;
          }
        }

        return originalMatch;
      };

      // 先替换 Markdown 图片语法
      let replaced = content.replace(imageRegex, (match, altText, imagePath) => replaceOne(altText, imagePath, match));

      // 再替换 HTML <img> 标签中的 src
      replaced = replaced.replace(imgTagRegex, (match, src) => {
        const replacedMarkdown = replaceOne('', src, match);
        const urlMatch = replacedMarkdown.match(/\(([^)]+)\)/);
        const url = urlMatch ? urlMatch[1] : src;
        return match.replace(src, url);
      });

      return replaced;
    } catch {
      return content;
    }
  }
  /**
   * 递归获取文件夹中的所有文件夹（包括空文件夹）
   * @param dirHandle 文件夹句柄
   * @param basePath 基础路径
   * @returns 文件夹路径数组
   */
  private static async getFoldersFromDirectory(dirHandle: FileSystemDirectoryHandle, basePath: string): Promise<string[]> {
    const folders: string[] = [];
    
    try {
      // 遍历文件夹中的所有条目
      // @ts-ignore TypeScript可能不识别values方法
      for await (const handle of dirHandle.values()) {
        // @ts-ignore TypeScript可能不识别name属性
        const name = handle.name;
        
        // 跳过以点(.)开头的文件夹（隐藏文件夹）
        if (name.startsWith('.')) {
          continue;
        }
        
        if (handle.kind === 'directory') {
          // 添加当前文件夹路径
          // 修复：确保basePath不以/开头，避免生成以/开头的路径
          const folderPath = basePath ? (basePath.startsWith('/') ? `${basePath.substring(1)}/${name}` : `${basePath}/${name}`) : name;
          folders.push(folderPath);
          
          // 递归处理子文件夹
          const subFolders = await this.getFoldersFromDirectory(handle as FileSystemDirectoryHandle, folderPath);
          folders.push(...subFolders);
        }
      }
    } catch (error) {
      console.error(`读取文件夹 ${basePath} 失败:`, error);
    }
    
    return folders;
  }
  
  /**
   * 检查是否存在同名笔记
   * @param fileName 文件名（包含路径）
   * @param existingNotes 现有的笔记列表
   * @returns 返回重复笔记的信息，如果没有重复则返回null
   */
  private static checkExistingNote(fileName: string, existingNotes: any[]): { note: any; relativePath: string; fullPath: string } | null {
    // 生成对应的文件路径（统一为 POSIX 格式并确保 .json 扩展名）
    const noteFilePath = (fileName.endsWith('.json') ? fileName : `${fileName}.json`).replace(/\\/g, '/');

    console.log('Checking for existing note (exact path match):', { fileName, noteFilePath, existingNotesCount: existingNotes.length });

    // 直接用完整路径进行匹配，避免误删/误判
    for (const note of existingNotes) {
      if (!note.filePath) continue;
      const existingFullPath = String(note.filePath).replace(/\\/g, '/');

      console.log('Comparing exact paths:', {
        importFullPath: noteFilePath,
        existingFullPath,
      });

      if (existingFullPath === noteFilePath) {
        console.log('Found existing note by exact path:', note);
        return { note, relativePath: noteFilePath, fullPath: existingFullPath };
      }
    }

    console.log('No existing note found for exact path:', fileName);
    return null;
  }
  
  /**
   * 显示覆盖确认对话框
   * @param fileName 文件名
   * @param fullPath 完整路径
   * @returns 用户是否选择覆盖
   */
  private static async showOverwriteConfirmation(fileName: string, fullPath: string): Promise<boolean> {
    console.log('Showing overwrite confirmation for:', fileName);
    return new Promise((resolve) => {
      // 更新进度提示为确认对话框
      this.updateProgressAlert(
        '笔记已存在', 
        `笔记 "${fileName}" 已存在，完整路径: ${fullPath}\n是否覆盖？`, 
        'warning'
      );
      
      // 添加确认和取消按钮
      if (this.progressAlert) {
        // 清除现有内容
        while (this.progressAlert.children.length > 2) { // 保留标题和消息元素
          this.progressAlert.removeChild(this.progressAlert.lastChild!);
        }
        
        // 添加按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 15px;
        `;
        
        // 确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '覆盖';
        confirmButton.style.cssText = `
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        confirmButton.onclick = () => {
          console.log('User chose to overwrite:', fileName);
          this.hideProgressAlert();
          resolve(true);
        };
        
        // 取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '跳过';
        cancelButton.style.cssText = `
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        cancelButton.onclick = () => {
          console.log('User chose to skip:', fileName);
          this.hideProgressAlert();
          resolve(false);
        };
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        this.progressAlert.appendChild(buttonContainer);
      } else {
        console.log('Progress alert not found, resolving with false');
        resolve(false); // 如果没有进度提示框，直接返回false
      }
    });
  }
  
  /**
   * 导入用户选择的Markdown笔记
   * @param dispatch Redux dispatch函数
   * @param editor BlockNote编辑器实例
   * @param existingNotes 现有的笔记列表（可选）
   */
  static async importMarkdownNotes(dispatch: any, editor: any, existingNotes: any[] = []): Promise<string | null> {
    console.log('Starting import with existing notes count:', existingNotes.length);
    let lastImportedNotePath: string | null = null;
    
    try {
      // 请求用户选择要导入的文件夹
      let directoryHandles: FileSystemDirectoryHandle[] = [];
      
      try {
        // @ts-ignore TypeScript可能不识别showDirectoryPicker
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read'
        });
        directoryHandles = Array.isArray(dirHandle) ? dirHandle : [dirHandle];
      } catch (error) {
        console.warn('用户取消了文件夹选择或浏览器不支持showDirectoryPicker');
        this.showProgressAlert('导入失败', '请选择包含Markdown文件的文件夹。注意：此功能需要现代浏览器支持（如Chrome 86+）。', 'error');
        setTimeout(() => this.hideProgressAlert(), 3000);
        return null;
      }

      // 收集所有要处理的文件
      const allFileHandles: {handle: FileSystemFileHandle, path: string}[] = [];
      
      // 收集所有文件夹（包括空文件夹）
      const allFolderPaths: string[] = [];
      
      console.log('开始收集文件，目录句柄数量:', directoryHandles.length);
      
      // 添加文件夹中的文件和文件夹，保留完整的路径结构
      for (const dirHandle of directoryHandles) {
        // @ts-ignore TypeScript可能不识别name属性
        const rootDirName = dirHandle.name;
        console.log('处理目录:', rootDirName);
        // 为了保持与之前行为的一致性，我们不将根文件夹名称包含在路径中
        const filesInDir = await this.getFilesFromDirectory(dirHandle, ""); // 使用空字符串作为基础路径
        console.log('从目录收集到的文件:', filesInDir);
        allFileHandles.push(...filesInDir);
        
        // 收集文件夹结构
        const foldersInDir = await this.getFoldersFromDirectory(dirHandle, ""); // 使用空字符串作为基础路径
        console.log('从目录收集到的文件夹:', foldersInDir);
        allFolderPaths.push(...foldersInDir);
      }
      
      console.log('Collected file handles:', allFileHandles);
      console.log('Collected folder paths:', allFolderPaths);
      
      // 分离Markdown文件和图片文件
      const markdownFiles = allFileHandles.filter(file => 
        file.path.endsWith('.md') || file.path.endsWith('.txt')
      );
      
      const imageFiles = allFileHandles.filter(file => 
        file.path.endsWith('.png') || file.path.endsWith('.jpg') || file.path.endsWith('.jpeg') || 
        file.path.endsWith('.gif') || file.path.endsWith('.webp') || file.path.endsWith('.svg')
      );
      
      console.log('All file handles:', allFileHandles.map(f => ({path: f.path, name: f.handle.name})));  // 添加更多调试信息
      console.log('Found markdown files:', markdownFiles.map(f => f.path));
      console.log('Found image files:', imageFiles.map(f => f.path));
      
      // 详细检查每个文件
      for (const file of allFileHandles) {
        console.log('详细检查文件:', file.path, '扩展名:', file.path.substring(file.path.lastIndexOf('.')));
        if (file.path.endsWith('.png') || file.path.endsWith('.jpg') || file.path.endsWith('.jpeg') || 
            file.path.endsWith('.gif') || file.path.endsWith('.webp') || file.path.endsWith('.svg')) {
          console.log('识别为图片文件:', file.path);
        } else if (file.path.endsWith('.md') || file.path.endsWith('.txt')) {
          console.log('识别为Markdown文件:', file.path);
        } else {
          console.log('未识别的文件类型:', file.path);
        }
      }
      
      // 验证图片文件是否真的存在
      for (const imageFile of imageFiles) {
        try {
          const file = await imageFile.handle.getFile();
          console.log(`Image file ${imageFile.path} size:`, file.size);
        } catch (error) {
          console.error(`Failed to get image file ${imageFile.path}:`, error);
        }
      }
      
      // 如果没有找到任何Markdown文件和文件夹，则报错
      if (markdownFiles.length === 0 && allFolderPaths.length === 0) {
        this.showProgressAlert('导入失败', '未找到任何Markdown文件或文件夹。请选择包含.md或.txt文件的文件夹。', 'error');
        setTimeout(() => this.hideProgressAlert(), 3000);
        return null;
      }
      
      // 显示导入进度提示
      this.showProgressAlert('正在导入', `正在导入 ${markdownFiles.length} 个笔记, ${imageFiles.length} 个图片和 ${allFolderPaths.length} 个文件夹...`, 'info');
      
      // 按深度排序文件夹路径，确保父级文件夹先创建
      const sortedFolderPaths = [...allFolderPaths].sort((a, b) => {
        const aDepth = a.split('/').length;
        const bDepth = b.split('/').length;
        return aDepth - bDepth;
      });
      
      console.log('Sorted folder paths:', sortedFolderPaths);
      
      // 创建文件夹（包括空文件夹），并等待每个文件夹创建完成
      for (const folderPath of sortedFolderPaths) {
        // 只有当folderPath不为空时才创建文件夹
        if (folderPath) {
          console.log('Creating folder with path:', folderPath);
          // 创建文件夹并等待其在状态中建立完成
          await new Promise((resolve) => {
            dispatch({
              type: 'ADD_FOLDER',
              payload: {
                title: folderPath, // 使用完整的文件夹路径
              },
            });
            
            // 等待文件夹在状态中建立完成
            setTimeout(() => {
              resolve(null);
            }, 50);
          });
        }
      }
      
      // 等待一段时间确保所有文件夹创建完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 首先上传所有图片文件
      const uploadedImages: Record<string, string> = {}; // 存储原图片路径到新URL的映射
      
      console.log(`准备上传 ${imageFiles.length} 个图片文件`);
      
      for (let i = 0; i < imageFiles.length; i++) {
        const {handle: fileHandle, path} = imageFiles[i];
        const file = await fileHandle.getFile();
        
        console.log(`Uploading image ${i + 1}/${imageFiles.length}:`, path, `文件大小: ${file.size} bytes`);
        
        // 更新进度提示
        this.updateProgressAlert(`正在导入图片 (${i + 1}/${imageFiles.length})`, `正在上传: ${path}`, 'info');
        
        try {
          // 上传图片到服务器
          const imageUrl = await this.uploadImageToServer(file);
          uploadedImages[path] = imageUrl;
          console.log(`图片上传成功: ${path} -> ${imageUrl}`);
        } catch (error) {
          console.error(`图片上传失败 ${path}:`, error);
          this.updateProgressAlert('图片上传出错', `图片上传失败 ${path}: ${(error as Error).message}`, 'error');
        }
      }
      
      console.log('Uploaded images mapping:', uploadedImages);
      
      // 处理每个Markdown文件，逐个导入并实时更新目录树
      for (let i = 0; i < markdownFiles.length; i++) {
        const {handle: fileHandle, path} = markdownFiles[i];
        const file = await fileHandle.getFile();
        // 使用路径作为文件名，支持文件夹结构
        // 将路径分隔符统一为正斜杠，并移除扩展名
        const fileName = path.replace(/\\/g, '/').replace(/\.[^/.]+$/, "");
        
        console.log(`Processing file ${i + 1}/${markdownFiles.length}:`, fileName);
        
        // 更新进度提示
        this.updateProgressAlert(`正在导入笔记 (${i + 1}/${markdownFiles.length})`, `正在处理: ${fileName}`, 'info');
        
        console.log('Checking for duplicates:', { fileName, existingNotesCount: existingNotes.length });
        
        // 检查是否已存在同名笔记
        const existingNoteInfo = this.checkExistingNote(fileName, existingNotes);
        if (existingNoteInfo) {
          console.log('Duplicate found, showing overwrite confirmation for:', fileName);
          // 显示覆盖确认提示，传入完整路径
          const shouldOverwrite = await this.showOverwriteConfirmation(
            fileName.split('/').pop() || fileName,
            existingNoteInfo.fullPath
          );
          console.log('Overwrite confirmation result:', shouldOverwrite);
          if (!shouldOverwrite) {
            console.log('User chose to skip duplicate:', fileName);
            continue; // 跳过此文件
          } else {
            console.log('User chose to overwrite duplicate:', fileName);
            // 如果选择覆盖，先删除现有笔记
            console.log('Deleting existing note with ID:', existingNoteInfo.note.id);
            dispatch({
              type: 'DELETE_NOTE',
              payload: existingNoteInfo.note.id
            });
            
            // 等待删除完成
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          console.log('No duplicate found for:', fileName);
        }
        
        try {
          // 读取文件内容
          let content = await file.text();
          
          console.log('Original content before image replacement:', content);
          console.log('Uploaded images mapping for replacement:', uploadedImages);
          
          // 查找Markdown中引用的.resources/images路径的图片并添加到上传映射
          const updatedUploadedImages = { ...uploadedImages };
          const imageRegex = /!\[([^\]]*)\]\((\.[^)]*\.resources\/images\/[^)]+)\)/g;
          let match;
          while ((match = imageRegex.exec(content)) !== null) {
            const imagePath = match[2];
            console.log('Found .resources/images path in markdown:', imagePath);
            
            // 从allFileHandles中查找对应的图片文件
            const fileName = imagePath.split('/').pop();
            if (fileName) {
              const imageFile = allFileHandles.find(f => f.path.endsWith(fileName) && 
                (f.path.includes('.resources/images/') || f.path.includes('.resources\\images\\')));
              
              if (imageFile) {
                console.log('Found image file in collected files:', imageFile.path);
                // 上传图片
                try {
                  const imageFileContent = await imageFile.handle.getFile();
                  const imageUrl = await this.uploadImageToServer(imageFileContent);
                  updatedUploadedImages[imagePath] = imageUrl;
                  console.log(`Uploaded .resources image: ${imagePath} -> ${imageUrl}`);
                } catch (uploadError) {
                  console.error(`Failed to upload .resources image ${imagePath}:`, uploadError);
                }
              } else {
                console.log('Image file not found in collected files for path:', imagePath);
                // 列出所有收集到的文件以便调试
                console.log('All collected files:', allFileHandles.map(f => f.path));
              }
            }
          }
          
          // 替换Markdown中的图片路径为上传后的URL（基于笔记所在目录解析相对路径）
          const noteDirPath = path.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
          content = this.replaceImagePathsV2(content, updatedUploadedImages, noteDirPath);
          
          console.log('Content after image replacement:', content);
          
          // 解析Markdown内容为BlockNote格式
          let blocks: Block[] = [];
          try {
            // 使用我们自定义的无损转换器
            blocks = parseMarkdownToBlocks(content) as Block[];
            console.log('成功转换Markdown为BlockNote格式:', blocks)
          } catch (parseError) {
            console.warn(`解析Markdown内容失败，使用空内容:`, parseError);
            // 如果解析失败，创建一个包含原始Markdown内容的段落块
            blocks = [{
              id: Date.now().toString(),
              type: "paragraph",
              props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left"
              },
              content: [{
                type: "text",
                text: content,
                styles: {}
              }],
              children: []
            }] as Block[];
          }
          
          // 创建新笔记
          // 只使用文件名作为标题，而不是完整路径
          const noteTitle = fileName.split('/').pop() || fileName;
          // 确保文件路径以 .json 结尾
          const noteFilePath = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
          console.log('Creating note with:', { noteTitle, noteFilePath });
          
          // 创建笔记
          console.log('Dispatching ADD_NOTE_WITH_FILE action');
          dispatch({
            type: 'ADD_NOTE_WITH_FILE',
            payload: {
              title: noteTitle,  // 使用文件名作为标题
              content: blocks,
              isFolder: false,
              filePath: noteFilePath  // 使用正确的文件路径
            }
          });
          console.log('ADD_NOTE_WITH_FILE action dispatched');
          
          // 等待状态更新完成
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 如果是覆盖操作，导入完成后定位到该笔记
          if (existingNoteInfo) {
            console.log('This is an overwrite operation, waiting for note to be created');
            // 等待更长时间确保笔记创建完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 直接通过ID选择笔记，而不是通过路径
            console.log('Selecting overwritten note by ID');
            // 由于我们无法直接获取新创建笔记的ID，我们需要通过路径查找
            setTimeout(() => {
              dispatch({
                type: 'SELECT_NOTE_AND_EXPAND_BY_PATH',
                payload: noteFilePath
              });
              console.log('SELECT_NOTE_AND_EXPAND_BY_PATH dispatched');
            }, 50);
          }
          
          console.log(`成功导入笔记: ${fileName}`);
        } catch (error) {
          console.error(`导入笔记 ${fileName} 失败:`, error);
          this.updateProgressAlert('导入出错', `导入笔记 ${fileName} 失败: ${(error as Error).message}`, 'error');
          // 继续处理其他文件
        }
      }
      
      // 显示完成提示
      this.updateProgressAlert('导入完成', `成功导入 ${markdownFiles.length} 个笔记, ${imageFiles.length} 个图片和 ${allFolderPaths.length} 个文件夹！`, 'success');
      
      // 强制刷新目录树
      // 等待一段时间确保所有操作完成，然后触发状态更新
      setTimeout(() => {
        // 触发一个空的操作来强制React重新渲染
        dispatch({ type: 'FORCE_UPDATE' });
      }, 100);
      
      // 再次触发状态更新，确保目录树正确构建
      setTimeout(() => {
        dispatch({ type: 'FORCE_UPDATE' });
      }, 500);
      
      // 清除可能存在的按钮
      if (this.progressAlert) {
        // 清除除了标题和消息之外的所有元素
        while (this.progressAlert.children.length > 2) {
          this.progressAlert.removeChild(this.progressAlert.lastChild!);
        }
      }
      
      // 3秒后自动关闭提示
      setTimeout(() => {
        this.hideProgressAlert();
      }, 3000);
      
      // 返回最后一个导入的笔记路径（如果是覆盖操作）
      return lastImportedNotePath;
    } catch (error) {
      console.error('导入笔记失败:', error);
      this.updateProgressAlert('导入失败', '导入笔记失败: ' + (error as Error).message, 'error');
      setTimeout(() => {
        this.hideProgressAlert();
      }, 3000);
      throw error;
    }
  }
  
  /**
   * 上传图片到服务器
   * @param file 图片文件
   * @returns 上传后的图片URL
   */
  private static async uploadImageToServer(file: File): Promise<string> {
    try {
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('image', file);

      // 发送上传请求
      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 正确处理服务器响应格式 - 返回url字段
      const imageUrl = data.success ? data.url : (data.url || data);
      
      console.log('图片上传成功，返回URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }
  
  /**
   * 替换Markdown中的图片路径为上传后的URL
   * @param content Markdown内容
   * @param uploadedImages 上传的图片映射
   * @returns 替换后的Markdown内容
   */
  private static replaceImagePaths(content: string, uploadedImages: Record<string, string>): string {
    try {
      console.log('开始替换图片路径，上传的图片映射:', uploadedImages);
      // 查找Markdown中的图片引用
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      
      return content.replace(imageRegex, (match, altText, imagePath) => {
        console.log('Processing image path:', imagePath);
        
        // 特别处理.resources/images路径的图片
        if (imagePath.startsWith('./.resources/images/') || imagePath.startsWith('.resources/images/')) {
          const fileName = imagePath.split('/').pop();
          console.log('Resources image file name:', fileName);
          // 在上传的图片中查找匹配的文件名
          for (const [originalPath, uploadedUrl] of Object.entries(uploadedImages)) {
            const originalFileName = originalPath.split('/').pop();
            if (originalFileName === fileName) {
              console.log(`替换资源图片路径: ${imagePath} -> ${uploadedUrl}`);
              return `![${altText}](${uploadedUrl})`;
            }
          }
          console.log(`未找到匹配的资源图片: ${fileName}，可用的图片:`, Object.keys(uploadedImages).map(p => p.split('/').pop()));
        }
        
        // 处理相对路径图片
        if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
          // 移除相对路径前缀
          const cleanPath = imagePath.replace(/^(\.\/|\.\.\/)+/, '');
          console.log('Cleaned path:', cleanPath);
          // 查找映射中的图片
          if (uploadedImages[cleanPath]) {
            console.log(`替换图片路径: ${imagePath} -> ${uploadedImages[cleanPath]}`);
            return `![${altText}](${uploadedImages[cleanPath]})`;
          } else {
            console.log(`未找到匹配的图片: ${cleanPath}，可用的图片:`, Object.keys(uploadedImages));
          }
        } else if (!imagePath.startsWith('http')) {
          // 处理相对路径图片（没有前缀）
          if (uploadedImages[imagePath]) {
            console.log(`替换图片路径: ${imagePath} -> ${uploadedImages[imagePath]}`);
            return `![${altText}](${uploadedImages[imagePath]})`;
          } else {
            console.log(`未找到匹配的图片: ${imagePath}，可用的图片:`, Object.keys(uploadedImages));
          }
          
          // 处理可能的其他相对路径格式
          const normalizedPath = imagePath.replace(/\\/g, '/');
          console.log('Normalized path:', normalizedPath);
          if (uploadedImages[normalizedPath]) {
            console.log(`替换图片路径: ${imagePath} -> ${uploadedImages[normalizedPath]}`);
            return `![${altText}](${uploadedImages[normalizedPath]})`;
          } else if (normalizedPath !== imagePath) {
            console.log(`未找到匹配的图片: ${normalizedPath}，可用的图片:`, Object.keys(uploadedImages));
          }
        }
        
        // 如果没有找到映射或已经是绝对路径，保持原样
        console.log('No match found for image path, keeping original:', imagePath);
        return match;
      });
    } catch (error) {
      console.error('替换图片路径时出错:', error);
      return content;
    }
  }
  
  /**
   * 处理笔记中的图片
   * @param content 笔记内容
   * @param dispatch Redux dispatch函数
   */
  private static async processNoteImages(content: string, dispatch: any): Promise<void> {
    try {
      // 查找Markdown中的图片引用
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        const altText = match[1];
        const imagePath = match[2];
        
        // 如果是相对路径，则提示用户需要手动处理
        if (imagePath.startsWith('./') || imagePath.startsWith('../') || !imagePath.startsWith('http')) {
          console.warn(`检测到相对路径图片，请手动处理: ${imagePath}`);
          // 在实际应用中，可能需要更复杂的逻辑来处理相对路径图片
        }
      }
    } catch (error) {
      console.error('处理笔记图片时出错:', error);
    }
  }
  
  /**
   * 显示进度提示框
   * @param title 标题
   * @param message 消息内容
   * @param type 提示类型 (success, error, info, warning)
   */
  private static showProgressAlert(title: string, message: string, type: string): void {
    // 创建或更新提示框元素
    let alertContainer = document.getElementById('export-alert-container');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'export-alert-container';
      alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
      `;
      document.body.appendChild(alertContainer);
    }
    
    // 创建提示框内容
    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(0);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 1;
    `;
    
    // 添加标题
    const titleElement = document.createElement('div');
    titleElement.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    `;
    titleElement.textContent = title;
    alertElement.appendChild(titleElement);
    
    // 添加消息内容
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
      white-space: pre-wrap;
      line-height: 1.5;
    `;
    messageElement.textContent = message;
    alertElement.appendChild(messageElement);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    `;
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
      alertElement.style.transform = 'translateX(100%)';
      alertElement.style.opacity = '0';
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 300);
    };
    alertElement.appendChild(closeButton);
    
    // 保存引用以便更新
    this.progressAlert = alertElement;
    
    // 添加到容器
    alertContainer.appendChild(alertElement);
  }
  
  /**
   * 更新进度提示框内容
   * @param title 标题
   * @param message 消息内容
   * @param type 提示类型
   */
  private static updateProgressAlert(title: string, message: string, type: string): void {
    if (this.progressAlert) {
      // 更新样式
      this.progressAlert.style.cssText = `
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(0);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 1;
      `;
      
      // 更新标题和消息
      const titleElement = this.progressAlert.querySelector('div:first-child');
      const messageElement = this.progressAlert.querySelector('div:nth-child(2)');
      
      if (titleElement) {
        titleElement.textContent = title;
        (titleElement as HTMLElement).style.cssText = `
          font-weight: bold;
          margin-bottom: 8px;
          color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
        `;
      }
      
      if (messageElement) {
        messageElement.textContent = message;
        (messageElement as HTMLElement).style.cssText = `
          color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
          white-space: pre-wrap;
          line-height: 1.5;
        `;
      }
    } else {
      // 如果还没有创建提示框，则创建一个
      this.showProgressAlert(title, message, type);
    }
  }
  
  /**
   * 隐藏进度提示框
   */
  private static hideProgressAlert(): void {
    if (this.progressAlert) {
      // 淡出效果
      this.progressAlert.style.transform = 'translateX(100%)';
      this.progressAlert.style.opacity = '0';
      setTimeout(() => {
        if (this.progressAlert && this.progressAlert.parentNode) {
          this.progressAlert.parentNode.removeChild(this.progressAlert);
          this.progressAlert = null;
        }
      }, 300);
    }
  }
}
