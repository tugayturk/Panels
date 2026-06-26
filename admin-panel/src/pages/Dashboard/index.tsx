import { useEffect, useState } from "react";
import { Card, Col, Flex, Progress, Row, Statistic,Table, Tag, Tooltip, Typography } from "antd";
import moment from "moment";
import { getDashboardData } from "../../services/dashboard.service";
import {
  priorityLabels,
  priorityTagColors,
  priorityTextColors,
  statusLabels,
  statusTagColors,
} from "../../constants/task.constant";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import { useAppSelector } from "../../store/hooks";
import styles from "./Dashboard.module.scss";
import { ColumnsType } from "antd/es/table";

export default function Dashboard() {
  const [data, setData] = useState<Task[]>([]);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const data = await getDashboardData();
      setData(data);
    };
    fetchDashboardData();
  }, []);

  const pendingCount = data.filter((task) => task.status === "pending").length;
  const approvedTodayCount = data.filter(
    (task) =>
      task.status === "approved" &&
      moment(task.createdAt).isSame(new Date(), "day")
  ).length;
  const rejectedTodayCount = data.filter(
    (task) =>
      task.status === "rejected" &&
      moment(task.createdAt).isSame(new Date(), "day")
  ).length;

  const priorityOrder: TaskPriority[] = ["urgent", "high", "normal", "low"];

  const priorityStats = priorityOrder.map((priority) => {
    const count = data.filter((task) => task.priority === priority).length;
    const percent =
      data.length > 0 ? Math.round((count / data.length) * 100) : 0;

    return { priority, count, percent };
  });
  const columns : ColumnsType<Task> = [
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
      render: (title: string, row: Task) => (
        <Tooltip  title={row.description}>
          <span className={styles.tableTitle}>{title}</span>
        </Tooltip>
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
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{priorityLabels[priority]}</Tag>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status: TaskStatus) => (
        <Tag color={statusTagColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "Oluşturulma",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className={styles.date}>{moment(date).format('DD/MM/YYYY HH:mm')}</div>
      ),
    },
  ];

  return (
    <div>
      <h2>Hoş geldin, {user?.name} 👋</h2>
      <p>Özet istatistikler burada gösterilecek.</p>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              valueStyle={{ color: "#faad14" }}
              title="Bekleyen Talepler"
              value={pendingCount}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              valueStyle={{ color: "#52c41a" }}
              title="Bugün Onaylanan Talepler"
              value={approvedTodayCount}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              valueStyle={{ color: "#ff4d4f" }}
              title="Bugün Reddedilen Talepler"
              value={rejectedTodayCount}
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.chartContainer} title="Bekleyen Talepler — Öncelik Dağılımı">
        <Flex gap="middle" vertical>
          {priorityStats.map(({ priority, count, percent }) => (
            <div key={priority} className={styles.priorityRow}>
              <div className={styles.priorityLabel}>
                <span style={{ color: priorityTextColors[priority] }}>
                  {priorityLabels[priority]}
                </span>
                <span className={styles.priorityCount}>{count} talep</span>
              </div>
              <Progress
                percent={percent}
                strokeColor={priorityTextColors[priority]}
              />
            </div>
          ))}
        </Flex>
      </Card>

      <Table className={styles.table} size="small" rowKey="id" dataSource={data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} columns={columns} 
         title={() => (
          <div>
            <Typography.Text strong>Son Talepler</Typography.Text>
          </div>
        )}
        />
    </div>
  );
}
