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
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  priorityLabels,
  priorityTagColors,
  statusLabels,
  statusTagColors,
} from "../../constants/task.constants";
import { dashboardService } from "../../services/dashboard.service";
import { useAppSelector } from "../../store/hooks";
import type { DashboardStats, Task } from "../../types/task.types";
import TaskById from "../Tasks/taskById";

const columns: ColumnsType<Task> = [
  {
    title: "Başlık",
    dataIndex: "title",
    key: "title",
    render: (title: string,row: Task) => (
      <Tooltip title={row.description}><span>{title}</span></Tooltip>
    ),
  },
  {
    title: "Kategori",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Öncelik",
    dataIndex: "priority",
    key: "priority",
    render: (priority: Task["priority"]) => (
      <Tag color={priorityTagColors[priority]}>{priorityLabels[priority]}</Tag>
    ),
  },
  {
    title: "Durum",
    dataIndex: "status",
    key: "status",
    render: (status: Task["status"]) => (
      <Tag color={statusTagColors[status]}>{statusLabels[status]}</Tag>
    ),
  },
  {
    title: "Oluşturulma",
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

export function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await dashboardService(user.id);
        setStats(data.stats);
        setRecentTasks(data.recentTasks);
      } catch {
        setError("Dashboard verileri yüklenemedi.");
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
    return <Alert type="error" message={error ?? "Veri bulunamadı."} showIcon />;
  }

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Hoş geldin, {user?.name}
      </Typography.Title>
      <Typography.Paragraph >
        Taleplerinize genel bakış
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Toplam Talep" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Bekleyen" value={stats.pending} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Onaylanan" value={stats.approved} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Reddedilen" value={stats.rejected} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
      </Row>

      <Card title="Son Talepler" style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recentTasks}
          pagination={false}
          locale={{ emptyText: "Henüz talep bulunmuyor." }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

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
