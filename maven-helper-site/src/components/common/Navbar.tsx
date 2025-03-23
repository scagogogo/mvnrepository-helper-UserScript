import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { MenuItem } from '../../types';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkMobile();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkMobile);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // 简化的菜单项，只保留首页和功能手册
  const menuItems: MenuItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      path: '/'
    },
    {
      key: 'manual',
      icon: <BookOutlined />,
      label: '功能手册',
      path: '/features'
    }
  ];

  // 获取当前页面和当前激活的菜单项
  const getActiveKey = () => {
    const pathname = location.pathname;
    
    // 检查是否在features页面
    if (pathname.includes('/features')) return 'manual';
    
    // 默认为首页
    return 'home';
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <Header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', padding: '0 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        {/* Logo和菜单放在一起 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="logo" style={{ marginRight: 20 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3m0 10h8v8H3v-8m10-10h8v8h-8V3m0 10h8v8h-8v-8" />
            </svg>
            Maven助手
          </Link>
          
          {!isMobile && (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[getActiveKey()]}
              items={menuItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: (
                  <Link to={item.path}>
                    {item.label}
                  </Link>
                )
              }))}
              style={{ borderBottom: 'none' }}
            />
          )}
        </div>
        
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={showDrawer}
          />
        )}
      </div>
      
      <Drawer
        title="导航菜单"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[getActiveKey()]}
          style={{ height: '100%' }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Link to={item.path} onClick={closeDrawer}>
                {item.label}
              </Link>
            )
          }))}
        />
      </Drawer>
    </Header>
  );
};

export default Navbar; 