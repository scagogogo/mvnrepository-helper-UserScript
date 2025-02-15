

// 油猴脚本的方法没有找到类型库，就放在这里定义吧。。。


interface ProgressEvent {
    loaded: number;
    total: number;
    lengthComputable: boolean;
}

interface GMXMLHttpRequestResponse {
    response: string; // 响应体
    status: number;   // HTTP 状态码
    statusText: string; // HTTP 状态文本
    responseHeaders: { [key: string]: string }; // 响应头
    finalUrl: string; // 最终的 URL（经过重定向后）
}

interface GMXMLHttpRequestConfig {
    method?: string; // 请求方法（GET/POST等）
    url: string;     // 请求 URL
    data?: string | Blob | File | Object | Array | FormData | URLSearchParams; // 请求体（POST 数据）
    headers?: { [key: string]: string }; // 请求头
    responseType?: string; // 响应类型（text/json 等）
    allowRedirect?: boolean; // 是否允许重定向
    overrideMimeType?: string; // 覆盖 MIME 类型
    context?: { [key: string]: any }; // 自定义上下文
    timeout?: number; // 请求超时时间（毫秒）
    anonymous?: boolean; // 是否匿名请求（不发送 cookies）
    fetch?: boolean; // 是否使用 Fetch API
    rejectUnauthorized?: boolean; // 是否拒绝未授权的 SSL 证书
    binary?: boolean; // 是否以二进制方式发送数据
    nocache?: boolean; // 是否禁用缓存
    revalidate?: boolean; // 是否强制验证缓存
    onload?: (response: GMXMLHttpRequestResponse) => void; // 请求成功回调
    onerror?: (error: Error) => void; // 请求失败回调
    onprogress?: (event: ProgressEvent) => void; // 进度回调
    onreadystatechange?: (xhr: XMLHttpRequest) => void; // 状态变化回调
    ontimeout?: () => void; // 超时回调
}

declare function GM_xmlhttpRequest(config: GMXMLHttpRequestConfig): AbortableRequest;

interface AbortableRequest {
    abort(): void; // 取消请求
}