import React from 'react';
import { Typography, Timeline, Card, Tag, List, Badge, Space } from 'antd';
import { 
  ClockCircleOutlined, 
  CodeOutlined, 
  RocketOutlined, 
  ThunderboltOutlined, 
  UpCircleOutlined,
  ApartmentOutlined,
  ApiOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Version } from '../../types';

const { Title, Paragraph, Text } = Typography;

// 版本历史数据
const versions: Version[] = [
  {
    version: "v0.5",
    title: "TypeScript重构与性能优化",
    date: "2025年3月",
    description: "新增高级并发控制系统",
    features: [
      "精确控制JAR包下载和分析的并发数",
      "支持动态调整并发上限，优化资源使用",
      "增强用户界面体验，优化设置组件",
      "详细线程池任务日志，便于调试和性能分析"
    ],
    isLatest: true
  },
  {
    version: "v0.4",
    title: "UI改进与缓存管理系统",
    date: "2023年12月",
    description: "增加设置浮动球和缓存管理",
    features: [
      "增加设置浮动球，控制并发和管理缓存",
      "实时显示缓存占用空间，支持一键清除",
      "界面语言统一为英文，简化国际化处理"
    ]
  },
  {
    version: "v0.3",
    title: "扩展功能支持与体验优化",
    date: "2023年9月",
    description: "支持非Maven中央仓库的JAR包版本检测",
    features: [
      "支持非Maven中央仓库的JAR包版本检测",
      "优化显示效果，增加鼠标悬停信息",
      "增加对module-info.class的支持"
    ]
  },
  {
    version: "v0.2",
    title: "缓存与性能改进",
    date: "2023年7月",
    description: "实现缓存功能，避免重复下载JAR包",
    features: [
      "实现缓存功能，避免重复下载JAR包",
      "显示JAR类版本分布情况",
      "项目结构重构，使用webpack进行构建"
    ]
  },
  {
    version: "v0.1",
    title: "核心功能发布",
    date: "2023年5月",
    description: "初始版本发布",
    features: [
      "为Maven中央仓库的组件版本添加JDK编译版本显示",
      "支持完整GAV格式输入",
      "优化输入体验和文本展示"
    ]
  }
];

// 为每个版本选择图标
const getVersionIcon = (index: number) => {
  const icons = [
    <RocketOutlined style={{ fontSize: 24, color: '#3498db' }} />,
    <CloudSyncOutlined style={{ fontSize: 24, color: '#e67e22' }} />,
    <ApiOutlined style={{ fontSize: 24, color: '#2ecc71' }} />,
    <ApartmentOutlined style={{ fontSize: 24, color: '#9b59b6' }} />,
    <ThunderboltOutlined style={{ fontSize: 24, color: '#e74c3c' }} />
  ];
  return icons[index];
};

// 为每个版本选择背景色
const getVersionColor = (index: number) => {
  const colors = [
    { light: '#ebf5fb', border: '#3498db', text: '#2980b9' },
    { light: '#fef5e7', border: '#e67e22', text: '#d35400' },
    { light: '#eafaf1', border: '#2ecc71', text: '#27ae60' },
    { light: '#f4ecf7', border: '#9b59b6', text: '#8e44ad' },
    { light: '#fdedec', border: '#e74c3c', text: '#c0392b' }
  ];
  return colors[index];
};

const VersionTimeline: React.FC = () => {
  return (
    <section id="versions" className="section-padding" style={{ 
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(52, 152, 219, 0.05) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0) 70%)',
            filter: 'blur(30px)'
          }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 204, 113, 0.15) 0%, rgba(46, 204, 113, 0) 70%)',
            filter: 'blur(40px)'
          }}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
          style={{ marginBottom: '3rem' }}
        >
          <Title level={2} className="section-heading text-center" style={{ margin: '0 auto' }}>
            版本历史与更新日志
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '1.5rem auto 0' }}>
            持续优化的<span className="gradient-text">Maven助手</span>，为开发者带来更流畅的依赖管理体验
          </Paragraph>
        </motion.div>
        
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
        }}>
          <Timeline
            mode="alternate"
            items={versions.map((version, index) => ({
              dot: (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10, delay: index * 0.1 }}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: `0 5px 15px rgba(0, 0, 0, 0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${getVersionColor(index).border}`
                  }}
                >
                  {getVersionIcon(index)}
                </motion.div>
              ),
              children: (
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 100, 
                    damping: 10, 
                    delay: index * 0.2 
                  }}
                  className="timeline-item"
                >
                  <Card 
                    title={
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: `2px solid ${getVersionColor(index).border}`,
                        paddingBottom: '10px'
                      }}>
                        <Space align="center">
                          <Text strong style={{ fontSize: '1.2rem', color: getVersionColor(index).text }}>
                            {version.version}
                          </Text>
                          {version.isLatest && 
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Tag color="success" style={{ margin: 0, fontWeight: 'bold' }}>最新版本</Tag>
                            </motion.div>
                          }
                        </Space>
                        <Badge count={version.date} style={{ 
                          backgroundColor: getVersionColor(index).border,
                          fontWeight: 'normal',
                          fontSize: '0.8rem',
                          padding: '0 10px'
                        }} />
                      </div>
                    }
                    className="timeline-content"
                    bordered={false}
                    style={{ 
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      background: getVersionColor(index).light,
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Title level={4} style={{ 
                      color: getVersionColor(index).text, 
                      marginTop: 0,
                      fontWeight: 'bold' 
                    }}>
                      {version.title}
                    </Title>
                    <Paragraph strong style={{ fontSize: '1rem', marginBottom: '15px' }}>
                      {version.description}
                    </Paragraph>
                    <List
                      size="small"
                      dataSource={version.features}
                      renderItem={(item) => (
                        <List.Item style={{ 
                          padding: '10px 5px',
                          borderBottom: '1px dashed rgba(0, 0, 0, 0.06)'
                        }}>
                          <Space>
                            <UpCircleOutlined style={{ color: getVersionColor(index).text }} />
                            <Text>{item}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </motion.div>
              )
            }))}
          />
        </div>
      </div>
    </section>
  );
};

export default VersionTimeline; 