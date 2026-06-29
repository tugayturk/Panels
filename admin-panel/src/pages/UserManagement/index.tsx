import { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import { Button, Popconfirm, Table, Tooltip } from "antd";
import { User } from "../../types/user.types";
import { ColumnsType } from "antd/es/table";
import styles from "./UserManagement.module.scss";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { AddUserModal } from "./addUserModal";
import { toast, ToastContainer } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteUser, getUsers } from "../../store/slices/users/userThunk";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.user);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message);

  const handleDeleteUser = (id: string) => {
    dispatch(deleteUser(id))
      .unwrap()
      .then(() => notify(t("userManagement.deleteSuccess")))
      .catch((error: Error) => notifyError(error.message));
  };

  // Sadece düzenleme modalını açar; asıl güncelleme modal submit'inde yapılır
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: t("table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("table.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("table.role"),
      dataIndex: "role",
      key: "role",
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: 50,
      render: (_text: string, record: User) => (
        <div className={styles.actions}>
          <Popconfirm
            title={t("userManagement.deleteConfirmTitle")}
            description={t("userManagement.deleteConfirmDesc")}
            onConfirm={() => handleDeleteUser(record.id)}
            onCancel={() => { }}
            okText={t("common.yes")}
            cancelText={t("common.no")}
          >
            <Tooltip title={t("userManagement.deleteTooltip")}>
              <DeleteOutlined style={{ color: 'red', fontSize: '16px' }} />
            </Tooltip>
          </Popconfirm>
          <Tooltip title={t("userManagement.updateTooltip")}>
            <EditOutlined
              style={{ color: 'green', fontSize: '16px' }}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h3>{t("userManagement.pageTitle")}</h3>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          className={styles.button}
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
        >
          {t("userManagement.addUser")}
        </Button>
      </div>
      <Table rowKey="id" dataSource={users} columns={columns} scroll={{ x: 600 }} size="small" />
      <AddUserModal
        isModalOpen={isModalOpen}
        handleCancel={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser ?? undefined}
      />
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default UserManagement;
