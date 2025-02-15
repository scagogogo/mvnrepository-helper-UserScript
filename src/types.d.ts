interface ProgressDetail {
    loaded: number;
    total: number;
    lengthComputable: boolean;
}

interface GMXMLHttpRequestResponse {
    response: string; // 响应体
    status: number;   // HTTP 状态码
    responseHeaders: { [key: string]: string }; // 响应头
}

interface GMXMLHttpRequestConfig {
    method?: string; // 请求方法（GET/POST等）
    url: string;     // 请求 URL
    data?: string;   // 请求体（POST 数据）
    headers?: { [key: string]: string }; // 请求头
    responseType?: string; // 响应类型（text/json等）
    onload?: (response: GMXMLHttpRequestResponse) => void; // 请求成功回调
    onerror?: (error: Error) => void; // 请求失败回调
    onprogress?: (progress: Event) => void; // 进度回调
}

declare function GM_xmlhttpRequest(config: GMXMLHttpRequestConfig): void;