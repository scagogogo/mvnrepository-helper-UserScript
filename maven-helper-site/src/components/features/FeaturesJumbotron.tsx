import React from 'react';
import { Typography, Tag, Space } from 'antd';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

const FeaturesJumbotron: React.FC = () => {
  return (
    <section className="jumbotron" style={{ 
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)', 
      width: '100vw',
      maxWidth: '100%',
      position: 'relative'
    }}>
      <div className="jumbotron-content" style={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', textAlign: 'center' }}
        >
          <Title level={1} style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
            功能参考手册
          </Title>
          
          <Paragraph style={{ fontSize: '1.25rem', color: 'white', marginBottom: 24 }}>
            全面解析脚本功能特性与使用规范
          </Paragraph>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Space align="center" size={12}>
              <Tag color="warning" style={{ fontSize: '0.9rem', padding: '2px 8px' }}>v0.5</Tag>
              <span style={{ color: 'white' }}>最新版本已支持TypeScript和高级并发控制</span>
            </Space>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesJumbotron; 