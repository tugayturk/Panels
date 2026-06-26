import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Typography } from "antd";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import styles from "./AppLayout.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ThemeToggle } from "../../components/ThemeToggle/ThemeToggle";

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "talep-olustur",
    icon: <FileTextOutlined />,
    label: "Talep Oluştur",
  },
  {
    key: "taleplerim",
    icon: <FileTextOutlined />,
    label: "Taleplerim",
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const selectedKey = location.pathname.split("/")[1] || "dashboard";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className={styles.logo}>User Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <Typography.Text strong>{user.name}</Typography.Text>
          <div className={styles.headerActions}>
            <ThemeToggle />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Çıkış
            </Button>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
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
          User Panel ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
