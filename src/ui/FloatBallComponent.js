const {calculateObjectStoreSize} = require("../database/store-size");

/**
 *
 */
class FloatBallComponent {

    constructor(options = {}) {
        this.concurrency = options.defaultConcurrency || 3;
        this.onSave = options.onSave || null;
        this.initStyles();
        this.initDOM();
        this.bindEvents();
    }

    // 动态注入样式
    initStyles() {
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
      }

      .float-ball-dialog-header {
        font-size: 20px;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
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
    `;
        document.head.appendChild(style);
    }

    // 创建DOM结构
    initDOM() {
        // 悬浮球
        this.floatBall = document.createElement('div');
        this.floatBall.className = 'float-ball-component';
        this.floatBall.textContent = '⚙️';

        // 遮罩层
        this.mask = document.createElement('div');
        this.mask.className = 'float-ball-mask';

        // 设置对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'float-ball-dialog';
        this.dialog.innerHTML = `
  <div class="float-ball-dialog-header">并发设置</div>
  <input type="number" class="float-ball-input" 
         min="1" step="1" value="${this.concurrency}">
  <button class="float-ball-confirm-btn">保存设置</button>
  <div class="float-ball-storage-info">
    缓存占用存储空间：<span id="storage-size">计算中...</span>
    <button class="float-ball-clear-btn">清空缓存</button>
  </div>
`;

        // 添加到页面
        document.body.append(this.floatBall, this.mask, this.dialog);
        this.input = this.dialog.querySelector('input');
    }

    // 事件绑定
    bindEvents() {
        // 打开对话框
        this.floatBall.addEventListener('click', () => this.openDialog());

        // 关闭对话框
        this.mask.addEventListener('click', () => this.closeDialog());
        this.dialog.querySelector('button').addEventListener('click', () => this.closeDialog());

        // 输入验证
        this.input.addEventListener('input', () => this.validateInput());

        // 回车支持
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.closeDialog();
        });

        // 清空缓存按钮
        this.dialog.querySelector('.float-ball-clear-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有缓存数据吗？此操作不可恢复！')) {
                this.clearStorage();
            }
        });
    }

    // 输入验证
    validateInput() {
        let value = this.input.value.replace(/[^0-9]/g, '');
        value = value === '' ? 1 : Math.max(1, parseInt(value));
        this.input.value = value;
    }

    // 打开设置窗口
    async openDialog() {
        this.mask.style.display = 'block';
        this.dialog.style.display = 'block';
        this.input.value = this.concurrency;
        this.input.focus();

        try {
            const [size1, size2] = await Promise.all([
                calculateObjectStoreSize('mvnrepository-helper-UserScript', 'gav-jar-information-storage'),
                calculateObjectStoreSize('mvnrepository-helper-UserScript', 'repo-information-storage')
            ]);
            const total = size1 + size2;
            const formatted = this.formatBytes(total);
            this.dialog.querySelector('#storage-size').textContent = formatted;
        } catch (error) {
            console.error('存储计算失败:', error);
            this.dialog.querySelector('#storage-size').textContent = '获取失败';
        }
    }

    // 关闭设置窗口
    closeDialog() {
        const newValue = parseInt(this.input.value);
        if (!isNaN(newValue)) {
            this.concurrency = newValue;
            if (typeof this.onSave === 'function') {
                this.onSave(this.concurrency);
            }
        }
        this.mask.style.display = 'none';
        this.dialog.style.display = 'none';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async clearStorage() {
        try {
            await Promise.all([
                this.clearObjectStore('mvnrepository-helper-UserScript', 'gav-jar-information-storage'),
                this.clearObjectStore('mvnrepository-helper-UserScript', 'repo-information-storage')
            ]);
            this.dialog.querySelector('#storage-size').textContent = '0 Bytes';
            console.log('缓存清空成功');
        } catch (error) {
            console.error('清空缓存失败:', error);
            this.dialog.querySelector('#storage-size').textContent = '清空失败';
        }
    }

    clearObjectStore(databaseName, storeName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseName);
            request.onerror = () => reject(request.error);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            };
        });
    }

}

// // 使用示例
// const floatBall = new FloatBallComponent({
//     defaultConcurrency: 3,
//     onSave: (value) => {
//         console.log('当前并发数更新为:', value);
//         // 这里可以接入实际业务逻辑
//     }
// });

module.exports = {
    FloatBallComponent: FloatBallComponent,
}