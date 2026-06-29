import { Modal } from "antd";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./addUserModal.module.scss";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { User } from "../../types/user.types";
import { useAppDispatch } from "../../store/hooks";
import { addUser, updateUser } from "../../store/slices/users/userThunk";
import { useTranslation } from "react-i18next";

type AddUserModalProps = {
  isModalOpen: boolean;
  handleCancel: () => void;
  user?: User;
};

export const userSchema = z.object({
  name: z.string().min(2, "addUserModal.nameError"),
  email: z.string().email("addUserModal.emailError"),
  password: z.string().min(6, "addUserModal.passwordError"),
  role: z.enum(["Admin", "Moderator", "Viewer"]),
});

export type UserFormValues = z.infer<typeof userSchema>;

const ROLES: UserFormValues["role"][] = ["Admin", "Moderator", "Viewer"];

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "Moderator",
};

export const AddUserModal = ({
  isModalOpen,
  handleCancel,
  user,
}: AddUserModalProps) => {
  const { t } = useTranslation();
  const notify = () =>
    toast.success(user ? t("addUserModal.updateSuccess") : t("addUserModal.addSuccess"));
  const notifyError = (message: string) => toast.error(message);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!isModalOpen) return;
    reset(
      user
        ? { name: user.name, email: user.email, password: user.password, role: user.role }
        : EMPTY_VALUES
    );
  }, [isModalOpen, user, reset]);

  const onSubmit = (data: UserFormValues) => {
    const payload: User = {
      id: user?.id ?? uuidv4(),
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    };

    const request = user
      ? dispatch(updateUser({ id: user.id, user: payload }))
      : dispatch(addUser(payload));

    request
      .unwrap()
      .then(() => { notify(); reset(); handleCancel(); })
      .catch(() => notifyError(t("addUserModal.genericError")));
  };

  const fieldClass = (hasError: boolean) =>
    hasError ? `${styles.input} ${styles.hasError}` : styles.input;

  return (
    <Modal
      title={user ? t("addUserModal.titleUpdate") : t("addUserModal.titleAdd")}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="user-name">{t("addUserModal.nameLabel")}</label>
          <input
            id="user-name"
            className={fieldClass(!!errors.name)}
            type="text"
            placeholder={t("addUserModal.namePlaceholder")}
            {...register("name")}
          />
          {errors.name && <p className={styles.error}>{t(errors.name.message ?? "addUserModal.nameError")}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="user-email">{t("addUserModal.emailLabel")}</label>
          <input
            id="user-email"
            className={fieldClass(!!errors.email)}
            type="email"
            placeholder={t("addUserModal.emailPlaceholder")}
            {...register("email")}
          />
          {errors.email && <p className={styles.error}>{t(errors.email.message ?? "addUserModal.emailError")}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="user-password">{t("addUserModal.passwordLabel")}</label>
          <input
            id="user-password"
            className={fieldClass(!!errors.password)}
            type="password"
            placeholder={t("addUserModal.passwordPlaceholder")}
            {...register("password")}
          />
          {errors.password && <p className={styles.error}>{t(errors.password.message ?? "addUserModal.passwordError")}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="user-role">{t("addUserModal.roleLabel")}</label>
          <select
            id="user-role"
            className={`${styles.select} ${errors.role ? styles.hasError : ""}`}
            {...register("role")}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errors.role && <p className={styles.error}>{errors.role.message}</p>}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={handleCancel}>
            {t("common.cancel")}
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
            {user ? t("common.update") : t("common.add")}
          </button>
        </div>
      </form>
    </Modal>
  );
};
