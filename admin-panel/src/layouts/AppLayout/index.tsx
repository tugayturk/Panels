import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Typography } from "antd";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "./AppLayout.module.scss";
import { Role } from "../../types";

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    roles: ["Admin", "Moderator", "Viewer"],
  },
  {
    key: "talepler",
    icon: <FileTextOutlined />,
    label: "Bekleyen Talepler",
    roles: ["Admin", "Moderator", "Viewer"],
  },
  {
    key: "tüm-talepler",
    icon: <FileTextOutlined />,
    label: "Tüm Talepler",
    roles: ["Admin", "Moderator"],
  },
  {
    key: "kullanici-yonetimi",
    icon: <UserOutlined />,
    label: "Kullanıcı Yönetimi",
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const selectedKey = location.pathname.split("/")[1] || "dashboard";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className={styles.logo}>Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={filteredMenu}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <Typography.Text strong>{user.name}</Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Çıkış
          </Button>
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
          Admin Panel ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
