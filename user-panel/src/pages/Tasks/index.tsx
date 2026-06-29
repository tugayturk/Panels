import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  priorityTagColors,
  statusTagColors,
} from "../../constants/task.constants";
import { getTasks } from "../../services/task.service";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import { Table, Tag, Button, Tooltip, Flex } from "antd";
import { useAppSelector } from "../../store/hooks";
import moment from "moment";
import TaskById from "./taskById";
import TaskCreationModal from "./taskCreationModal";
import styles from "./task.module.scss";
import { FileOutlined } from "@ant-design/icons";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

// Kullanıcının tüm taleplerini listeler; filtreleme ve detay modalı içerir
const Tasks = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [id, setId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAppSelector((state) => state.auth);

  const handleOk = () => { setIsModalOpen(false); };
  const handleCancel = () => { setIsModalOpen(false); };

  const columns: ColumnsType<Task> = [
    {
      title: t("table.title"),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, row: Task) => (
        <Tooltip title={row.description}><div>{title}</div></Tooltip>
      ),
    },
    {
      title: t("table.category"),
      dataIndex: 'category',
      key: 'description',
      render: (category: string) => <div>{category}</div>,
    },
    {
      title: t("table.priority"),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{t(`priority.${priority}`)}</Tag>
      ),
    },
    {
      title: t("table.status"),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: t("status.pending"),  value: 'pending' },
        { text: t("status.approved"), value: 'approved' },
        { text: t("status.rejected"), value: 'rejected' },
      ],
      onFilter: (value, record) => record.status.indexOf(value as string) === 0,
      render: (status: TaskStatus) => (
        <Tag color={statusTagColors[status]}>{t(`status.${status}`)}</Tag>
      ),
    },
    {
      title: t("table.createdAt"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) =>
        <div className={styles.date}>{moment(date).format('DD/MM/YYYY')}</div>,
    },
    {
      title: t("table.detail"),
      dataIndex: 'detay',
      key: 'detay',
      render: (_text: string, record: Task) => (
        <FileOutlined onClick={() => { setId(record.id); setIsModalOpen(true); }} />
      ),
    },
  ];
  
  const fetchTasks = async () => {
    const tasks = await getTasks(user?.id || '');
    setTasks(tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <Table
        scroll={{ x: 800 }}
        title={() => (
          <div className={styles.header}>
            <h2 className={styles.title}>{t("menu.myRequests")}</h2>
            <Button type="primary" onClick={() => setIsCreationModalOpen(true)}>
              {t("taskCreation.modalTitle")}
            </Button>
          </div>
        )}
        rowKey="id"
        size="small"
        dataSource={tasks}
        columns={columns}
        footer={() => {
          const urgentCount = tasks.filter((task) => task.priority === "urgent").length;
          const highCount = tasks.filter((task) => task.priority === "high").length;
          return (
            <Flex align="center" gap={12}>
              <div style={{ fontWeight: 'bold' }}>{t("table.requestCount", { count: tasks.length })}</div>
              <Tag color={priorityTagColors["urgent"]} style={{ margin: 0 }}>
                {t("priority.urgent")}: {urgentCount}
              </Tag>
              <Tag color={priorityTagColors["high"]} style={{ margin: 0 }}>
                {t("priority.high")}: {highCount}
              </Tag>
            </Flex>
          );
        }}
      />
      <TaskById isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} id={id} />
      <TaskCreationModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onSuccess={fetchTasks}
      />
      <ToastContainer />
    </div>
  )
}

export default Tasks