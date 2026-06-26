import { useEffect, useState } from "react";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  priorityLabels,
  priorityTagColors,
  statusLabels,
  statusTagColors,
} from "../../constants/task.constant";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import moment from "moment";
import { getPendingRequests } from "../../services/pendingRequest.service";


export default function PendingRequests() {
  const [data, setData] = useState<Task[]>([]);

  const columns: ColumnsType<Task> = [
    {
        title: "Başlık",
        dataIndex: "title",
        key: "title",
    },
    {
        title: "Açıklama",
        dataIndex: "description",
        key: "description",
    },
    {
        title: "Öncelik",
        dataIndex: "priority",
        key: "priority",
        render: (priority: TaskPriority) => (
          <Tag color={priorityTagColors[priority]}>
            {priorityLabels[priority]}
          </Tag>
        ),
    },
    {
        title: "Durum",
        dataIndex: "status",
        key: "status",
        render: (status: TaskStatus) => (
          <Tag color={statusTagColors[status]}>
            {statusLabels[status]}
          </Tag>
        ),
    },
    {
        title: "Oluşturulma",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => (
            <div>{moment(date).format("DD/MM/YYYY HH:mm")}</div>
        ),
    },
    {
        title: "İncele",
        dataIndex: "incele",
        key: "incele",
    },
];

useEffect(() => {
    const fetchDashboardData = async () => {
        const data = await getPendingRequests();
        setData(data);
    };
    fetchDashboardData();
}, []);
  return (
    <div>
      <h2>Talepler</h2>
      <p>Onay bekleyen talepler burada listelenecek.</p>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        size="small"
        title={() => (
          <div>
            <Typography.Text strong>Bekleyen Talepler: {data.length}</Typography.Text>
          </div>
        )}
      />
    </div>
  );
}
