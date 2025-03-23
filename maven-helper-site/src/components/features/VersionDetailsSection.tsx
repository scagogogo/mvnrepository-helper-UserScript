import React from 'react';
import { Card, Row, Col, Typography, Steps, Image, Tag } from 'antd';
import { 
  CheckCircleFilled, 
  CloudDownloadOutlined, 
  InfoCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FeatureSectionHeader from './FeatureSectionHeader';
import CodeBlock from './CodeBlock';

const { Title, Text, Paragraph } = Typography;

const usageCodeExample = `// 如何使用脚本检测依赖项编译兼容的JDK版本
// 1. 安装Tampermonkey扩展
// 2. 安装Maven中央仓库助手脚本
// 3. 访问 https://mvnrepository.com/artifact/{groupId}/{artifactId}/{version}
// 
// 自动检测并显示JAR包元信息，包括：
// - 编译使用的JDK版本
// - 是否存在源码包
// - 文件大小与下载地址
// - pom.xml依赖配置示例`;

const VersionDetailsSection: React.FC = () => {
  return (
    <section id="section1" className="feature-section" style={{ width: '100%', marginBottom: '40px' }}>
      <div className="anchor-target"></div>
      
      <FeatureSectionHeader 
        title="1. JAR包版本详情" 
        icon={<AppstoreOutlined />}
        color="#3498db"
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
                width: '100%',
                height: '100%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <Title level={4}>功能亮点</Title>
              <Paragraph>
                在Maven中央仓库页面，自动检查并直观展示JAR包的详细信息，包括编译使用的JDK版本、源码可用性等关键元数据，帮助开发者快速评估依赖的兼容性。
              </Paragraph>
              
              <Title level={5} style={{ marginTop: 24 }}>
                <Tag color="blue">JDK版本检测</Tag>
              </Title>
              <Steps
                direction="vertical"
                size="small"
                items={[
                  {
                    title: '自动检测',
                    description: '分析JAR包清单文件中的Build-Jdk或Created-By属性',
                    status: 'finish',
                    icon: <CheckCircleFilled />
                  },
                  {
                    title: '兼容性评估',
                    description: '自动显示与项目要求的JDK版本兼容性',
                    status: 'finish',
                    icon: <CheckCircleFilled />
                  },
                  {
                    title: '版本标记',
                    description: '不同的JDK版本以不同的颜色标记，便于区分',
                    status: 'finish',
                    icon: <CheckCircleFilled />
                  }
                ]}
              />
              
              <Title level={5} style={{ marginTop: 24 }}>
                <Tag color="green">文件信息</Tag>
              </Title>
              <Paragraph>
                <ul>
                  <li>精确显示JAR包文件大小</li>
                  <li>检测是否存在源码包</li>
                  <li>提供直接下载链接</li>
                  <li>自动生成Maven/Gradle依赖配置</li>
                </ul>
              </Paragraph>
              
              <CodeBlock code={usageCodeExample} />
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
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  <span>使用效果展示</span>
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
                src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20221023152634474.png"
                alt="JAR包版本详情展示"
                style={{ marginBottom: 20, borderRadius: 8 }}
              />
              
              <Title level={5}>
                <CloudDownloadOutlined style={{ marginRight: 8 }} />
                下载与依赖管理
              </Title>
              
              <Paragraph>
                在页面中直接显示依赖项的下载信息和配置代码：
              </Paragraph>
              
              <Image 
                src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20221023152647579.png"
                alt="依赖管理配置展示"
                style={{ marginTop: 16, borderRadius: 8 }}
              />
              
              <div style={{ marginTop: 24 }}>
                <Tag color="orange" style={{ marginRight: 8 }}>Java 8</Tag>
                <Tag color="green" style={{ marginRight: 8 }}>Java 11</Tag>
                <Tag color="blue" style={{ marginRight: 8 }}>Java 17</Tag>
                <Tag color="purple">Java 21</Tag>
              </div>
              
              <Paragraph style={{ marginTop: 16 }}>
                不同JDK版本以不同颜色区分，直观展示兼容性信息，帮助快速识别潜在问题。
              </Paragraph>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </section>
  );
};

export default VersionDetailsSection; 