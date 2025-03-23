import React from 'react';
import { Typography, Badge, Space } from 'antd';
import { motion } from 'framer-motion';

const { Title } = Typography;

interface FeatureSectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isNew?: boolean;
  color?: string;
}

const FeatureSectionHeader: React.FC<FeatureSectionHeaderProps> = ({ 
  title, 
  icon, 
  isNew = false,
  color = 'var(--primary-color)'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: 24
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginRight: 16
        }}
      >
        {icon}
      </div>
      
      <Title 
        level={2} 
        className="section-heading" 
        style={{ margin: 0, paddingBottom: 8 }}
      >
        <Space>
          {title}
          {isNew && (
            <Badge
              count="v0.5新增"
              style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }}
            />
          )}
        </Space>
      </Title>
    </motion.div>
  );
};

export default FeatureSectionHeader; 