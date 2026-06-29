import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Layout, Menu, Switch, theme } from "antd";
import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logout } from "../../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTheme } from "../../context/ThemeContext";
import styles from "./AppLayout.module.scss";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { ROUTES } from "../../routes/paths";
const { Header, Sider, Content, Footer } = Layout;

const menuDefs = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    labelKey: "menu.dashboard",
    roles: ["Admin", "Moderator", "Viewer"],
  },
  {
    key: "talepler",
    icon: <FileTextOutlined />,
    labelKey: "menu.pendingRequests",
    roles: ["Admin", "Moderator", "Viewer"],
  },
  {
    key: "tum-talepler",
    icon: <FileTextOutlined />,
    labelKey: "menu.allRequests",
    roles: ["Admin", "Moderator"],
  },
  {
    key: "kullanici-yonetimi",
    icon: <UserOutlined />,
    labelKey: "menu.userManagement",
    roles: ["Admin"],
  },
];

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

export function AppLayout() {
  const { user } = useAppSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  // Role göre filtrele ve label'ları çevir
  const filteredMenu = menuDefs
    .filter((item) => item.roles.includes(user.role))
    .map((item) => ({ key: item.key, icon: item.icon, label: t(item.labelKey) }));

  // URL'den aktif menü key'ini al (örn. /talepler → "talepler")
  const selectedKey = location.pathname.split("/")[1] || "dashboard";

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.login);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
    setMobileMenuOpen(false);
  };

  return (
    <Layout hasSider>
      <Sider
        style={siderStyle}
        breakpoint="lg"
        collapsedWidth={0}
        onBreakpoint={(broken) => setIsMobile(broken)}
      >
        <div className={styles.logo}>Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={filteredMenu}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Mobil drawer menü */}
      <Drawer
        title="Admin Panel"
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={220}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={filteredMenu}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Drawer>

      <Layout>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <div className={styles.headerLeft}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}
            <div className={styles.userName}>{user.name}</div>
          </div>
          <div className={styles.headerRight}>
            <SunOutlined style={{ fontSize: 14, color: isDark ? "#888" : "#faad14" }} />
            <Switch size="small" checked={isDark} onChange={toggleTheme} />
            <MoonOutlined style={{ fontSize: 14, color: isDark ? "#a78bfa" : "#888" }} />

            <LanguageSwitcher />


            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              {t("common.logout")}
            </Button>
          </div>
        </Header>
     
        <Content style={{ margin: "24px 16px 0", overflow: "auto" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          {t("footer.adminPanel", { year: new Date().getFullYear() })}
        </Footer>
      </Layout>
    </Layout>
  );
}
