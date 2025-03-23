import React, { useState, useEffect } from 'react';
import { Layout, Divider } from 'antd';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BackToTop from '../components/common/BackToTop';
import FeaturesJumbotron from '../components/features/FeaturesJumbotron';
import FeaturesNavigation from '../components/features/FeaturesNavigation';
import VersionDetailsSection from '../components/features/VersionDetailsSection';
import MetadataSection from '../components/features/MetadataSection';
import GavNavigationSection from '../components/features/GavNavigationSection';
import LongTextSection from '../components/features/LongTextSection';
import ConcurrencySection from '../components/features/ConcurrencySection';

const { Content } = Layout;

const FeaturesPage: React.FC = () => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<string>('section1');
  
  // 从URL哈希中获取当前激活的部分
  useEffect(() => {
    const handleHashChange = () => {
      const hash = location.hash.replace('#', '');
      if (hash.match(/^section\d+$/)) {
        setActiveKey(hash);
        
        // 页面加载后延时滚动到对应位置
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            window.scrollTo({
              top: element.offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else if (!hash) {
        setActiveKey('section1'); // 默认值
      }
    };
    
    // 初始加载时检查
    handleHashChange();
    
    // 监听哈希变化
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.hash]);
  
  // 处理导航变化
  const handleNavChange = (key: string) => {
    setActiveKey(key);
    // 使用history.pushState更新URL，不触发页面刷新
    const newUrl = `${window.location.pathname}#${key}`;
    window.history.pushState(null, '', newUrl);
  };
  
  return (
    <>
      <Helmet>
        <title>功能参考手册 - Maven中央仓库助手</title>
        <meta name="description" content="Maven中央仓库助手功能详解，包括JAR包版本检测、元数据解析、GAV导航、长文本展开和并发控制" />
      </Helmet>
      
      <Layout style={{ width: '100%', overflow: 'hidden', minHeight: '100vh', maxWidth: '100vw' }}>
        <Navbar />
        
        <Content style={{ width: '100%', overflow: 'hidden', padding: 0 }}>
          <FeaturesJumbotron />
          
          <div style={{ width: '100%', padding: '20px 4% 0', boxSizing: 'border-box' }}>
            <FeaturesNavigation 
              activeKey={activeKey}
              onChange={handleNavChange}
            />
          </div>
          
          <div style={{ width: '100%', padding: '40px 4%', boxSizing: 'border-box' }}>
            <VersionDetailsSection />
            
            <Divider style={{ margin: '60px 0', width: '100%' }} />
            
            <MetadataSection />
            
            <Divider style={{ margin: '60px 0', width: '100%' }} />
            
            <GavNavigationSection />
            
            <Divider style={{ margin: '60px 0', width: '100%' }} />
            
            <LongTextSection />
            
            <Divider style={{ margin: '60px 0', width: '100%' }} />
            
            <ConcurrencySection />
          </div>
        </Content>
        
        <Footer />
        <BackToTop />
      </Layout>
    </>
  );
};

export default FeaturesPage; 