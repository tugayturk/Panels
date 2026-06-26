import { Descriptions, Modal, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  categoryTextColors,
  priorityLabels,
  priorityTagColors,
  statusLabels,
  statusTagColors,
} from "../../constants/task.constants";
import { getTaskById } from "../../services/task.service";
import { Task, TaskPriority, TaskStatus } from "../../types/task.types";
import styles from "./taskById.module.scss";

type TaskByIdProps = {
  isModalOpen: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  id: string;
};

const TaskById = ({
  isModalOpen,
  handleOk,
  handleCancel,
  id,
}: TaskByIdProps) => {
  const [data, setData] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen || !id) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getTaskById(id);
        setData(response);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isModalOpen]);

  return (
    <Modal
      title={data?.title ?? "Talep Detayı"}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Kapat"
      cancelButtonProps={{ style: { display: "none" } }}
      width={560}
    >
      {loading ? (
        <div className={styles.loading}>
          <Spin />
        </div>
      ) : (
        data && (
          <div className={styles.content}>
            <div className={styles.descriptionBox}>
              <Typography.Text type="secondary" className={styles.label}>
                Açıklama
              </Typography.Text>
              <Typography.Paragraph className={styles.description}>
                {data.description}
              </Typography.Paragraph>
            </div>

            <Descriptions
              bordered
              column={1}
              size="small"
              className={styles.descriptions}
            >
              <Descriptions.Item label="Öncelik">
                <Tag color={priorityTagColors[data.priority]}>
                  {priorityLabels[data.priority]}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Kategori">
                <span style={{ color: categoryTextColors[data.category] }}>
                  {data.category}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Durum">
                <Tag color={statusTagColors[data.status]}>
                  {statusLabels[data.status]}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Oluşturulma">
                {moment(data.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {data.updatedAt && (
                <Descriptions.Item label="Güncellenme">
                  {moment(data.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Oluşturan">
                {data.createdBy}
              </Descriptions.Item>

              {data.status === "rejected" && data.rejectionReason && (
                <Descriptions.Item label="Red Nedeni">
                  <span className={styles.rejectionReason}>
                    {data.rejectionReason}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )
      )}
    </Modal>
  );
};

export default TaskById;
