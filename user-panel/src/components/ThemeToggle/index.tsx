import { useTheme } from '../../context/ThemeContext';
import { Switch } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SunOutlined style={{ fontSize: 14, color: isDark ? '#888' : '#faad14' }} />
            <Switch size="small" checked={isDark} onChange={toggleTheme} />
            <MoonOutlined style={{ fontSize: 14, color: isDark ? '#a78bfa' : '#888' }} />
        </div>
    );
};