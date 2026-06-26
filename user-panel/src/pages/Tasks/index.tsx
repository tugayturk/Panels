import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import {
  priorityLabels,
  priorityTagColors,
  statusLabels,
  statusTagColors,
} from "../../constants/task.constants";
import { getTasks } from "../../services/task.service";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import { Table, Tag,Modal, Button } from "antd";
import { useAppSelector } from "../../store/hooks";
import moment from "moment";
import TaskById from "./taskById";
import styles from "./task.module.scss";


const Tasks = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAppSelector((state) => state.auth);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  const columns: ColumnsType<Task> = [
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{priorityLabels[priority]}</Tag>
      ),
        },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filters: [
        {
          text: 'Bekliyor',
          value: 'pending',
        },
        {
          text: 'Onaylandı',
          value: 'approved',
        },
        {
          text: 'Reddedildi',
          value: 'rejected',
        },
      ],
      onFilter: (value, record) => record.status.indexOf(value as string) === 0,
      render: (status: TaskStatus) => (
        <Tag color={statusTagColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) =>
       <div className={styles.date}>{moment(date).format('DD/MM/YYYY HH:mm')}</div>
    },
    {
      title: 'İncele',
      dataIndex: 'incele',
      key: 'incele',
      render: (text: string, record: Task) => (
        <Button size="small" type="primary" onClick={() => {setId(record.id); setIsModalOpen(true)}}>İncele</Button>
      ),
    },
  ];
  
  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks(user?.id || '');
      setTasks(tasks);
      console.log(tasks);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <Table
        title={() => (
          <div className={styles.header}>
            <h2 className={styles.title}>Talepler</h2>
            <Button type="primary" onClick={() => navigate("/talep-olustur")}>
              Talep Oluştur
            </Button>
          </div>
        )}
        rowKey="id"
        size="middle"
        dataSource={tasks}
        columns={columns}
      />
      <TaskById isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} id={id} />
    </div>
  )
}

export default Tasks