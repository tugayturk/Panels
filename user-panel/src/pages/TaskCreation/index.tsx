import { Button, Card, Form, Input, Select, Radio, Checkbox, GetProp} from "antd";
import type { SelectOption } from "../../constants/taskOptions";
import {
  categoryOptions,
  priorityOptions,
} from "../../constants/taskOptions";
import type { Task, TaskPriority } from "../../types/task.types";
import { Bounce, toast,ToastContainer } from "react-toastify";
import styles from "./taskCreation.module.scss"
import { useAppSelector } from "../../store/hooks";
import { v4 as uuidv4 } from 'uuid';
import { createTask } from "../../services/task.service";
type FieldType = {
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
};

type ColoredSelectProps = {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

function ColoredSelect({
  options,
  placeholder = "Seçiniz",
  value,
  onChange,
}: ColoredSelectProps) {
  const findOption = (selectedValue: string) =>
    options.find((option) => option.value === selectedValue);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options.map(({ value: optionValue, label, color }) => ({
        value: optionValue,
        label,
        color,
      }))}
      optionRender={({ data }) => (
        <span style={{ color: data.color as string }}>{data.label as string}</span>
      )}
      labelRender={({ value: selectedValue }) => {
        const option = findOption(selectedValue as string);
        return option ? (
          <span style={{ color: option.color }}>{option.label}</span>
        ) : (
          selectedValue
        );
      }}
    />
  );
}

const TaskCreation = () => {

  const { TextArea } = Input;
  const user = useAppSelector((state) => state.auth.user);
  console.log(user,"user");

  const notify = () => toast.success("Talep başarıyla oluşturuldu!",{
    position: "top-right",
    autoClose: 1999,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
    });
  const onFinish = async (values: FieldType) => {

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
    const response = await createTask(data);
    console.log(response,"response");
    console.log(data,"data");

    notify();
  };

  return (
    <Card title="Talep Oluştur" className={styles.card}>
      <Form<FieldType>
        name="task-creation"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
        onFinish={onFinish}
        className={styles.form}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input your title!" }]}
        >
          <Input placeholder="Talep Başlığı" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input your description!" }]}
        >
          <TextArea rows={4} placeholder="Talep Açıklaması" />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Öncelik"
          rules={[{ required: true, message: "Öncelik seçiniz" }]}
        >
          <ColoredSelect options={priorityOptions} placeholder="Öncelik seçiniz" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Kategori"
          rules={[{ required: true, message: "Kategori seçiniz" }]}
        >
          <ColoredSelect options={categoryOptions} placeholder="Kategori seçiniz" />
         
        </Form.Item>

        <Form.Item label={null} className={styles.submitItem}>
          <Button type="primary" htmlType="submit" className={styles.button}>
            Submit
          </Button>
        </Form.Item>
      </Form>
      <ToastContainer
       />
    </Card>
  );
};

export default TaskCreation;
