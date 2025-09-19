// 简单的测试脚本，用于验证FileSystemManager功能
// 在浏览器控制台中运行

console.log('开始测试FileSystemManager...');

// 测试获取所有笔记
async function testGetAllNotes() {
  try {
    console.log('1. 测试获取所有笔记...');
    const notes = await FileSystemManager.getAllNotes();
    console.log('获取到的笔记列表:', notes);
    console.log('笔记数量:', notes.length);
    return notes;
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    return null;
  }
}

// 测试读取单个笔记
async function testReadNote(filePath) {
  try {
    console.log(`2. 测试读取笔记: ${filePath}`);
    const content = await FileSystemManager.readNote(filePath);
    console.log('笔记内容:', content);
    console.log('内容长度:', content.length);
    return content;
  } catch (error) {
    console.error(`读取笔记 ${filePath} 失败:`, error);
    return null;
  }
}

// 运行测试
async function runTests() {
  console.log('=== FileSystemManager 功能测试 ===');
  
  // 测试获取所有笔记
  const notes = await testGetAllNotes();
  if (!notes || notes.length === 0) {
    console.log('❌ 没有找到任何笔记');
    return;
  }
  
  console.log('✅ 成功获取笔记列表');
  
  // 找到第一个文件笔记进行测试
  const firstFileNote = notes.find(note => !note.isFolder && note.filePath);
  if (!firstFileNote) {
    console.log('❌ 没有找到任何文件笔记');
    return;
  }
  
  console.log('找到测试笔记:', firstFileNote);
  
  // 测试读取该笔记的内容
  const content = await testReadNote(firstFileNote.filePath);
  if (content !== null) {
    console.log('✅ 成功读取笔记内容');
    console.log('=== 测试完成 ===');
  } else {
    console.log('❌ 读取笔记内容失败');
  }
}

// 导出测试函数供手动调用
window.runFileSystemTests = runTests;

console.log('测试脚本加载完成。在控制台中调用 runFileSystemTests() 来运行测试。');

// 如果需要自动运行，取消下面这行的注释
// runTests();