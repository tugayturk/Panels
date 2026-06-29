import { Descriptions, Modal, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  categoryTextColors,
  priorityTagColors,
  statusTagColors,
} from "../../constants/task.constants";
import { useTranslation } from "react-i18next";
import { getTaskById } from "../../services/task.service";
import { Task } from "../../types/task.types";
import styles from "./taskById.module.scss";

type TaskByIdProps = {
  isModalOpen: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  id: string;
};

// Talep detayını modal içinde gösterir — yalnızca modal açıkken API çağrısı yapar
const TaskById = ({
  isModalOpen,
  handleOk,
  handleCancel,
  id,
}: TaskByIdProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Modal kapalı veya id yoksa gereksiz istek atma
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
      title={data?.title ?? t("taskDetail.modalTitle")}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t("common.close")}
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
                {t("taskDetail.description")}
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
              <Descriptions.Item label={t("taskDetail.priority")}>
                <Tag color={priorityTagColors[data.priority]}>
                  {t(`priority.${data.priority}`)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t("taskDetail.category")}>
                <span style={{ color: categoryTextColors[data.category] }}>
                  {data.category}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label={t("taskDetail.status")}>
                <Tag color={statusTagColors[data.status]}>
                  {t(`status.${data.status}`)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t("taskDetail.createdAt")}>
                {moment(data.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {data.updatedAt && (
                <Descriptions.Item label={t("taskDetail.updatedAt")}>
                  {moment(data.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}

              {data.status === "rejected" && data.rejectionReason && (
                <Descriptions.Item label={t("taskDetail.rejectionReason")}>
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
