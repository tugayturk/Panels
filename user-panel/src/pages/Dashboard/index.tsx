import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  priorityTagColors,
  statusTagColors,
} from "../../constants/task.constants";
import { dashboardService } from "../../services/dashboard.service";
import { useAppSelector } from "../../store/hooks";
import type { DashboardStats, Task } from "../../types/task.types";
import TaskById from "../Tasks/taskById";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../routes/paths";
import styles from "./dashboard.module.scss";
// Kullanıcı paneli ana sayfa — istatistik kartları + son 5 talep
export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const columns: ColumnsType<Task> = [
    {
      title: t("table.title"),
      dataIndex: "title",
      key: "title",
      render: (title: string, row: Task) => (
        <Tooltip title={row.description}><div>{title}</div></Tooltip>
      ),
    },
    {
      title: t("table.category"),
      dataIndex: "category",
      key: "category",
    },
    {
      title: t("table.priority"),
      dataIndex: "priority",
      key: "priority",
      render: (priority: Task["priority"]) => (
        <Tag color={priorityTagColors[priority]}>{t(`priority.${priority}`)}</Tag>
      ),
    },
    {
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      render: (status: Task["status"]) => (
        <Tag color={statusTagColors[status]}>{t(`status.${status}`)}</Tag>
      ),
    },
    {
      title: t("table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!user) return;

    // Giriş yapan kullanıcının taleplerinden istatistik ve son kayıtları hesaplar
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await dashboardService(user.id);
        setStats(data.stats);
        setRecentTasks(data.recentTasks.slice(0, 5));
      } catch {
        setError(t("dashboard.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return <Alert type="error" message={error ?? t("dashboard.noDataError")} showIcon />;
  }

  return (
    <div>
        <h2 >{t("dashboard.welcome", { name: user?.name })}</h2>
        <p >{t("dashboard.subtitle")}</p>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.dashboardCard} styles={{ body: { padding: "12px 16px" } }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{t("dashboard.totalRequests")}</span>}
                value={stats.total}
                valueStyle={{ fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.dashboardCard} styles={{ body: { padding: "12px 16px" } }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{t("dashboard.pending")}</span>}
                value={stats.pending}
                valueStyle={{ color: "#faad14", fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.dashboardCard} styles={{ body: { padding: "12px 16px" } }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{t("dashboard.approved")}</span>}
                value={stats.approved}
                valueStyle={{ color: "#52c41a", fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.dashboardCard} styles={{ body: { padding: "12px 16px" } }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{t("dashboard.rejected")}</span>}
                value={stats.rejected}
                valueStyle={{ color: "#ff4d4f", fontSize: 22 }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Card title={t("dashboard.recentRequests")} style={{ marginTop: 12 }}>
          <Table
            rowKey="id"
            columns={columns}
            size="small"
            scroll={{ x: 600 }}
            dataSource={recentTasks}
            pagination={false}
            locale={{ emptyText: t("dashboard.noData") }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: "pointer" },
            })}
            footer={() => (
              <div>
                {t("dashboard.footerText")}{" "}
                <Link to={ROUTES.tasks}>{t("dashboard.footerLink")}</Link>.
              </div>
            )}
          />
        </Card>
      </motion.div>
      <TaskById
        isModalOpen={isModalOpen}
        handleOk={handleCloseModal}
        handleCancel={handleCloseModal}
        id={selectedTaskId}
      />
    </div>
  );
}

export default Dashboard;
