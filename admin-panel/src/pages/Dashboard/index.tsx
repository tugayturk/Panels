import { useEffect, useState } from "react";
import { Card, Col, Flex, Progress, Row, Statistic, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import { getDashboardData } from "../../services/dashboard.service";
import {
  priorityTagColors,
  priorityTextColors,
  statusTagColors,
} from "../../constants/task.constants";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import { useAppSelector } from "../../store/hooks";
import styles from "./Dashboard.module.scss";
import { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../routes/paths";

// Admin dashboard: bekleyen talepler, istatistik kartları ve öncelik dağılımı
export default function Dashboard() {
  const [data, setData] = useState<Task[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  useEffect(() => {
    // Tüm talepleri çeker; sayımlar aşağıda durum bazında hesaplanır
    const fetchDashboardData = async () => {
      const data = await getDashboardData();
      setData(data);
    };
    fetchDashboardData();
  }, []);

  // Özet kartlar için sayımlar — "bugün" kontrolü inceleme/güncelleme tarihine
  // göre yapılır (talep dün açılıp bugün onaylanmış olabilir)
  const pendingCount = data.filter((task) => task.status === "pending").length;
  const approvedTodayCount = data.filter(
    (task) =>
      task.status === "approved" &&
      moment(task.updatedAt ?? task.createdAt).isSame(new Date(), "day")
  ).length;
  const rejectedTodayCount = data.filter(
    (task) =>
      task.status === "rejected" &&
      moment(task.updatedAt ?? task.createdAt).isSame(new Date(), "day")
  ).length;

  // Progress bar'larda acilden düşüğe sıralı gösterim
  const priorityOrder: TaskPriority[] = ["urgent", "high", "normal", "low"];

  // Her öncelik için adet ve toplam içindeki yüzde
  const priorityStats = priorityOrder.map((priority) => {
    const count = data.filter((task) => task.priority === priority).length;
    const percent =
      data.length > 0 ? Math.round((count / data.length) * 100) : 0;

    return { priority, count, percent };
  });
  // Tablo kolonları — Tag renkleri için priorityTagColors / statusTagColors kullanılır
  const columns : ColumnsType<Task> = [
    {
      title: t("table.title"),
      dataIndex: "title",
      key: "title",
      render: (title: string, row: Task) => (
        <Tooltip title={row.description}>
          <div className={styles.tableTitle}>{title}</div>
        </Tooltip>
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
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{t(`priority.${priority}`)}</Tag>
      ),
    },
    {
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      render: (status: TaskStatus) => (
        <Tag color={statusTagColors[status]}>{t(`status.${status}`)}</Tag>
      ),
    },
    {
      title: t("table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className={styles.date}>{moment(date).format('DD/MM/YYYY HH:mm')}</div>
      ),
    },
  ];

  return (
    <div>
      <h2 className={styles.pageHeader}>{t("dashboard.welcome", { name: user?.name })}</h2>
      <p className={styles.pageSubtitle}>{t("dashboard.subtitle")}</p>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Row gutter={[12, 12]} className={styles.statsRow}>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                valueStyle={{ color: "#faad14" }}
                title={t("dashboard.pendingRequests")}
                value={pendingCount}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                valueStyle={{ color: "#52c41a" }}
                title={t("dashboard.approvedToday")}
                value={approvedTodayCount}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={styles.statCard}>
              <Statistic
                valueStyle={{ color: "#ff4d4f" }}
                title={t("dashboard.rejectedToday")}
                value={rejectedTodayCount}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Row gutter={[12, 12]} className={styles.bottomRow}>
          <Col xs={24} lg={8}>
            <Card className={styles.chartContainer} title={t("dashboard.priorityStats")}>
              <Flex gap="small" vertical>
                {priorityStats.map(({ priority, count, percent }) => (
                  <div key={priority} className={styles.priorityRow}>
                    <div className={styles.priorityLabel}>
                      <span style={{ color: priorityTextColors[priority] }}>
                        {t(`priority.${priority}`)}
                      </span>
                      <span className={styles.priorityCount}>
                        {t("dashboard.requestCount", { count })}
                      </span>
                    </div>
                    <Progress
                      percent={percent}
                      strokeColor={priorityTextColors[priority]}
                      size="small"
                    />
                  </div>
                ))}
              </Flex>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className={styles.tableContainer} title={t("dashboard.recentRequests")}>
              <Table
                size="small"
                rowKey="id"
                scroll={{ x: 600 }}
                dataSource={[...data]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5)}
                columns={columns}
                pagination={false}
                footer={() => (
                  <div>
                    {t("dashboard.footerText")}{" "}
                    <Link to={ROUTES.pendingRequests}>{t("dashboard.footerLink")}</Link>.
                  </div>
                )}
                locale={{ emptyText: t("dashboard.noData") }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
}
