// 图片上传工具类
export class ImageUploadManager {
  // API 基础路径
  private static readonly API_BASE = 'http://localhost:3001';

  // 上传图片到服务器
  static async uploadImage(file: File): Promise<string> {
    try {
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('image', file);

      // 发送上传请求
      const response = await fetch(`${this.API_BASE}/api/upload-image`, {
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