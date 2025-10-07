/**
 * 通用进度提示框管理器
 */
export class ProgressAlert {
  private static instance: ProgressAlert | null = null;
  private alertContainer: HTMLElement | null = null;
  private currentAlert: HTMLElement | null = null;

  private constructor() {}

  static getInstance(): ProgressAlert {
    if (!ProgressAlert.instance) {
      ProgressAlert.instance = new ProgressAlert();
    }
    return ProgressAlert.instance;
  }

  /**
   * 显示进度提示框
   */
  show(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.createContainer();

    // 创建提示框内容
    const alertElement = document.createElement('div');
    alertElement.className = 'progress-alert';
    alertElement.style.cssText = this.getAlertStyles(type);

    // 添加标题
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.style.cssText = this.getTitleStyles(type);
    titleElement.textContent = title;
    alertElement.appendChild(titleElement);

    // 添加消息内容
    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.style.cssText = this.getMessageStyles(type);
    messageElement.textContent = message;
    alertElement.appendChild(messageElement);

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.style.cssText = this.getCloseButtonStyles(type);
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => this.hide();
    alertElement.appendChild(closeButton);

    // 移除之前的提示框
    if (this.currentAlert && this.currentAlert.parentNode) {
      this.currentAlert.parentNode.removeChild(this.currentAlert);
    }

    this.currentAlert = alertElement;
    this.alertContainer!.appendChild(alertElement);
  }

  /**
   * 更新进度提示框内容
   */
  update(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    if (this.currentAlert) {
      this.currentAlert.style.cssText = this.getAlertStyles(type);

      const titleElement = this.currentAlert.querySelector('.alert-title') as HTMLElement;
      const messageElement = this.currentAlert.querySelector('.alert-message') as HTMLElement;

      if (titleElement) {
        titleElement.textContent = title;
        titleElement.style.cssText = this.getTitleStyles(type);
      }

      if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.cssText = this.getMessageStyles(type);
      }

      const closeButton = this.currentAlert.querySelector('.alert-close') as HTMLElement;
      if (closeButton) {
        closeButton.style.cssText = this.getCloseButtonStyles(type);
      }

      // 移除现有的按钮容器
      const existingButtonContainer = this.currentAlert.querySelector('.button-container');
      if (existingButtonContainer) {
        existingButtonContainer.remove();
      }
    } else {
      this.show(title, message, type);
    }
  }

  /**
   * 添加按钮到当前提示框
   */
  addButtons(buttons: { text: string; onClick: () => void; style?: 'primary' | 'secondary' }[]): void {
    if (!this.currentAlert) return;

    // 移除现有按钮
    const existingButtonContainer = this.currentAlert.querySelector('.button-container');
    if (existingButtonContainer) {
      existingButtonContainer.remove();
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 15px;
    `;

    buttons.forEach(button => {
      const buttonElement = document.createElement('button');
      buttonElement.textContent = button.text;
      buttonElement.style.cssText = button.style === 'primary' ?
        `padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;` :
        `padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;`;
      buttonElement.onclick = () => {
        button.onClick();
      };
      buttonContainer.appendChild(buttonElement);
    });

    this.currentAlert.appendChild(buttonContainer);
  }

  /**
   * 隐藏提示框
   */
  hide(): void {
    if (this.currentAlert) {
      this.currentAlert.style.opacity = '0';
      this.currentAlert.style.transform = 'translateX(100%)';

      setTimeout(() => {
        if (this.currentAlert && this.currentAlert.parentNode) {
          this.currentAlert.parentNode.removeChild(this.currentAlert);
          this.currentAlert = null;
        }
      }, 300);
    }
  }

  private createContainer(): void {
    if (!this.alertContainer) {
      this.alertContainer = document.createElement('div');
      this.alertContainer.id = 'export-alert-container';
      this.alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
      `;
      document.body.appendChild(this.alertContainer);
    }
  }

  private getAlertStyles(type: string): string {
    const colors = {
      success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
      info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
    };

    const color = colors[type as keyof typeof colors] || colors.info;

    return `
      background: ${color.bg};
      border: 1px solid ${color.border};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(0);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 1;
      position: relative;
    `;
  }

  private getTitleStyles(type: string): string {
    const colors = {
      success: '#155724',
      error: '#721c24',
      warning: '#856404',
      info: '#0c5460'
    };

    return `
      font-weight: bold;
      margin-bottom: 8px;
      color: ${colors[type as keyof typeof colors] || colors.info};
    `;
  }

  private getMessageStyles(type: string): string {
    const colors = {
      success: '#155724',
      error: '#721c24',
      warning: '#856404',
      info: '#0c5460'
    };

    return `
      color: ${colors[type as keyof typeof colors] || colors.info};
      white-space: pre-wrap;
      line-height: 1.5;
    `;
  }

  private getCloseButtonStyles(type: string): string {
    const colors = {
      success: '#155724',
      error: '#721c24',
      warning: '#856404',
      info: '#0c5460'
    };

    return `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: ${colors[type as keyof typeof colors] || colors.info};
      padding: 4px;
      line-height: 1;
    `;
  }
}