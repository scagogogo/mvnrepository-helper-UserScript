import React from 'react';
import { Typography, Button, Space, Badge } from 'antd';
import { DownloadOutlined, GithubOutlined, StarOutlined, ThunderboltOutlined, ApiOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

// 丰富多彩的粒子背景
const ParticleBackground = () => (
  <div style={{ 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    overflow: 'hidden',
    zIndex: 0
  }}>
    {Array.from({ length: 80 }).map((_, i) => {
      // 使用多种颜色的粒子
      const colors = ['rgba(255, 255, 255, 0.3)', 'rgba(52, 152, 219, 0.4)', 'rgba(243, 156, 18, 0.4)', 'rgba(46, 204, 113, 0.4)', 'rgba(231, 76, 60, 0.4)'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.3,
            scale: Math.random() * 1 + 0.5
          }}
          animate={{ 
            y: [
              Math.random() * 100 + '%', 
              Math.random() * 100 + '%'
            ],
            x: [
              Math.random() * 100 + '%', 
              Math.random() * 100 + '%'
            ],
            rotate: [0, 360]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 80 + 20,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 3 + 'px',
            height: Math.random() * 10 + 3 + 'px',
            borderRadius: Math.random() > 0.5 ? '50%' : '4px',
            background: color,
            pointerEvents: 'none',
            filter: 'blur(1px)'
          }}
        />
      );
    })}
    
    {/* 添加光效元素 */}
    <div 
      style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(243, 156, 18, 0.4) 0%, rgba(243, 156, 18, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        opacity: 0.8
      }}
    />
    
    <div 
      style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(46, 204, 113, 0.3) 0%, rgba(46, 204, 113, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        opacity: 0.7
      }}
    />
    
    {/* 装饰图形 */}
    <motion.div
      initial={{ rotate: 0, opacity: 0.5 }}
      animate={{ rotate: 360, opacity: 0.8 }}
      transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        pointerEvents: 'none'
      }}
    />
    
    <motion.div
      initial={{ rotate: 0, opacity: 0.5 }}
      animate={{ rotate: -360, opacity: 0.8 }}
      transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '4px solid rgba(243, 156, 18, 0.2)',
        pointerEvents: 'none'
      }}
    />
  </div>
);

// 悬浮的代码图形元素
const CodeElements = () => (
  <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      style={{ position: 'absolute', left: '5%', top: '20%' }}
    >
      <pre style={{ 
        color: 'rgba(255, 255, 255, 0.6)', 
        fontSize: '16px', 
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '15px',
        borderRadius: '10px',
        fontFamily: 'monospace',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      }}>
{`<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>5.3.8</version>
</dependency>`}
      </pre>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      style={{ position: 'absolute', right: '5%', top: '28%' }}
    >
      <pre style={{ 
        color: 'rgba(255, 255, 255, 0.6)', 
        fontSize: '14px', 
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '12px',
        borderRadius: '10px',
        fontFamily: 'monospace',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      }}>
{`BUILD-JDK: 17.0.2`}
      </pre>
    </motion.div>
  </div>
);

const Jumbotron: React.FC = () => {
  return (
    <section className="jumbotron" style={{ 
      position: 'relative',
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)', 
      overflow: 'hidden',
      width: '100vw',
      maxWidth: '100%'
    }}>
      {/* 添加粒子背景 */}
      <ParticleBackground />
      
      {/* 添加代码元素 */}
      <CodeElements />
      
      {/* 添加波浪效果 */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        height: '120px', 
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'1\' d=\'M0,160L48,144C96,128,192,96,288,112C384,128,480,192,576,192C672,192,768,128,864,122.7C960,117,1056,171,1152,176C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
        backgroundSize: 'cover',
        zIndex: 1
      }} />
      
      <div className="jumbotron-content" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ width: '100%', textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Title level={1} style={{ 
              fontSize: '3.8rem', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: 20,
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
              Maven<span style={{ color: '#f39c12' }}>中央仓库</span>助手
            </Title>
            
            {/* 添加徽章 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <Badge 
                count="TypeScript" 
                style={{ backgroundColor: '#007acc', padding: '0 12px', borderRadius: '15px', fontSize: '12px' }} 
              />
              <Badge 
                count="高性能" 
                style={{ backgroundColor: '#e74c3c', padding: '0 12px', borderRadius: '15px', fontSize: '12px' }} 
              />
              <Badge 
                count="油猴脚本" 
                style={{ backgroundColor: '#2ecc71', padding: '0 12px', borderRadius: '15px', fontSize: '12px' }} 
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Paragraph style={{ 
              fontSize: '1.5rem', 
              color: 'white', 
              marginBottom: 24,
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
            }}>
              自动识别<span style={{ color: '#f39c12', fontWeight: 'bold' }}>Jar包编译JDK版本</span>，解决Java版本兼容难题
            </Paragraph>
          </motion.div>
          
          {/* 特性图标区域 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{ marginBottom: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <motion.div 
                whileHover={{ y: -5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}
              >
                <div style={{ 
                  background: 'rgba(243, 156, 18, 0.8)', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                }}>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '14px' }}>高性能缓存</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}
              >
                <div style={{ 
                  background: 'rgba(46, 204, 113, 0.8)', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                }}>
                  <ApiOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '14px' }}>版本检测</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}
              >
                <div style={{ 
                  background: 'rgba(52, 152, 219, 0.8)', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                }}>
                  <StarOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '14px' }}>并发控制</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Paragraph style={{ 
              fontSize: '1.1rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              marginBottom: 40,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              TypeScript驱动的高性能油猴脚本，支持并发控制和缓存管理
            </Paragraph>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <Space size="large" wrap style={{ justifyContent: 'center' }}>
              <motion.div whileHover={{ y: -8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<DownloadOutlined />}
                  href="https://greasyfork.org/zh-CN/scripts/471802-repo1-maven-org-helper"
                  target="_blank"
                  style={{ 
                    background: 'linear-gradient(45deg, #f39c12, #e67e22)', 
                    borderColor: '#e67e22',
                    padding: '0 28px',
                    height: '54px',
                    fontSize: '16px',
                    borderRadius: '27px',
                    boxShadow: '0 8px 16px rgba(243, 156, 18, 0.3)'
                  }}
                >
                  立即安装
                  <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center' }}>
                    <img 
                      src="https://img.shields.io/greasyfork/dt/471802?color=28a745&label=安装量&style=flat"
                      alt="安装量"
                      style={{ height: 24, marginLeft: 8 }}
                    />
                  </span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ y: -8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button 
                  type="default" 
                  size="large"
                  icon={<GithubOutlined />}
                  href="https://github.com/scagogogo/mvnrepository-helper-UserScript"
                  target="_blank"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '0 28px',
                    height: '54px',
                    fontSize: '16px',
                    borderRadius: '27px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  GitHub仓库
                  <img 
                    src="https://img.shields.io/github/stars/scagogogo/mvnrepository-helper-UserScript?color=0366d6&label=Stars&style=flat"
                    alt="Stars"
                    style={{ height: 24 }}
                  />
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Jumbotron; 