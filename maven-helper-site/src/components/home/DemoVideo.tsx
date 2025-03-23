import React from 'react';
import { Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title } = Typography;

const DemoVideo: React.FC = () => {
  return (
    <section id="demo" className="section-padding">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Title level={2} className="section-heading text-center">
            <span style={{ color: 'var(--primary-color)' }}>功能演示：</span>
            自动检测JDK版本，<span style={{ color: 'var(--success-color)' }}>告别兼容性问题</span>
          </Title>
          
          <div 
            style={{ 
              position: 'relative',
              paddingBottom: '45%',
              height: 0,
              margin: '4rem auto',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              transform: 'perspective(1000px) rotateY(-2deg)',
              transition: 'all 0.3s',
              maxWidth: '100%',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(-2deg)';
            }}
          >
            <iframe 
              src="//player.bilibili.com/player.html?bvid=BV13fkgYaEDn&high_quality=1&autoplay=0" 
              scrolling="no" 
              frameBorder="0" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Maven中央仓库助手演示视频"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideo; 