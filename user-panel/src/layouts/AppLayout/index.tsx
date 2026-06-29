import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Layout, Menu, theme } from "antd";
import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import styles from "./AppLayout.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { ROUTES } from "../../routes/paths";

const { Header, Sider, Content, Footer } = Layout;

const menuDefs = [
  { key: "dashboard",     icon: <DashboardOutlined />, labelKey: "menu.dashboard" },
  { key: "talep-olustur", icon: <FileTextOutlined />,  labelKey: "menu.createRequest" },
  { key: "taleplerim",    icon: <FileTextOutlined />,  labelKey: "menu.myRequests" },
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

  const menuItems = menuDefs.map((d) => ({ key: d.key, icon: d.icon, label: t(d.labelKey) }));
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
        <div className={styles.logo}>User Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Mobil drawer menü */}
      <Drawer
        title="User Panel"
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={220}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
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
            <div className={styles.userName} style={{ maxWidth: 160 }}>{user.name}</div>
          </div>
          <div className={styles.headerActions}>
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              {t("common.logout")}
            </Button>
          </div>
        </Header>
        <Content style={{ margin: "16px 16px 0", overflow: "auto" }}>
          <div
            style={{
              padding: 16,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          {t("footer.userPanel", { year: new Date().getFullYear() })}
        </Footer>
      </Layout>
    </Layout>
  );
}
