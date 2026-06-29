import { Button, Form, Input } from "antd";
import type { FormInstance } from "antd";
import { categoryOptions, priorityOptions } from "../../constants/taskOptions";
import type { Task, TaskPriority } from "../../types/task.types";
import { Bounce, toast } from "react-toastify";
import { useAppSelector } from "../../store/hooks";
import { v4 as uuidv4 } from "uuid";
import { createTask } from "../../services/task.service";
import { useTranslation } from "react-i18next";
import ColoredSelect from "../ColoredSelect";

export type TaskCreationFieldType = {
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
};

type TaskCreationFormProps = {
  /** Form instance — dışarıdan Form.useForm() ile üretilir */
  form: FormInstance<TaskCreationFieldType>;
  /** Başarılı kayıt sonrası çağrılır (tablo yenile vb.) */
  onSuccess?: () => void;
  /** Başarılı kayıt sonrası çağrılır (modal kapat vb.) */
  onClose?: () => void;
  /** İptal butonu gösterilsin mi? (modal için true, sayfa için false) */
  showCancel?: boolean;
  /** Submit buton etiketi — varsayılan: common.submit */
  submitLabel?: string;
};

const TaskCreationForm = ({
  form,
  onSuccess,
  onClose,
  showCancel = false,
  submitLabel,
}: TaskCreationFormProps) => {
  const { t } = useTranslation();
  const { TextArea } = Input;
  const user = useAppSelector((state) => state.auth.user);

  const onFinish = async (values: TaskCreationFieldType) => {
    const data: Task = {
      id: uuidv4(),
      title: values.title,
      description: values.description,
      priority: values.priority,
      category: values.category,
      status: "pending",
      createdBy: user!.id,
      createdAt: new Date().toISOString(),
    };

    try {
      await createTask(data);
    } catch {
      toast.error(t("taskCreation.errorToast"), {
        position: "top-right",
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    toast.success(t("taskCreation.successToast"), {
      position: "top-right",
      autoClose: 1999,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      transition: Bounce,
    });

    form.resetFields();
    onSuccess?.();
    onClose?.();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  return (
    <Form<TaskCreationFieldType>
      form={form}
      name="task-creation"
      layout="vertical"
      autoComplete="off"
      onFinish={onFinish}
    >
      <Form.Item
        label={t("taskCreation.titleLabel")}
        name="title"
        rules={[{ required: true, message: t("taskCreation.titleRequired") }]}
      >
        <Input placeholder={t("taskCreation.titlePlaceholder")} />
      </Form.Item>

      <Form.Item
        label={t("taskCreation.descLabel")}
        name="description"
        rules={[{ required: true, message: t("taskCreation.descRequired") }]}
      >
        <TextArea rows={4} placeholder={t("taskCreation.descPlaceholder")} />
      </Form.Item>

      <Form.Item
        name="priority"
        label={t("table.priority")}
        rules={[{ required: true, message: t("priority.selectRequired") }]}
      >
        <ColoredSelect
          options={priorityOptions}
          placeholder={t("priority.selectPlaceholder")}
        />
      </Form.Item>

      <Form.Item
        name="category"
        label={t("table.category")}
        rules={[{ required: true, message: t("category.selectRequired") }]}
      >
        <ColoredSelect
          options={categoryOptions}
          placeholder={t("category.selectPlaceholder")}
        />
      </Form.Item>

      <Form.Item
        style={{ marginBottom: 0, textAlign: showCancel ? "right" : undefined }}
      >
        <Button type="primary" htmlType="submit" style={{ marginRight: showCancel ? 8 : 0 }}>
          {submitLabel ?? t("common.submit")}
        </Button>
        {showCancel && (
          <Button onClick={handleCancel}>{t("common.cancel")}</Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default TaskCreationForm;
