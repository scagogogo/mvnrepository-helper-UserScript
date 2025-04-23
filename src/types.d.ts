/**
 * 类型声明文件
 * 
 * 本文件定义了油猴(Tampermonkey/Greasemonkey)脚本使用的全局类型和接口
 * 由于油猴API没有官方的TypeScript类型定义，这里手动定义所需的类型
 * 
 * 主要内容：
 * - 进度事件接口(ProgressEvent)
 * - GM_xmlhttpRequest相关的请求配置和响应接口
 * - 可中止请求的接口定义
 * 
 * 使用场景：
 * - 在TypeScript代码中调用油猴API时获得类型检查和自动补全
 * - 提供代码编辑器的智能提示和文档
 */


/**
 * 请求进度事件接口
 * 
 * 描述网络请求或文件操作的进度状态
 * 在onprogress回调中使用，提供当前加载进度信息
 * 
 * @property {number} loaded - 已加载的字节数
 * @property {number} total - 总字节数(如果可知)
 * @property {boolean} lengthComputable - 指示总长度是否可计算，若为false则total可能不可靠
 */
interface ProgressEvent {
    /**
     * 已加载的字节数
     * 
     * 表示已经传输的数据量
     * 单位：字节(Byte)
     */
    loaded: number;
    
    /**
     * 总字节数
     * 
     * 表示需要传输的总数据量
     * 单位：字节(Byte)
     * 注意：某些情况下服务器可能不提供此信息，此时值可能为0
     */
    total: number;
    
    /**
     * 长度是否可计算
     * 
     * 指示total字段是否可靠
     * true表示total是有效值，可以用于计算百分比
     * false表示无法确定总大小，total值不应被使用
     */
    lengthComputable: boolean;
}

/**
 * GM_xmlhttpRequest响应接口
 * 
 * 包含油猴(Tampermonkey/Greasemonkey)HTTP请求的完整响应数据
 * 在onload回调函数中作为参数传入
 * 
 * @property {string} response - 响应体内容
 * @property {number} status - HTTP状态码
 * @property {string} statusText - HTTP状态文本描述
 * @property {{ [key: string]: string }} responseHeaders - 响应头部字段映射
 * @property {string} finalUrl - 最终响应的URL(考虑重定向后)
 */
interface GMXMLHttpRequestResponse {
    /**
     * 响应体内容
     * 
     * 包含服务器返回的数据
     * 根据responseType设置的不同，类型可能会有所不同
     */
    response: string;
    
    /**
     * HTTP状态码
     * 
     * 常见值：
     * - 200: 成功
     * - 404: 未找到
     * - 500: 服务器错误
     */
    status: number;
    
    /**
     * HTTP状态文本
     * 
     * 状态码的文字描述
     * 例如：'OK', 'Not Found', 'Internal Server Error'
     */
    statusText: string;
    
    /**
     * 响应头部字段映射
     * 
     * 包含所有HTTP响应头信息
     * 键为响应头名称，值为对应的响应头值
     */
    responseHeaders: { [key: string]: string };
    
    /**
     * 最终响应的URL
     * 
     * 考虑重定向后的最终URL
     * 当请求经过重定向时，此值与原始请求URL可能不同
     */
    finalUrl: string;
}

/**
 * GM_xmlhttpRequest请求配置接口
 * 
 * 定义发起油猴(Tampermonkey/Greasemonkey)HTTP请求的所有可配置选项
 * 作为GM_xmlhttpRequest函数的参数使用
 * 
 * 重要字段：
 * - url: 请求的目标URL(必填)
 * - method: 请求方法(GET/POST等)
 * - data: 请求体数据(用于POST等)
 * - onload: 请求成功的回调函数
 * - onerror: 请求失败的回调函数
 * 
 * @property {string} [method] - 请求方法，默认为GET
 * @property {string} url - 请求URL(必填)
 * @property {string|Blob|File|Object|Array|FormData|URLSearchParams} [data] - 请求体数据
 * @property {{ [key: string]: string }} [headers] - 请求头设置
 * @property {string} [responseType] - 期望的响应类型
 * @property {boolean} [allowRedirect] - 是否允许重定向
 * @property {string} [overrideMimeType] - 覆盖响应的MIME类型
 * @property {{ [key: string]: any }} [context] - 自定义上下文数据
 * @property {number} [timeout] - 请求超时时间(毫秒)
 * @property {boolean} [anonymous] - 是否匿名请求(不发送cookies)
 * @property {boolean} [fetch] - 是否使用Fetch API
 * @property {boolean} [rejectUnauthorized] - 是否拒绝未授权的SSL证书
 * @property {boolean} [binary] - 是否以二进制方式发送数据
 * @property {boolean} [nocache] - 是否禁用缓存
 * @property {boolean} [revalidate] - 是否强制验证缓存
 * @property {(response: GMXMLHttpRequestResponse) => void} [onload] - 请求成功回调
 * @property {(error: Error) => void} [onerror] - 请求失败回调
 * @property {(event: ProgressEvent) => void} [onprogress] - 进度回调
 * @property {(xhr: XMLHttpRequest) => void} [onreadystatechange] - 状态变化回调
 * @property {() => void} [ontimeout] - 超时回调
 */
interface GMXMLHttpRequestConfig {
    /**
     * 请求方法
     * 
     * 常用值：'GET', 'POST', 'PUT', 'DELETE'等
     * 不区分大小写，但通常使用大写
     * 默认值：'GET'
     */
    method?: string;
    
    /**
     * 请求URL
     * 
     * 请求的目标地址，必填项
     * 可以是相对URL或绝对URL
     */
    url: string;
    
    /**
     * 请求体数据
     * 
     * 用于POST、PUT等方法发送数据
     * 支持多种数据类型：字符串、二进制数据、表单数据等
     */
    data?: string | Blob | File | Object | Array | FormData | URLSearchParams;
    
    /**
     * 请求头设置
     * 
     * 自定义HTTP请求头
     * 例如：{ 'Content-Type': 'application/json' }
     */
    headers?: { [key: string]: string };
    
    /**
     * 期望的响应类型
     * 
     * 常见值：'text', 'json', 'blob', 'arraybuffer'
     * 默认为'text'
     */
    responseType?: string;
    
    /**
     * 是否允许重定向
     * 
     * true: 跟随HTTP重定向
     * false: 不跟随重定向
     * 默认值通常为true
     */
    allowRedirect?: boolean;
    
    /**
     * 覆盖响应的MIME类型
     * 
     * 强制将响应以指定的MIME类型处理
     * 例如：'text/plain; charset=utf-8'
     */
    overrideMimeType?: string;
    
    /**
     * 自定义上下文数据
     * 
     * 可在回调函数中通过this.context访问
     * 用于在请求的不同阶段之间传递数据
     */
    context?: { [key: string]: any };
    
    /**
     * 请求超时时间
     * 
     * 单位：毫秒
     * 超过此时间未完成请求会触发ontimeout回调
     */
    timeout?: number;
    
    /**
     * 是否匿名请求
     * 
     * true: 不发送cookies等凭证
     * false: 发送cookies等凭证
     * 默认通常为false
     */
    anonymous?: boolean;
    
    /**
     * 是否使用Fetch API
     * 
     * true: 使用现代的Fetch API发起请求
     * false: 使用传统的XMLHttpRequest
     * 不是所有油猴环境都支持此选项
     */
    fetch?: boolean;
    
    /**
     * 是否拒绝未授权的SSL证书
     * 
     * true: 拒绝自签名或不受信任的SSL证书
     * false: 接受所有SSL证书
     * 涉及安全考虑，默认通常为true
     */
    rejectUnauthorized?: boolean;
    
    /**
     * 是否以二进制方式发送数据
     * 
     * true: 以二进制方式发送请求数据
     * false: 按照默认方式处理数据
     */
    binary?: boolean;
    
    /**
     * 是否禁用缓存
     * 
     * true: 添加随机参数或适当头部以防止使用缓存
     * false: 允许使用浏览器缓存
     */
    nocache?: boolean;
    
    /**
     * 是否强制验证缓存
     * 
     * true: 强制验证缓存是否最新
     * false: 使用标准缓存策略
     */
    revalidate?: boolean;
    
    /**
     * 请求成功回调函数
     * 
     * 当请求成功完成时调用
     * 参数为包含响应数据的对象
     */
    onload?: (response: GMXMLHttpRequestResponse) => void;
    
    /**
     * 请求失败回调函数
     * 
     * 当请求遇到错误时调用
     * 参数为错误对象
     */
    onerror?: (error: Error) => void;
    
    /**
     * 进度回调函数
     * 
     * 在请求过程中定期调用，用于报告进度
     * 参数为包含进度信息的对象
     */
    onprogress?: (event: ProgressEvent) => void;
    
    /**
     * 状态变化回调函数
     * 
     * 当请求状态发生变化时调用
     * 参数为XMLHttpRequest对象
     */
    onreadystatechange?: (xhr: XMLHttpRequest) => void;
    
    /**
     * 超时回调函数
     * 
     * 当请求超过指定超时时间时调用
     * 无参数
     */
    ontimeout?: () => void;
}

/**
 * GM_xmlhttpRequest函数声明
 * 
 * 油猴脚本中用于发起跨域HTTP请求的函数
 * 突破了浏览器的同源策略限制，可以请求任何域的资源
 * 
 * @param {GMXMLHttpRequestConfig} config - 请求配置对象
 * @returns {AbortableRequest} 可中止的请求对象
 * 
 * 使用示例：
 * ```typescript
 * const request = GM_xmlhttpRequest({
 *   method: 'GET',
 *   url: 'https://example.com/api/data',
 *   responseType: 'json',
 *   onload: function(response) {
 *     console.log('响应数据:', response.response);
 *   },
 *   onerror: function(error) {
 *     console.error('请求失败:', error);
 *   }
 * });
 * 
 * // 如需取消请求
 * // request.abort();
 * ```
 */
declare function GM_xmlhttpRequest(config: GMXMLHttpRequestConfig): AbortableRequest;

/**
 * 可中止请求接口
 * 
 * 定义了可以被中止的HTTP请求对象
 * GM_xmlhttpRequest函数的返回值类型
 * 
 * @property {() => void} abort - 中止(取消)请求的方法
 */
interface AbortableRequest {
    /**
     * 中止请求方法
     * 
     * 调用此方法可立即取消正在进行的请求
     * 被取消的请求将不会触发onload回调
     * 
     * 使用场景：
     * - 用户取消操作
     * - 请求超时自动取消
     * - 组件卸载时取消未完成的请求
     */
    abort(): void;
}