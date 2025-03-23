import React from 'react';
import { Typography, Row, Col, Card, Steps, Button, Space } from 'antd';
import { 
  DownloadOutlined, 
  ChromeOutlined, 
  CodeOutlined,
  RightCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const InstallGuide: React.FC = () => {
  return (
    <section id="install" className="section-padding" style={{ background: 'var(--light-bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} className="section-heading text-center">
            安装方式
          </Title>
          
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <Card 
                bordered={false} 
                className="shadow-sm"
                style={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
              >
                <div>
                  <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
                    <DownloadOutlined style={{ color: 'var(--primary-color)', marginRight: 12 }} />
                    推荐方式：油猴商店安装
                  </Title>
                  
                  <Steps
                    direction="vertical"
                    size="small"
                    items={[
                      {
                        title: '安装Tampermonkey插件',
                        description: (
                          <Space>
                            <Text>适用于Chrome/Edge/Firefox等主流浏览器</Text>
                            <Button 
                              type="link" 
                              href="https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                              target="_blank"
                              size="small"
                            >
                              获取插件
                            </Button>
                          </Space>
                        ),
                        icon: <ChromeOutlined />
                      },
                      {
                        title: '访问油猴商店安装脚本',
                        description: (
                          <Space>
                            <Text>点击安装，确认后自动完成</Text>
                            <Button 
                              type="link" 
                              href="https://greasyfork.org/zh-CN/scripts/471802-repo1-maven-org-helper"
                              target="_blank"
                              size="small"
                            >
                              前往安装
                            </Button>
                          </Space>
                        ),
                        icon: <RightCircleOutlined />
                      }
                    ]}
                  />
                  
                  <div style={{ 
                    padding: '12px 16px', 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: 6,
                    marginTop: 24
                  }}>
                    <Text type="success" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>💡</span>
                      安装后无需配置，即可在Maven仓库页面自动启用
                    </Text>
                  </div>
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
                    <CodeOutlined style={{ color: 'var(--primary-color)', marginRight: 12 }} />
                    开发者安装
                  </Title>
                  
                  <div style={{ 
                    padding: 16, 
                    background: '#333', 
                    color: '#fff', 
                    borderRadius: 8,
                    fontFamily: 'monospace'
                  }}>
<pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#eee' }}>
{`git clone https://github.com/scagogogo/mvnrepository-helper-UserScript.git
cd mvnrepository-helper-UserScript
yarn install && yarn build`}
</pre>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20241216015544138.png"
                  className="img-fluid" 
                  alt="安装演示" 
                  style={{ 
                    width: '100%', 
                    borderRadius: 12, 
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)' 
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </section>
  );
};

export default InstallGuide; 