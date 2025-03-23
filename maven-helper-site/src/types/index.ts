// 版本信息类型
export interface Version {
  version: string;
  title: string;
  date: string;
  description: string;
  features: string[];
  isLatest?: boolean;
}

// 特性信息类型
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  link: string;
}

// 截图类型
export interface Screenshot {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

// 导航菜单项类型
export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  path: string;
} 