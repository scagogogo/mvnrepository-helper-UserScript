import React, { useEffect } from 'react';
import { Layout, Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const { Content } = Layout;

const NotFoundPage: React.FC = () => {
  // 记录404页面访问日志
  useEffect(() => {
    console.log('404页面被访问：', window.location.pathname);
  }, []);

  return (
    <>
      <Helmet>
        <title>页面未找到 - Maven中央仓库助手</title>
        <meta name="description" content="您访问的页面不存在" />
      </Helmet>
      
      <Layout style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <Navbar />
        
        <Content style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', width: '100%', boxSizing: 'border-box' }}>
            <Result
              status="404"
              title="404"
              subTitle="抱歉，您访问的页面不存在。"
              extra={
                <Button type="primary">
                  <Link to="/">返回首页</Link>
                </Button>
              }
            />
          </div>
        </Content>
        
        <Footer />
      </Layout>
    </>
  );
};

export default NotFoundPage; 