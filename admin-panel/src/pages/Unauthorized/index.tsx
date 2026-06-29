import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="403"
      title={t("unauthorized.title")}
      subTitle={t("unauthorized.subtitle")}
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          {t("unauthorized.backHome")}
        </Button>
      }
    />
  );
};

export default Unauthorized;