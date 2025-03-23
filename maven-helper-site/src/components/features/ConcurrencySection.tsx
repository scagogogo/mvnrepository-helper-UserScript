import React from 'react';
import { Card, Row, Col, Typography, List, Alert, Image } from 'antd';
import { 
  CheckCircleOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  StarOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FeatureSectionHeader from './FeatureSectionHeader';
import CodeBlock from './CodeBlock';

const { Title, Text, Paragraph } = Typography;

const promiseThreadPoolCode = `/**
 * Promise线程池核心实现
 */
export default class PromiseThreadPool {
    private maxConcurrency: number; // 最大并发数
    private activeCount: number;    // 当前活跃任务数
    private queue: Array<() => Promise<any>>; // 任务队列
    private paused: boolean;        // 是否暂停
    private maxActiveCount: number; // 记录最大实际并发数
    
    constructor(maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
        this.activeCount = 0;
        this.maxActiveCount = 0;
        this.queue = [];
        this.paused = false;
    }
    
    // 支持Promise对象或返回Promise的函数
    public submit<T>(task: (() => Promise<T>) | Promise<T>): Promise<T> {
        // 实现细节略...
    }
    
    // 其他方法: pause(), resume(), clear(), setConcurrency()...
}`;

const ConcurrencySection: React.FC = () => {
  return (
    <section id="section5" className="feature-section" style={{ width: '100%', marginBottom: '40px' }}>
      <div className="anchor-target"></div>
      
      <FeatureSectionHeader 
        title="5. 高级并发控制系统" 
        icon={<DashboardOutlined />}
        isNew={true}
        color="#f39c12"
      />
      
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StarOutlined style={{ fontSize: 20, marginRight: 12 }} />
            <div>
              <strong>核心功能：</strong> v0.5版本新增高效Promise线程池，支持精确控制JAR包下载和分析任务的并发数，避免对服务器造成过大压力。
            </div>
          </div>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: 24 }}
      />
      
      <Row gutter={[24, 24]} style={{ width: '100%' }}>
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SettingOutlined style={{ marginRight: 8, color: 'white' }} />
                  <span>并发控制系统特性</span>
                </div>
              }
              headStyle={{ background: 'var(--primary-color)', color: 'white' }}
              bordered={false}
              style={{ 
                height: '100%', 
                width: '100%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: '动态并发调整',
                    description: '支持在运行时改变最大并发数'
                  },
                  {
                    title: '异步执行优化',
                    description: '改进异步机制，解决高并发场景下的效率问题'
                  },
                  {
                    title: '高水位监控',
                    description: '记录实际并发高峰，便于调试和性能分析'
                  },
                  {
                    title: '暂停/恢复功能',
                    description: '支持暂停和恢复任务执行队列'
                  }
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined style={{ color: 'var(--success-color)', fontSize: 18 }} />}
                      title={<Text strong>{item.title}</Text>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SettingOutlined style={{ marginRight: 8, color: 'white' }} />
                  <span>设置界面与控制</span>
                </div>
              }
              headStyle={{ background: 'var(--success-color)', color: 'white' }}
              bordered={false}
              style={{ 
                height: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: 8
              }}
            >
              <Image
                src="https://raw.githubusercontent.com/scagogogo/mvnrepository-helper-UserScript/main/README.assets/image-20241216015544138.png"
                alt="并发设置界面"
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
              
              <Title level={5}>设置说明：</Title>
              <Paragraph>
                通过页面右下角的浮动球按钮，可打开设置面板调整并发数：
              </Paragraph>
              <ul>
                <li>默认并发数为1，确保稳定性</li>
                <li>可根据网络状况调整为2-10</li>
                <li>设置过高可能导致请求被限制</li>
                <li>支持查看和清理缓存使用空间</li>
              </ul>
            </Card>
          </motion.div>
        </Col>
      </Row>
      
      <div style={{ marginTop: 32 }}>
        <Title level={4}>技术实现</Title>
        <CodeBlock code={promiseThreadPoolCode} language="typescript" />
      </div>
    </section>
  );
};

export default ConcurrencySection; 