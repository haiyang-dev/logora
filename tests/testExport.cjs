// 测试导出功能的简单脚本
const axios = require('axios');

async function testExport() {
  try {
    console.log("测试服务器端导出功能...");
    
    // 测试内容
    const testBlocks = [
      {
        id: "1",
        type: "heading",
        props: { 
          level: 1
        },
        content: [{ type: "text", text: "导出测试", styles: {} }],
        children: []
      },
      {
        id: "2",
        type: "paragraph",
        props: { 
          backgroundColor: "default",
          textColor: "default",
          textAlignment: "left"
        },
        content: [{ type: "text", text: "这是一个导出测试", styles: {} }],
        children: []
      }
    ];
    
    // 发送保存请求
    const response = await axios.post('http://localhost:3001/api/notes/test/export-test.md', {
      content: testBlocks
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log("服务器响应:", response.data);
    
    if (response.data.success) {
      console.log("导出成功!");
    } else {
      console.log("导出失败:", response.data.error);
    }
    
  } catch (error) {
    console.error("测试失败:", error.message);
  }
}

// 执行测试
testExport();