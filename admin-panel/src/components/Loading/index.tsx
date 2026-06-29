import React from 'react'
import { Spin } from 'antd';

const contentStyle: React.CSSProperties = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };
  
  const content = <div style={contentStyle} />;

export const Loading = () => {
  return (
    <Spin  size="large">
    {content}
  </Spin>
  )
}
