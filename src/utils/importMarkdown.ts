// 导入功能工具类
import { type Block } from '@blocknote/core';
import { parseMarkdownToBlocks } from './markdownToBlocks';
import { ProgressAlert } from './progressAlert';
import { v4 as uuidv4 } from 'uuid';

export class ImportManager {
  // 使用ProgressAlert实例
  private static progressAlert = ProgressAlert.getInstance();
  
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
          // 检查是否为Markdown文件或图片文件
          if (name.endsWith('.md') || name.endsWith('.txt') ||
              name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') ||
              name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.svg')) {
            // 使用统一的正斜杠作为路径分隔符
            // 修复：确保basePath不以/开头，避免生成以/开头的路径
            const fullPath = basePath ? (basePath.startsWith('/') ? `${basePath.substring(1)}/${name}` : `${basePath}/${name}`) : name;
            files.push({handle: handle as FileSystemFileHandle, path: fullPath});
          }
        } else if (handle.kind === 'directory') {
          
          // 特别处理.resources目录
          if (name === '.resources') {
            
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
   * 检查是否存在同名笔记（基于文件夹路径+笔记名，忽略扩展名）
   * @param fileName 文件名（包含路径）
   * @param existingNotes 现有的笔记列表
   * @returns 返回重复笔记的信息，如果没有重复则返回null
   */
  private static checkExistingNote(fileName: string, existingNotes: any[]): { note: any; relativePath: string; fullPath: string } | null {
    // 统一路径分隔符为正斜杠
    const normalizedFileName = fileName.replace(/\\/g, '/');

    // 移除所有扩展名，只保留基础文件名
    const importBasePath = normalizedFileName.replace(/\.[^.]*$/, '');

    // 递归查找基础路径匹配的文件
    const result = this.findNoteByBasePath(existingNotes, importBasePath);
    if (result) {
      return result;
    }

    return null;
  }

  /**
   * 递归查找匹配基础路径的笔记
   */
  private static findNoteByBasePath(notes: any[], importBasePath: string): { note: any; relativePath: string; fullPath: string } | null {
    for (const note of notes) {
      // 递归检查子节点
      if (note.children && note.children.length > 0) {
        const result = this.findNoteByBasePath(note.children, importBasePath);
        if (result) {
          return result;
        }
      }

      // 跳过文件夹和没有路径的笔记
      if (!note.filePath || note.isFolder) continue;

      // 统一路径分隔符
      const existingPath = String(note.filePath).replace(/\\/g, '/');

      // 移除现有文件的扩展名
      const existingBasePath = existingPath.replace(/\.[^.]*$/, '');

      // 基础路径匹配就是重复
      if (importBasePath === existingBasePath) {
        return { note, relativePath: importBasePath + '.json', fullPath: existingPath };
      }
    }
    return null;
  }

  /**
   * 递归打印所有笔记结构
   */
  private static printAllNotes(notes: any[], indent: number): void {
    notes.forEach(note => {
      if (note.children && note.children.length > 0) {
        this.printAllNotes(note.children, indent + 1);
      }
    });
  }

  /**
   * 确认是否覆盖重复文件
   * @param fileName 文件名
   * @param fullPath 完整路径
   * @param dispatch Redux dispatch函数
   * @returns 用户是否选择覆盖
   */
  private static async confirmOverwriteDuplicate(fullPath: string, dispatch: any): Promise<boolean> {
    

    // 先定位到目录树
    dispatch({
      type: 'SELECT_NOTE_AND_EXPAND_BY_PATH',
      payload: fullPath
    });

    // 等待目录树定位完成
    await new Promise(resolve => setTimeout(resolve, 50));

    return new Promise((resolve) => {
      // 显示确认弹窗
      this.progressAlert.update(
        '发现重复文件',
        `检测到重复文件：${fullPath}\n是否覆盖现有文件？`,
        'warning'
      );

      // 添加按钮
      this.progressAlert.addButtons([
        {
          text: '跳过',
          style: 'secondary',
          onClick: () => {
            this.progressAlert.hide();
            resolve(false);
          }
        },
        {
          text: '覆盖',
          style: 'primary',
          onClick: () => {
            this.progressAlert.hide();
            resolve(true);
          }
        }
      ]);
    });
  }
  
  /**
   * 导入用户选择的Markdown笔记
   * @param dispatch Redux dispatch函数
   * @param editor BlockNote编辑器实例
   * @param existingNotes 现有的笔记列表（可选）
   */
  static async importMarkdownNotes(dispatch: any, existingNotes: any[] = []): Promise<string | null> {
    
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
        this.progressAlert.show('导入失败', '请选择包含Markdown文件的文件夹。注意：此功能需要现代浏览器支持（如Chrome 86+）。', 'error');
        setTimeout(() => this.progressAlert.hide(), 3000);
        return null;
      }

      // 收集所有要处理的文件
      const allFileHandles: {handle: FileSystemFileHandle, path: string}[] = [];
      
      // 收集所有文件夹（包括空文件夹）
      const allFolderPaths: string[] = [];
      
      
      
      // 添加文件夹中的文件和文件夹，保留完整的路径结构
      for (const dirHandle of directoryHandles) {
        // @ts-ignore TypeScript可能不识别name属性
        const rootDirName = dirHandle.name;
        
        // 为了保持与之前行为的一致性，我们不将根文件夹名称包含在路径中
        const filesInDir = await this.getFilesFromDirectory(dirHandle, ""); // 使用空字符串作为基础路径
        
        allFileHandles.push(...filesInDir);
        
        // 收集文件夹结构
        const foldersInDir = await this.getFoldersFromDirectory(dirHandle, ""); // 使用空字符串作为基础路径
        
        allFolderPaths.push(...foldersInDir);
      }
      
      
      
      
      // 分离Markdown文件和图片文件
      const markdownFiles = allFileHandles.filter(file => 
        file.path.endsWith('.md') || file.path.endsWith('.txt')
      );
      
      const imageFiles = allFileHandles.filter(file => 
        file.path.endsWith('.png') || file.path.endsWith('.jpg') || file.path.endsWith('.jpeg') || 
        file.path.endsWith('.gif') || file.path.endsWith('.webp') || file.path.endsWith('.svg')
      );
      
      
      
      
      
      // 详细检查每个文件
      for (const file of allFileHandles) {
        
        if (file.path.endsWith('.png') || file.path.endsWith('.jpg') || file.path.endsWith('.jpeg') || 
            file.path.endsWith('.gif') || file.path.endsWith('.webp') || file.path.endsWith('.svg')) {
          
        } else if (file.path.endsWith('.md') || file.path.endsWith('.txt')) {
          
        } else {
          
        }
      }
      
      // 验证图片文件是否真的存在
      for (const imageFile of imageFiles) {
        try {
          await imageFile.handle.getFile();
        } catch (error) {
          console.error(`Failed to get image file ${imageFile.path}:`, error);
        }
      }
      
      // 如果没有找到任何Markdown文件和文件夹，则报错
      if (markdownFiles.length === 0 && allFolderPaths.length === 0) {
        this.progressAlert.show('导入失败', '未找到任何Markdown文件或文件夹。请选择包含.md或.txt文件的文件夹。', 'error');
        setTimeout(() => this.progressAlert.hide(), 3000);
        return null;
      }
      
      // 显示导入进度提示
      this.progressAlert.show('正在导入', `正在导入 ${markdownFiles.length} 个笔记, ${imageFiles.length} 个图片和 ${allFolderPaths.length} 个文件夹...`, 'info');
      
      // 按深度排序文件夹路径，确保父级文件夹先创建
      const sortedFolderPaths = [...allFolderPaths].sort((a, b) => {
        const aDepth = a.split('/').length;
        const bDepth = b.split('/').length;
        return aDepth - bDepth;
      });
      
      
      
      // 创建文件夹（包括空文件夹），并等待每个文件夹创建完成
      for (const folderPath of sortedFolderPaths) {
        // 只有当folderPath不为空时才创建文件夹
        if (folderPath) {
          
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
      
      
      
      for (let i = 0; i < imageFiles.length; i++) {
        const {handle: fileHandle, path} = imageFiles[i];
        const file = await fileHandle.getFile();

        // 更新进度提示
        this.progressAlert.update(`正在导入图片 (${i + 1}/${imageFiles.length})`, `正在上传: ${path}`, 'info');
        
        try {
          // 上传图片到服务器
          const imageUrl = await this.uploadImageToServer(file);
          uploadedImages[path] = imageUrl;
          
        } catch (error) {
          console.error(`图片上传失败 ${path}:`, error);
          this.progressAlert.update('图片上传出错', `图片上传失败 ${path}: ${(error as Error).message}`, 'error');
        }
      }
      
      
      
      // 预处理：检查重复文件并收集所有要导入的笔记
      const notesToImport: Array<{
        fileHandle: FileSystemFileHandle;
        path: string;
        fileName: string;
        shouldOverwrite: boolean;
        existingNoteInfo?: any;
      }> = [];

      console.log(`[DEBUG] 开始预处理 ${markdownFiles.length} 个Markdown文件...`);

      // 第一遍：检查重复文件，一次性处理所有确认
      for (let i = 0; i < markdownFiles.length; i++) {
        const {handle: fileHandle, path} = markdownFiles[i];
        const fileName = path.replace(/\\/g, '/').replace(/\.[^/.]+$/, "");

        const existingNoteInfo = this.checkExistingNote(fileName, existingNotes);

        if (existingNoteInfo) {
          console.log(`[DEBUG] 发现重复文件: ${fileName}`);

          // 对于重复文件，我们需要询问用户
          const shouldOverwrite = await this.confirmOverwriteDuplicate(
            existingNoteInfo.fullPath,
            dispatch
          );

          if (!shouldOverwrite) {
            console.log(`[DEBUG] 用户跳过重复文件: ${fileName}`);
            continue;
          }

          // 如果选择覆盖，先删除现有笔记
          dispatch({
            type: 'DELETE_NOTE',
            payload: existingNoteInfo.note.id
          });

          // 等待删除完成
          await new Promise(resolve => setTimeout(resolve, 100));

          notesToImport.push({
            fileHandle,
            path,
            fileName,
            shouldOverwrite: true,
            existingNoteInfo
          });
        } else {
          notesToImport.push({
            fileHandle,
            path,
            fileName,
            shouldOverwrite: false
          });
        }
      }

      console.log(`[DEBUG] 预处理完成，准备导入 ${notesToImport.length} 个笔记`);

    // 批量处理所有要导入的笔记
      console.log(`[DEBUG] 开始批量处理 ${notesToImport.length} 个笔记...`);

      const notesToCreate: Array<{
        title: string;
        content: any[];
        filePath: string;
        isOverwrite: boolean;
      }> = [];

      // 重置计数器用于批量处理
      let processedCount = 0;

      // 第一步：解析所有Markdown文件，准备批量创建
      for (let i = 0; i < notesToImport.length; i++) {
        const {fileHandle, path, fileName, shouldOverwrite, existingNoteInfo} = notesToImport[i];
        const file = await fileHandle.getFile();

        // 更新进度提示
        processedCount++;
        this.progressAlert.update(`正在解析笔记 (${processedCount}/${notesToImport.length})`, `正在处理: ${fileName}`, 'info');

        try {
          // 读取文件内容
          let content = await file.text();

          console.log(`[DEBUG] 解析文件 ${fileName}, 原始内容长度: ${content.length}`);
          console.log(`[DEBUG] 文件路径: ${path}`);
          console.log(`[DEBUG] 文件内容预览: ${content.substring(0, 200)}...`);

          // 创建完全隔离的图片映射，确保不会混入其他文件的内容
          const isolatedUploadedImages: Record<string, string> = {};

          // 添加全局上传的图片映射（只读取，不修改全局状态）
          Object.assign(isolatedUploadedImages, uploadedImages);

          // 查找当前Markdown文件中引用的.resources/images路径的图片
          const localImageMatches: string[] = [];
          const imageRegex = /!\[([^\]]*)\]\((\.[^)]*\.resources\/images\/[^)]+)\)/g;
          let match;
          while ((match = imageRegex.exec(content)) !== null) {
            const imagePath = match[2];
            localImageMatches.push(imagePath);
          }

          // 为当前文件特有的图片上传并添加到隔离的映射中
          for (const imagePath of localImageMatches) {
            const imageFileName = imagePath.split('/').pop();
            if (imageFileName) {
              const imageFile = allFileHandles.find(f => f.path.endsWith(imageFileName) &&
                (f.path.includes('.resources/images/') || f.path.includes('.resources\\images\\')));

              if (imageFile) {
                try {
                  const imageFileContent = await imageFile.handle.getFile();
                  const imageUrl = await this.uploadImageToServer(imageFileContent);
                  isolatedUploadedImages[imagePath] = imageUrl;
                } catch (uploadError) {
                  console.error(`Failed to upload .resources image ${imagePath}:`, uploadError);
                }
              }
            }
          }

          // 替换Markdown中的图片路径为上传后的URL
          const currentNoteDirPath = path.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
          content = this.replaceImagePathsV2(content, isolatedUploadedImages, currentNoteDirPath);

          // 解析Markdown内容为BlockNote格式 - 完全隔离版本
          console.log(`[DEBUG] 开始解析 ${fileName}, 原始内容长度: ${content.length}`);
          console.log(`[DEBUG] 前50字符: ${content.substring(0, 50)}`);

          let parsedBlocks: Block[] = [];
          try {
            const rawBlocks = parseMarkdownToBlocks(content) as Block[];
            console.log(`[DEBUG] parseMarkdownToBlocks 返回了 ${rawBlocks.length} 个块`);

            // 创建完全新的对象，深拷贝所有内容，强制生成新ID
            parsedBlocks = rawBlocks.map((block, blockIndex) => {
              const newBlock: any = {
                id: uuidv4(), // 强制生成新的ID
                type: block.type,
                props: JSON.parse(JSON.stringify(block.props || {})),
                content: JSON.parse(JSON.stringify(block.content || [])),
                children: JSON.parse(JSON.stringify(block.children || []))
              };

              console.log(`[DEBUG] 块 ${blockIndex}: type=${newBlock.type}, id=${newBlock.id}`);
              if (newBlock.content && newBlock.content.length > 0) {
                console.log(`[DEBUG]   第一个内容: ${JSON.stringify(newBlock.content[0]).substring(0, 100)}`);
              }

              return newBlock;
            });

            console.log(`[DEBUG] 创建了 ${parsedBlocks.length} 个隔离的块`);

          } catch (parseError) {
            console.warn(`解析Markdown内容失败:`, parseError);
            console.log(`[DEBUG] 解析失败，使用原始内容作为段落块: ${content.substring(0, 100)}`);

            // 如果解析失败，创建一个包含原始Markdown内容的段落块
            parsedBlocks = [{
              id: uuidv4(),
              type: "paragraph",
              props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left"
              },
              content: [{
                type: "text",
                text: content.substring(0, 1000), // 限制长度避免过大
                styles: {}
              }],
              children: []
            }] as Block[];
          }

          console.log(`[DEBUG] 解析完成 ${fileName}, 最终块数量: ${parsedBlocks.length}`);
          if (parsedBlocks.length > 0) {
            console.log(`[DEBUG] ${fileName} 第一个块类型: ${parsedBlocks[0].type}`);
            if (parsedBlocks[0].content && parsedBlocks[0].content.length > 0) {
              console.log(`[DEBUG] ${fileName} 第一个块内容预览: ${JSON.stringify(parsedBlocks[0].content[0]).substring(0, 150)}...`);
            }
          }

          // 准备笔记数据 - 再次深拷贝确保完全隔离
          const noteTitle = fileName.split('/').pop() || fileName;
          const noteFilePath = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

          const finalContent = JSON.parse(JSON.stringify(parsedBlocks));

          console.log(`[DEBUG] 准备添加到 notesToCreate: ${noteTitle}, 内容块数: ${finalContent.length}`);
          if (finalContent.length > 0) {
            console.log(`[DEBUG] 最终内容第一个块: ${JSON.stringify(finalContent[0]).substring(0, 200)}`);
          }

          notesToCreate.push({
            title: noteTitle,
            content: finalContent, // 已经深拷贝
            filePath: noteFilePath,
            isOverwrite: shouldOverwrite
          });

        } catch (error) {
          console.error(`解析笔记 ${fileName} 失败:`, error);
          this.progressAlert.update('解析出错', `解析笔记 ${fileName} 失败: ${(error as Error).message}`, 'error');
        }
      }

      console.log(`[DEBUG] 解析完成，开始批量创建 ${notesToCreate.length} 个笔记...`);

      // 第二步：批量创建所有笔记（适当延迟以避免文件系统竞争）
      for (let i = 0; i < notesToCreate.length; i++) {
        const note = notesToCreate[i];

        this.progressAlert.update(`正在创建笔记 (${i + 1}/${notesToCreate.length})`, `正在创建: ${note.title}`, 'info');

        console.log(`[DEBUG] 创建笔记: ${note.title}, 路径: ${note.filePath}`);
        if (note.content.length > 0) {
          console.log(`[DEBUG] ${note.title} 第一个块类型: ${note.content[0].type}`);
          console.log(`[DEBUG] ${note.title} 第一个块内容:`, JSON.stringify(note.content[0].content, null, 2));
        }

        dispatch({
          type: 'ADD_NOTE_WITH_FILE',
          payload: {
            title: note.title,
            content: note.content,
            isFolder: false,
            filePath: note.filePath
          }
        });

        // 每创建5个笔记后稍作停顿，避免服务器压力过大
        if ((i + 1) % 5 === 0) {
          console.log(`[DEBUG] 已创建 ${i + 1} 个笔记，稍作停顿...`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // 显示完成提示
      const successCount = processedCount; // 现在processedCount就是实际导入的数量
      const originalSkippedCount = markdownFiles.length - notesToImport.length;
      this.progressAlert.update('导入完成', `成功导入 ${successCount} 个笔记，跳过 ${originalSkippedCount} 个重复文件\n${imageFiles.length} 个图片和 ${allFolderPaths.length} 个文件夹！`, 'success');
      
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
      
            
      // 3秒后自动关闭提示
      setTimeout(() => {
        this.progressAlert.hide();
      }, 3000);
      
      // 返回最后一个导入的笔记路径（如果是覆盖操作）
      return lastImportedNotePath;
    } catch (error) {
      console.error('导入笔记失败:', error);
      this.progressAlert.update('导入失败', '导入笔记失败: ' + (error as Error).message, 'error');
      setTimeout(() => {
        this.progressAlert.hide();
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
      
      
      return imageUrl;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }
}
