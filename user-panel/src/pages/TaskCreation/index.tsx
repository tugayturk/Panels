import { Card, Form } from "antd";
import { ToastContainer } from "react-toastify";
import styles from "./taskCreation.module.scss";
import { useTranslation } from "react-i18next";
import TaskCreationForm, { TaskCreationFieldType } from "../../components/TaskCreationForm";

const TaskCreation = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TaskCreationFieldType>();

  return (
    <Card title={t("taskCreation.pageTitle")} className={styles.card}>
      <TaskCreationForm form={form} />
      <ToastContainer />
    </Card>
  );
};

export default TaskCreation;
