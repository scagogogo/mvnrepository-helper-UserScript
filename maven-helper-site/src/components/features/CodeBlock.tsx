import React from 'react';
import { Card } from 'antd';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'typescript',
  title
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={title}
        className="code-block"
        size="small"
        style={{
          marginBottom: 24,
          borderLeft: '5px solid var(--primary-color)',
          borderRadius: 8,
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
          background: '#f8f9fa'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <pre
          style={{
            margin: 0,
            padding: 16,
            overflow: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          <code className={language}>{code}</code>
        </pre>
      </Card>
    </motion.div>
  );
};

export default CodeBlock; 