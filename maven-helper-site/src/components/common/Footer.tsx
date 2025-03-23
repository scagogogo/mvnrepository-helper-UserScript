import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { GithubOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter className="site-footer">
      <div className="container text-center">
        <div>
          <Text style={{ color: '#fff' }}>
            © 2023-{new Date().getFullYear()} Maven中央仓库助手项目组 | 
            <Link 
              href="https://github.com/scagogogo/mvnrepository-helper-UserScript/blob/main/LICENSE"
              target="_blank"
              style={{ color: '#fff', marginLeft: 8 }}
            >
              MIT License
            </Link>
          </Text>
        </div>
        
        <Space className="social-links" style={{ marginTop: 16 }}>
          <Link 
            href="https://github.com/scagogogo/mvnrepository-helper-UserScript"
            target="_blank"
            style={{ color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <GithubOutlined style={{ marginRight: 6 }} />
            GitHub
          </Link>
          
          <Link 
            href="https://www.bilibili.com/video/BV13fkgYaEDn"
            target="_blank"
            style={{ color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <PlayCircleOutlined style={{ marginRight: 6 }} />
            完整演示视频
          </Link>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer; 