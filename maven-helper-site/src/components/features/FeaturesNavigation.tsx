import React, { useState, useEffect } from 'react';
import { Card, Tabs, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

interface FeaturesNavigationProps {
  activeKey: string;
  onChange: (key: string) => void;
}

const FeaturesNavigation: React.FC<FeaturesNavigationProps> = ({ activeKey, onChange }) => {
  // 使用状态来跟踪当前激活的Tab，确保与URL哈希同步
  const [currentTab, setCurrentTab] = useState<string>(activeKey || 'section1');
  
  // 处理Tab变化
  const handleTabChange = (key: string) => {
    setCurrentTab(key);
    onChange(key);
    
    // 使用平滑滚动跳转到对应部分
    const targetElement = document.getElementById(key);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  // 监听URL哈希变化，更新激活的Tab
  useEffect(() => {
    if (activeKey && activeKey !== currentTab) {
      setCurrentTab(activeKey);
    }
  }, [activeKey, currentTab]);

  return (
    <div style={{ width: '100%', marginBottom: 40 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: 12 }}>
          <Tabs
            activeKey={currentTab}
            onChange={handleTabChange}
            centered
            style={{ width: '100%' }}
            items={[
              {
                key: 'section1',
                label: '版本列表页功能',
              },
              {
                key: 'section2',
                label: '详情页元数据',
              },
              {
                key: 'section3',
                label: 'GAV导航',
              },
              {
                key: 'section4',
                label: '长文本展开',
              },
              {
                key: 'section5',
                label: '并发控制系统',
              }
            ]}
          />
          
          <Alert
            message={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <InfoCircleOutlined style={{ fontSize: 20, marginRight: 12 }} />
                <div>
                  <strong>提示：</strong> 本手册涵盖了Maven中央仓库助手的所有功能，请点击导航栏查看对应功能的详细说明。
                </div>
              </div>
            }
            type="info"
            showIcon={false}
            style={{ marginTop: 16 }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default FeaturesNavigation; 