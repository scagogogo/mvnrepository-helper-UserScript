import React from 'react';
import { Card, Row, Col, Typography, Space, Tag, Input, Button } from 'antd';
import { 
  NodeIndexOutlined, 
  SearchOutlined, 
  ArrowRightOutlined,
  EnterOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FeatureSectionHeader from './FeatureSectionHeader';
import CodeBlock from './CodeBlock';

const { Title, Text, Paragraph } = Typography;

const gavFormatExample = `// GAV格式示例 - 支持以下格式直接输入:
groupId:artifactId:version
org.springframework.boot:spring-boot-starter:3.2.0`;

const GavNavigationSection: React.FC = () => {
  return (
    <section id="section3" className="feature-section" style={{ width: '100%', marginBottom: '40px' }}>
      <div className="anchor-target"></div>
      
      <FeatureSectionHeader 
        title="3. GAV快速导航" 
        icon={<NodeIndexOutlined />}
        color="#9b59b6"
      />
      
      <Row gutter={[24, 24]} style={{ width: '100%' }}>
        <Col xs={24} lg={14}>
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
              <Title level={4}>功能介绍</Title>
              <Paragraph>
                GAV快速导航功能支持在Maven中央仓库页面直接输入完整的Maven坐标（GroupId, ArtifactId, Version）格式，快速定位到特定依赖组件，大幅提升检索效率。
              </Paragraph>
              
              <Title level={5} style={{ marginTop: 24 }}>主要特性</Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card size="small" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SearchOutlined style={{ fontSize: 18, color: 'var(--primary-color)', marginRight: 12 }} />
                    <div>
                      <Text strong>完整GAV格式支持</Text>
                      <div>直接输入 "groupId:artifactId:version" 格式定位到特定版本</div>
                    </div>
                  </div>
                </Card>
                
                <Card size="small" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EnterOutlined style={{ fontSize: 18, color: 'var(--accent-color)', marginRight: 12 }} />
                    <div>
                      <Text strong>智能Tab键导航</Text>
                      <div>优化TabIndex设置，支持使用Tab键在GroupID、ArtifactID、Version输入框间快速切换</div>
                    </div>
                  </div>
                </Card>
                
                <Card size="small" style={{ borderLeft: '4px solid var(--success-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowRightOutlined style={{ fontSize: 18, color: 'var(--success-color)', marginRight: 12 }} />
                    <div>
                      <Text strong>回车键快速跳转</Text>
                      <div>在输入过程中随时按回车键即可触发跳转，不必等待输入完成或点击按钮</div>
                    </div>
                  </div>
                </Card>
              </Space>
              
              <Title level={5} style={{ marginTop: 24 }}>
                <Tag color="purple">代码示例</Tag>
              </Title>
              <CodeBlock code={gavFormatExample} />
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} lg={10}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <NodeIndexOutlined style={{ marginRight: 8 }} />
                  <span>GAV导航演示</span>
                </div>
              }
              bordered={false}
              style={{ 
                height: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '8px' }}>Maven中央仓库搜索功能模拟：</div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    placeholder="输入完整GAV格式: groupId:artifactId:version" 
                    prefix={<SearchOutlined />}
                    size="large"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                    <Text type="secondary">- 或分别输入 -</Text>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input placeholder="Group ID" />
                    <Input placeholder="Artifact ID" />
                    <Input placeholder="Version" />
                    <Button type="primary" icon={<SearchOutlined />} />
                  </div>
                </Space>
              </div>
              
              <Title level={5}>使用效果</Title>
              <Paragraph>
                当输入完整GAV格式如 <code>org.springframework.boot:spring-boot-starter:3.2.0</code> 后，系统会自动解析并跳转到对应的组件详情页，极大简化查找特定依赖项的流程。
              </Paragraph>
              
              <div style={{ marginTop: '16px' }}>
                <Space>
                  <Tag color="success">提高效率</Tag>
                  <Tag color="processing">简化操作</Tag>
                  <Tag color="warning">精确定位</Tag>
                </Space>
              </div>
              
              <div style={{ marginTop: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                <Paragraph>
                  <Text strong>技术提示：</Text> 脚本通过拦截并处理网站原有搜索表单的提交事件，实现GAV格式解析和智能导航功能，同时保留原有搜索功能的完整性。
                </Paragraph>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </section>
  );
};

export default GavNavigationSection; 