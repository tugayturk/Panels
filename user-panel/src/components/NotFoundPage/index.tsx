import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Aradığınız sayfa bulunamadı."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      }
    />
  );
};

export default NotFoundPage;