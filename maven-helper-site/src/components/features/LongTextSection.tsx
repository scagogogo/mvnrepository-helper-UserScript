import React, { useState } from 'react';
import { Card, Row, Col, Typography, Image, Button, Collapse, Tooltip } from 'antd';
import { 
  ExpandAltOutlined, 
  ShrinkOutlined, 
  EyeOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FeatureSectionHeader from './FeatureSectionHeader';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const longTextExample = 'org.apache.maven.plugins.dependency.analyze.AnalyzeDuplicateMojo.execute(AnalyzeDuplicateMojo.java:248)';

const LongTextSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <section id="section4" className="feature-section" style={{ width: '100%', marginBottom: '40px' }}>
      <div className="anchor-target"></div>
      
      <FeatureSectionHeader 
        title="4. 长文本智能展开" 
        icon={<ExpandAltOutlined />}
        color="#e74c3c"
      />
      
      <Row gutter={[24, 24]} style={{ width: '100%' }}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Card 
              bordered={false}
              style={{ 
                height: '100%', 
                width: '100%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <Title level={4}>提升可读性的智能文本处理</Title>
              <Paragraph>
                Maven中央仓库页面常常包含很长的类名、方法名和路径信息，阅读困难且影响布局。我们的长文本智能展开功能可以自动处理这些超长文本，改善用户体验：
              </Paragraph>
              
              <Collapse 
                bordered={false} 
                defaultActiveKey={['1']}
                style={{ background: 'white' }}
              >
                <Panel 
                  header={<Text strong>自动省略与展开机制</Text>} 
                  key="1"
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <ul style={{ paddingLeft: 20 }}>
                    <li>检测超过预设长度的文本内容</li>
                    <li>自动截断并添加展开/收起按钮</li>
                    <li>保持页面整洁的同时不丢失信息</li>
                    <li>支持一键复制完整内容</li>
                  </ul>
                </Panel>
                
                <Panel 
                  header={<Text strong>应用场景</Text>} 
                  key="2"
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <ul style={{ paddingLeft: 20 }}>
                    <li>完整的类路径显示</li>
                    <li>长方法签名的展示</li>
                    <li>详细的错误堆栈信息</li>
                    <li>POM依赖项描述文本</li>
                  </ul>
                </Panel>
                
                <Panel 
                  header={<Text strong>交互设计</Text>} 
                  key="3"
                >
                  <ul style={{ paddingLeft: 20 }}>
                    <li>使用直观的展开/收起图标</li>
                    <li>展开后内容平滑过渡</li>
                    <li>支持点击外部区域自动收起</li>
                    <li>适配各种屏幕尺寸的响应式设计</li>
                  </ul>
                </Panel>
              </Collapse>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <EyeOutlined style={{ marginRight: 8 }} />
                  <span>使用演示</span>
                </div>
              }
              bordered={false}
              style={{ 
                height: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <Image 
                src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20241216014633039.png"
                alt="长文本展开功能演示"
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
              
              <Title level={5}>互动演示</Title>
              
              <div style={{ 
                border: '1px solid #f0f0f0', 
                padding: 16, 
                borderRadius: 8,
                marginBottom: 24
              }}>
                <div style={{ marginBottom: 8 }}>长文本示例：</div>
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: 12, 
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  <Text
                    style={{ 
                      maxWidth: isExpanded ? 'none' : '150px',
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.3s'
                    }}
                  >
                    {longTextExample}
                  </Text>
                  <Tooltip title={isExpanded ? '收起' : '展开'}>
                    <Button 
                      type="text" 
                      icon={isExpanded ? <ShrinkOutlined /> : <FullscreenOutlined />}
                      onClick={() => setIsExpanded(!isExpanded)}
                      size="small"
                    />
                  </Tooltip>
                </div>
              </div>
              
              <Paragraph>
                <Text type="secondary">
                  这个功能特别适用于Maven依赖项的详情页面，能够有效处理以下场景的长文本：
                </Text>
              </Paragraph>
              
              <ul>
                <li>完整包路径：<code>org.springframework.boot.autoconfigure.web...</code></li>
                <li>详细方法签名：<code>execute(String[] args, ClassLoader classLoader)</code></li>
                <li>依赖项版本范围：<code>[2.0.0.RELEASE,3.0.0.RELEASE)</code></li>
              </ul>
              
              <div style={{ 
                background: '#fff8e1', 
                padding: 16, 
                borderRadius: 8,
                borderLeft: '4px solid #ffc107',
                marginTop: 24
              }}>
                <Text strong>用户体验提示：</Text> 长文本展开功能保留了原始信息的完整性，同时不破坏页面布局，实现了信息密度和视觉简洁的平衡。
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </section>
  );
};

export default LongTextSection; 