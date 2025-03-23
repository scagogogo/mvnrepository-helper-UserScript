import Database from "../../../database/Database";

interface FloatBallOptions {
    defaultConcurrency?: number;
    onSave?: (value: number) => void;
}

/**
 * 悬浮球组件，提供并发设置和缓存管理功能
 *
 * 功能特性：
 * 1. 动态样式注入确保组件样式隔离
 * 2. 支持并发数设置及保存回调
 * 3. 实时显示缓存占用空间（自动刷新）
 * 4. 提供缓存清空功能
 *
 * 使用示例：
 * @example
 * const floatBall = new FloatBallComponent({
 *   defaultConcurrency: 3,
 *   onSave: (value) => {
 *     console.log('当前并发数更新为:', value);
 *     // 更新业务逻辑中的并发设置
 *   }
 * });
 */
export default class FloatBallComponent {
    private concurrency: number;
    private onSave: ((value: number) => void) | null;
    private refreshInterval: number | null;
    private floatBall!: HTMLDivElement;
    private mask!: HTMLDivElement;
    private dialog!: HTMLDivElement;
    private input!: HTMLInputElement;

    constructor(options: FloatBallOptions = {}) {
        this.concurrency = options.defaultConcurrency || 1;
        this.onSave = options.onSave || null;
        this.refreshInterval = null;
        this.initStyles();
        this.initDOM();
        this.bindEvents();
    }

    /** 动态注入组件样式 */
    private initStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
      .float-ball-component {
        position: fixed;
        width: 50px;
        height: 50px;
        right: 30px;
        bottom: 30px;
        background: linear-gradient(145deg, #6a8eff, #3D74B8);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        transition: transform 0.2s;
        z-index: 1000;
      }

      .float-ball-component:hover {
        transform: scale(1.1) rotate(15deg);
      }

      .float-ball-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1001;
        display: none;
      }

      .float-ball-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 0 30px rgba(0,0,0,0.15);
        z-index: 1002;
        display: none;
        min-width: 300px;
        display: none;
      }

      .float-ball-dialog-header {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .float-ball-dialog-title {
        font-size: 20px;
        color: #333;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
        margin: 0;
        flex: 1;
        margin-right: 10px;
      }

      .float-ball-close-btn {
        width: 30px;
        height: 30px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 50%;
        cursor: pointer;
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 18px;
        color: #666;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .float-ball-close-btn:hover {
        background: #eee;
        color: #333;
        transform: scale(1.1);
      }

      .float-ball-alert {
        font-size: 14px;
        color: #ff4d4d;
        margin: 0;
        padding: 8px;
        background-color: #ffe8e8;
        border-radius: 4px;
        text-align: center;
      }

      .float-ball-input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      .float-ball-input:focus {
        outline: none;
        border-color: #6a8eff;
      }

      .float-ball-confirm-btn {
        background: #6a8eff;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s;
        width: 100%;
        margin-top: 10px;
      }

      .float-ball-confirm-btn:hover {
        background: #4d74ff;
      }
      
      .float-ball-storage-info {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
          text-align: center;
        }
        
        #storage-size {
          font-weight: bold;
          color: #4d74ff;
        }
        
        .float-ball-clear-btn {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 12px;
          margin-left: 8px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 3px;
          transition: all 0.2s;
        }
        
        .float-ball-clear-btn:hover {
          background: #ffeeee;
          text-decoration: underline;
        }
    `; // 保持原始样式内容不变
        document.head.appendChild(style);
    }

    /** 初始化组件DOM结构 */
    private initDOM(): void {
        this.floatBall = document.createElement('div');
        this.floatBall.className = 'float-ball-component';
        this.floatBall.textContent = '⚙️';

        this.mask = document.createElement('div');
        this.mask.className = 'float-ball-mask';

        this.dialog = document.createElement('div');
        this.dialog.className = 'float-ball-dialog';
        this.dialog.innerHTML = `
      <div class="float-ball-dialog-header">
        <div class="float-ball-dialog-title">Concurrency Settings</div>
        <button class="float-ball-close-btn">×</button>
      </div>
      <div class="float-ball-alert">⚠️ Note: You need to refresh the page after modifying <br/> the concurrency number for the changes to take effect.</div>
      <input type="number" class="float-ball-input"
             min="1" step="1" value="${this.concurrency}">
      <button class="float-ball-confirm-btn">Save</button>
      <div class="float-ball-storage-info">
          Cache Occupied Storage Space: <span id="storage-size">Calculating...</span>
          <button class="float-ball-clear-btn">Clear Cache</button>
      </div>
    `;

        document.body.append(this.floatBall, this.mask, this.dialog);
        this.input = this.dialog.querySelector('input')!;
    }

    /** 绑定事件处理器 */
    private bindEvents(): void {
        this.floatBall.addEventListener('click', () => this.openDialog());
        this.mask.addEventListener('click', () => this.closeDialog());
        this.dialog.querySelector('button.float-ball-close-btn')!.addEventListener('click', () => this.closeDialog());
        this.dialog.querySelector('button.float-ball-confirm-btn')!.addEventListener('click', () => this.closeDialog());

        this.input.addEventListener('blur', () => this.validateInput());
        this.input.addEventListener('keypress', (e: KeyboardEvent) => {
            // 仅允许输入数字和控制键
            if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && 
                e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && 
                e.key !== 'Tab' && e.key !== 'Enter') {
                e.preventDefault();
            }
            
            if (e.key === 'Enter') {
                this.validateInput();
                this.closeDialog();
            }
        });

        this.dialog.querySelector('.float-ball-clear-btn')!.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all cache data? This action cannot be undone!')) {
                this.clearStorage();
            }
        });
    }

    /** 输入验证逻辑 */
    private validateInput(): void {
        const inputValue = this.input.value.replace(/[^0-9]/g, '');
        
        if (!inputValue || isNaN(parseInt(inputValue))) {
            this.input.value = '1';
            return;
        }
        
        const numValue = parseInt(inputValue);
        if (numValue < 1) {
            this.input.value = '1';
        } else {
            this.input.value = numValue.toString();
        }
    }

    /** 打开设置对话框 */
    private async openDialog(): Promise<void> {
        this.mask.style.display = 'block';
        this.dialog.style.display = 'block';
        this.input.value = this.concurrency.toString();
        this.input.focus();

        if (this.refreshInterval) clearInterval(this.refreshInterval);
        await this.refreshStorageUsage();

        this.refreshInterval = window.setInterval(() => {
            this.refreshStorageUsage();
        }, 5000);
    }

    /** 关闭设置对话框并保存配置 */
    private closeDialog(): void {
        const newValue = parseInt(this.input.value);
        if (!isNaN(newValue)) {
            this.concurrency = newValue;
            this.onSave?.(this.concurrency);
        }
        this.mask.style.display = 'none';
        this.dialog.style.display = 'none';

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /** 格式化存储空间显示 */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /** 清空IndexedDB存储 */
    private async clearStorage(): Promise<void> {
        try {
            await Promise.all([
                this.clearObjectStore('mvnrepository-helper-UserScript', 'gav-jar-information-storage'),
                this.clearObjectStore('mvnrepository-helper-UserScript', 'repo-information-storage')
            ]);
            await this.refreshStorageUsage();
            console.log('缓存清空成功');
        } catch (error) {
            console.error('清空缓存失败:', error);
            this.dialog.querySelector('#storage-size')!.textContent = '清空失败';
        }
    }

    /** 清空指定对象存储 */
    private clearObjectStore(databaseName: string, storeName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseName);
            request.onerror = () => reject(request.error);

            request.onsuccess = (event: Event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            };
        });
    }

    /** 刷新存储空间显示 */
    private async refreshStorageUsage(): Promise<void> {
        try {
            const [size1, size2] = await Promise.all([
                Database.calculateObjectStoreSize('gav-jar-information-storage'),
                Database.calculateObjectStoreSize('repo-information-storage')
            ]);
            const total = size1 + size2;
            const formatted = this.formatBytes(total);
            this.dialog.querySelector('#storage-size')!.textContent = formatted;
        } catch (error) {
            console.error('存储刷新失败:', error);
            this.dialog.querySelector('#storage-size')!.textContent = '刷新失败';
        }
    }
}