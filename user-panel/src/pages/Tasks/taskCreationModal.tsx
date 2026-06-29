import { Form, Modal } from "antd";
import { useTranslation } from "react-i18next";
import TaskCreationForm, { TaskCreationFieldType } from "../../components/TaskCreationForm";

type TaskCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const TaskCreationModal = ({ isOpen, onClose, onSuccess }: TaskCreationModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TaskCreationFieldType>();

  return (
    <Modal
      title={t("taskCreation.modalTitle")}
      open={isOpen}
      onCancel={() => { form.resetFields(); onClose(); }}
      footer={null}
      width="min(560px, calc(100vw - 32px))"
      destroyOnHidden
    >
      <div style={{ marginTop: 16 }}>
        <TaskCreationForm
          form={form}
          onSuccess={onSuccess}
          onClose={onClose}
          showCancel
          submitLabel={t("common.create")}
        />
      </div>
    </Modal>
  );
};

export default TaskCreationModal;
