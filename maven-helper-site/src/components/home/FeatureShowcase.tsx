import React from 'react';
import { Typography, Row, Col, Card, Button, Carousel } from 'antd';
import { 
  SearchOutlined, 
  DashboardOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Feature, Screenshot } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

// 核心功能数据
const features: Feature[] = [
  {
    id: 'jdk-detect',
    title: 'JDK版本检测',
    description: '自动识别JAR包的编译JDK版本，包括Class文件版本和MANIFEST.MF元数据信息',
    icon: 'SearchOutlined',
    link: '/features#section1'
  },
  {
    id: 'concurrency',
    title: '高级并发控制',
    description: '内置高效Promise线程池，支持调整并发数，避免对服务器造成过大压力',
    icon: 'DashboardOutlined',
    iconColor: '#2ecc71',
    link: '/features#section5'
  },
  {
    id: 'cache',
    title: '智能缓存系统',
    description: '实现JAR包信息本地缓存，避免重复下载，提高页面加载速度和响应性',
    icon: 'DatabaseOutlined',
    iconColor: '#e74c3c',
    link: '/features#section2'
  }
];

// 截图数据
const screenshots: Screenshot[] = [
  {
    id: 1,
    title: '版本列表页JDK版本展示',
    description: '实时显示每个版本的JDK编译信息',
    imageUrl: 'https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/data/demo-video.gif'
  },
  {
    id: 2,
    title: '组件详情页展示',
    description: '显示完整的JDK版本元数据',
    imageUrl: 'https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20241216014633039.png'
  }
];

// 渲染图标组件
const renderIcon = (iconName: string, color?: string) => {
  const style = { fontSize: 24, color: color || 'var(--primary-color)' };
  
  switch (iconName) {
    case 'SearchOutlined':
      return <SearchOutlined style={style} />;
    case 'DashboardOutlined':
      return <DashboardOutlined style={style} />;
    case 'DatabaseOutlined':
      return <DatabaseOutlined style={style} />;
    default:
      return <SearchOutlined style={style} />;
  }
};

const FeatureShowcase: React.FC = () => {
  return (
    <section id="features" className="section-padding" style={{ background: 'var(--light-bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} className="section-heading text-center">
            核心功能展示
          </Title>
          
          {/* 功能卡片 */}
          <Row gutter={[24, 24]} style={{ marginTop: 60 }}>
            {features.map((feature) => (
              <Col key={feature.id} xs={24} md={8}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    hoverable
                    className="feature-card"
                    style={{ height: '100%', textAlign: 'center' }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="feature-icon" style={{ background: feature.iconColor || 'var(--primary-color)' }}>
                      {renderIcon(feature.icon, 'white')}
                    </div>
                    <Meta
                      title={<Title level={4}>{feature.title}</Title>}
                      description={<Paragraph>{feature.description}</Paragraph>}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
          
          {/* 截图轮播 */}
          <div style={{ marginTop: 80 }}>
            <Title level={3} className="text-center" style={{ marginBottom: 40 }}>
              实际效果展示
            </Title>
            
            <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 12, overflow: 'hidden', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)' }}>
              <Carousel autoplay>
                {screenshots.map((screenshot) => (
                  <div key={screenshot.id}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={screenshot.imageUrl} 
                        alt={screenshot.title}
                        style={{ width: '100%', height: 500, objectFit: 'contain', background: '#f0f2f5' }}
                      />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0,
                          background: 'rgba(0, 0, 0, 0.75)', 
                          padding: 16,
                          textAlign: 'center',
                          borderBottomLeftRadius: 12,
                          borderBottomRightRadius: 12
                        }}
                      >
                        <Title level={5} style={{ color: 'white', margin: 0 }}>
                          {screenshot.title}
                        </Title>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                          {screenshot.description}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase; 