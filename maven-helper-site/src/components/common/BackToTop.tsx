import React, { useState, useEffect } from 'react';
import { FloatButton } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <FloatButton
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      type="primary"
      style={{ 
        right: 30, 
        bottom: 30,
        display: visible ? 'block' : 'none'
      }}
    />
  );
};

export default BackToTop; 