import React from 'react';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BackToTop from '../components/common/BackToTop';
import Jumbotron from '../components/home/Jumbotron';
import NewFeatureAlert from '../components/home/NewFeatureAlert';
import DemoVideo from '../components/home/DemoVideo';
import FeatureShowcase from '../components/home/FeatureShowcase';
import VersionTimeline from '../components/home/VersionTimeline';
import InstallGuide from '../components/home/InstallGuide';

const { Content } = Layout;

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Maven中央仓库助手 - 油猴脚本官网</title>
        <meta name="description" content="自动识别Jar包编译JDK版本，解决Java版本兼容难题的油猴脚本工具" />
      </Helmet>
      
      <Layout style={{ width: '100%', overflow: 'hidden' }}>
        <Navbar />
        
        <Content style={{ width: '100%', overflow: 'hidden' }}>
          <NewFeatureAlert />
          <Jumbotron />
          <DemoVideo />
          <FeatureShowcase />
          <VersionTimeline />
          <InstallGuide />
        </Content>
        
        <Footer />
        <BackToTop />
      </Layout>
    </>
  );
};

export default HomePage; 