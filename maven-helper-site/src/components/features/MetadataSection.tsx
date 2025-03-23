import React from 'react';
import { Card, Row, Col, Typography, Divider, Image, Badge, List } from 'antd';
import { 
  FileSearchOutlined, 
  ApiOutlined, 
  CodeOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FeatureSectionHeader from './FeatureSectionHeader';

const { Title, Text, Paragraph } = Typography;

const metadataFeatures = [
  {
    title: '组件完整性检查',
    description: '自动检测JAR包是否包含必要的组件和依赖'
  },
  {
    title: '元数据分析',
    description: '解析并显示JAR包清单（Manifest）文件中的关键信息'
  },
  {
    title: '依赖项解析',
    description: '分析pom.xml中的依赖关系，提供可视化展示'
  },
  {
    title: 'API规范检测',
    description: '识别JAR包是否符合标准API规范，如OSGi规范等'
  }
];

const MetadataSection: React.FC = () => {
  return (
    <section id="section2" className="feature-section" style={{ width: '100%', marginBottom: '40px' }}>
      <div className="anchor-target"></div>
      
      <FeatureSectionHeader 
        title="2. 元数据解析系统" 
        icon={<DatabaseOutlined />}
        color="#2ecc71"
      />
      
      <Row gutter={[24, 24]} style={{ width: '100%' }}>
        <Col xs={24} lg={10}>
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
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <FileSearchOutlined style={{ fontSize: 24, color: 'var(--primary-color)', marginRight: 12 }} />
                <Title level={4} style={{ margin: 0 }}>元数据解析引擎</Title>
              </div>
              
              <Paragraph>
                脚本使用高效的元数据提取引擎，分析JAR包内部结构和清单文件，自动识别和展示重要的技术细节，帮助开发者更深入理解依赖项的特性。
              </Paragraph>
              
              <Divider />
              
              <List
                itemLayout="horizontal"
                dataSource={metadataFeatures}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CodeOutlined style={{ fontSize: 18, color: 'var(--success-color)' }} />}
                      title={<Text strong>{item.title}</Text>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
              
              <Divider />
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <ApiOutlined style={{ fontSize: 24, color: 'var(--primary-color)', marginRight: 12 }} />
                <Title level={4} style={{ margin: 0 }}>API兼容性</Title>
              </div>
              
              <Paragraph>
                自动检测不同版本之间的API兼容性变化，帮助开发者评估版本升级的风险和影响范围。通过分析类签名和公共接口，提供直观的兼容性视图。
              </Paragraph>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} lg={14}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              bordered={false}
              style={{ 
                height: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <Title level={4}>功能展示</Title>
              
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Badge.Ribbon text="清单分析" color="green">
                    <Card bordered={false} style={{ backgroundColor: '#f9f9f9' }}>
                      <Paragraph>
                        <Text strong>清单文件（MANIFEST.MF）解析结果：</Text>
                      </Paragraph>
                      <Image 
                        src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20221023152618673.png"
                        alt="清单文件解析展示"
                        style={{ borderRadius: 8 }}
                      />
                    </Card>
                  </Badge.Ribbon>
                </Col>
                
                <Col span={24}>
                  <Badge.Ribbon text="依赖树" color="blue">
                    <Card bordered={false} style={{ backgroundColor: '#f9f9f9' }}>
                      <Paragraph>
                        <Text strong>依赖关系分析结果：</Text>
                      </Paragraph>
                      <Image 
                        src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20221023152627223.png"
                        alt="依赖关系分析展示"
                        style={{ borderRadius: 8 }}
                      />
                    </Card>
                  </Badge.Ribbon>
                </Col>
              </Row>
              
              <Divider />
              
              <Paragraph>
                <Text type="secondary">
                  脚本自动分析并解构JAR包元数据，提取关键信息并以易于理解的方式呈现，让开发者无需手动解包即可了解依赖项的内部结构和特性。
                </Text>
              </Paragraph>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </section>
  );
};

export default MetadataSection; 