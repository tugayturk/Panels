import { useTheme } from '../../context/ThemeContext';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <Button icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} />
    );
};