import React from 'react';
import { Button, Space, Tag, Badge } from 'antd';
import { motion } from 'framer-motion';
import { BulbOutlined, ThunderboltOutlined, RightOutlined } from '@ant-design/icons';

const NewFeatureAlert: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{ 
        background: 'linear-gradient(90deg, #3b82f6, #2563eb)', 
        color: 'white', 
        padding: '15px 0',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 动态背景装饰 */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
          transform: 'rotate(30deg)',
          pointerEvents: 'none'
        }}
      />
      
      {/* 光效装饰 */}
      <motion.div
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
          x: ['-50%', '-45%', '-50%']
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          repeatType: 'reverse' 
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }}
      />
      
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
          x: ['50%', '55%', '50%']
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          repeatType: 'reverse',
          delay: 1
        }}
        style={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          transform: 'translate(50%, -50%)',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(25px)',
          pointerEvents: 'none'
        }}
      />
      
      {/* 漂浮粒子 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%", 
            opacity: 0 
          }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2, 
            repeat: Infinity, 
            delay: Math.random() * 2 
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            background: 'white',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      ))}
      
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 16,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Tag 
            icon={<BulbOutlined style={{ marginRight: 4 }} />}
            color="#f59e0b" 
            style={{ 
              marginRight: 8, 
              padding: '6px 12px', 
              borderRadius: '20px', 
              fontWeight: 'bold', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              border: 'none',
              fontSize: '14px'
            }}
          >
            新功能
          </Tag>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
        >
          <ThunderboltOutlined style={{ marginRight: 10, fontSize: 18, color: '#f59e0b' }} />
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '1rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px'
          }}>v0.5版本发布!</span>
          <Badge 
            count="NEW" 
            style={{ 
              marginLeft: 10, 
              backgroundColor: '#f59e0b', 
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>
            新增高级并发控制系统，TypeScript重构与界面优化
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NewFeatureAlert; 