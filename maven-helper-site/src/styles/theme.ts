import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3498db',
    colorSuccess: '#2ecc71',
    colorWarning: '#f39c12',
    colorError: '#e74c3c',
    colorTextBase: '#2c3e50',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    borderRadius: 6,
  },
  components: {
    Layout: {
      bodyBg: '#ffffff',
      headerBg: '#001529',
      footerBg: '#272727',
    },
    Card: {
      boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    Timeline: {
      dotBg: '#ffffff',
    },
  }
}; 