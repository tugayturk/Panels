import { useEffect, useState, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  Table, Tag, Tooltip, Typography, Button, Input, Space,
  Flex, Popconfirm, message, Modal, Form,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { useTranslation } from "react-i18next";
import { priorityTagColors } from "../../constants/task.constants";
import { Task, TaskPriority } from "../../types/task.types";
import moment from "moment";
import {
  getPendingRequests,
  getUsers,
  PendingRequestsParams,
} from "../../services/pendingRequest.service";
import { User } from "../../types/user.types";
import {
  CheckOutlined, CloseOutlined, SearchOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import styles from "./PendingRequests.module.scss";
import RequestModal from "../../components/RequestModal";
import {
  approvePendingTask,
  rejectPendingTask,
} from "../../store/slices/pendingRequests/pendingRequestThunk";
import socketService from "../../services/socket.service";
import { toast, ToastContainer } from "react-toastify";

interface DataType {
  title:     string;
  key:       string;
  dataIndex: any;
  createdBy: string;
}

type DataIndex = keyof DataType;

interface ActiveFilters {
  priority:  FilterValue | null;
  category:  FilterValue | null;
  title:     FilterValue | null;
  createdBy: FilterValue | null;
}

// Onay bekleyen taleplerin listelendiği sayfa
export default function PendingRequests() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const canManage = user?.role === "Admin" || user?.role === "Moderator";

  // ── Yerel veri state'i (Redux yerine servis çağrısı) ───────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ── Sunucu filtre parametreleri ────────────────────────────────────
  const [queryParams, setQueryParams] = useState<PendingRequestsParams>({
    _page:    1,
    _per_page: 10,
  });

  // Kontrollü mod: filteredValue sütunlara geri beslenir
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    priority:  null,
    category:  null,
    title:     null,
    createdBy: null,
  });

  // ── Kullanıcı listesi ──────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const getUserNameById = (userId: string) =>
    users.find((u) => u.id === userId)?.name ?? "";

  // ── Arama highlight state'i ────────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // ── Veri çekme (queryParams değişince otomatik tetiklenir) ─────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getPendingRequests(queryParams);
    setTasks(result.data);
    setTotal(result.total);
    setLoading(false);
  }, [queryParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // fetchData'nın her zaman güncel kopyasını tutan ref —
  // socket effect queryParams değişiminde yeniden kurulmasın
  const fetchDataRef = useRef(fetchData);
  useEffect(() => { fetchDataRef.current = fetchData; }, [fetchData]);

  // ── Socket simülasyonu (yalnızca mount/unmount'ta çalışır) ──────────
  useEffect(() => {
    socketService.connect();
    const interval = socketService.simulateNewTask(() => {
      toast.success("Yeni Talep Geldi", {
        autoClose: 3000,
        onClose: () => fetchDataRef.current(),
      });
    });
    return () => { socketService.disconnect(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modal state'leri ───────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [selectedTaskId, setSelectedTaskId]     = useState<string>("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingTaskId, setRejectingTaskId]   = useState<string>("");
  const [rejectForm] = Form.useForm<{ rejectionReason: string }>();
  const rejectReason = Form.useWatch("rejectionReason", rejectForm) ?? "";

  const handleOk     = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const openRejectModal = (id: string) => {
    setRejectingTaskId(id);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    rejectForm
      .validateFields()
      .then(({ rejectionReason }) => {
        handleReject(rejectingTaskId, rejectionReason);
        rejectForm.resetFields();
        setIsRejectModalOpen(false);
      })
      .catch(() => {
        // Validasyon hatası — form zaten hata mesajını gösteriyor, ek işlem gerekmez
      });
  };

  // ── Onayla / Reddet ────────────────────────────────────────────────
  const handleApprove = (id: string) => {
    dispatch(approvePendingTask(id))
      .unwrap()
      .then(() => { message.success(t("pendingRequests.approveSuccess")); fetchData(); })
      .catch(() => message.error(t("pendingRequests.approveError")));
  };

  const handleReject = (id: string, rejectionReason: string) => {
    dispatch(rejectPendingTask({ id, rejectionReason }))
      .unwrap()
      .then(() => { message.success(t("pendingRequests.rejectSuccess")); fetchData(); })
      .catch(() => message.error(t("pendingRequests.rejectError")));
  };

  // ── Kolon arama dropdown'u (Başlık / Kullanıcı) ───────────────────
  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={
            dataIndex === "createdBy"
              ? t("table.searchUser")
              : t("table.searchField", { field: dataIndex })
          }
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            setSearchText((selectedKeys as string[])[0] ?? "");
            setSearchedColumn(dataIndex);
            confirm();
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSearchText((selectedKeys as string[])[0] ?? "");
              setSearchedColumn(dataIndex);
              confirm();
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t("common.search")}
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              setSearchText("");
              setSearchedColumn("");
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            {t("common.reset")}
          </Button>
          <Button type="link" size="small" onClick={() => {
            confirm({ closeDropdown: false });
            setSearchText((selectedKeys as string[])[0] ?? "");
            setSearchedColumn(dataIndex);
          }}>
            {t("common.filter")}
          </Button>
          <Button type="link" size="small" onClick={close}>
            {t("common.close")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) setTimeout(() => searchInput.current?.select(), 100);
      },
    },
  });

  // ── Tablo onChange: filtreler + sayfalama → queryParams güncellenir ─
  const toFilter = (vals: FilterValue | null): string[] | undefined => {
    if (!vals || vals.length === 0) return undefined;
    return vals as string[];
  };

  const onChange: TableProps<Task>["onChange"] = (pagination, filters) => {
    // Kullanıcı adı → kullanıcı ID'lerine çevir (kullanıcı adına göre servis araması)
    const userSearch = filters.createdBy?.[0] as string | undefined;
    const matchedUserIds = userSearch
      ? users
          .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()))
          .map((u) => u.id)
      : undefined;

    setActiveFilters({
      priority:  filters.priority  ?? null,
      category:  filters.category  ?? null,
      title:     filters.title     ?? null,
      createdBy: filters.createdBy ?? null,
    });

    setQueryParams((prev) => ({
      ...prev,
      priority:   toFilter(filters.priority),
      category:   toFilter(filters.category),
      q: (filters.title?.[0] as string) || undefined,
      // kullanıcı adı eşleşen ID listesi yoksa veya boşsa filtre gönderme
      createdBy:  matchedUserIds?.length ? matchedUserIds : undefined,
      _page:     pagination.current   ?? 1,
      _per_page: pagination.pageSize  ?? 10,
    }));
  };

  // ── Sütun tanımları ────────────────────────────────────────────────
  const columns: ColumnsType<any> = [
    {
      title:        t("table.user"),
      dataIndex:    "createdBy",
      key:          "createdBy",
      filteredValue: activeFilters.createdBy,
      ...getColumnSearchProps("createdBy"),
      render: (_: string, row: Task) => {
        const name = getUserNameById(row.createdBy);
        return searchedColumn === "createdBy" ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={name}
          />
        ) : (
          <span>{name}</span>
        );
      },
    },
    {
      title:        t("table.title"),
      dataIndex:    "title",
      key:          "title",
      filteredValue: activeFilters.title,
    //  ...getColumnSearchProps("title"),
      render: (title: string, row: Task) => (
        <Tooltip title={row.description}>
          <div>
            {searchedColumn === "title" ? (
              <Highlighter
                highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={title ?? ""}
              />
            ) : (
              title
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title:        t("table.category"),
      dataIndex:    "category",
      key:          "category",
      filteredValue: activeFilters.category,
      filters: [
        { text: t("category.technicalSupport"), value: "Teknik Destek" },
        { text: t("category.leaveRequest"),     value: "İzin Talebi" },
        { text: t("category.purchase"),         value: "Satın Alma" },
        { text: t("category.other"),            value: "Diğer" },
      ],
    },
    {
      title:        t("table.priority"),
      dataIndex:    "priority",
      key:          "priority",
      filteredValue: activeFilters.priority,
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{t(`priority.${priority}`)}</Tag>
      ),
      filters: [
        { text: t("priority.low"),    value: "low" },
        { text: t("priority.normal"), value: "normal" },
        { text: t("priority.high"),   value: "high" },
        { text: t("priority.urgent"), value: "urgent" },
      ],
    },
    {
      title:     t("table.createdAt"),
      dataIndex: "createdAt",
      key:       "createdAt",
      render: (date: string) => (
        <div>{moment(date).format("DD/MM/YYYY HH:mm")}</div>
      ),
    },
    {
      title:     t("table.actions"),
      dataIndex: "incele",
      key:       "incele",
      render: (_: string, record: Task) => (
        <div style={{ display: "flex", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title={!canManage ? t("common.noPermission") : ""}>
            <Popconfirm
              title={t("pendingRequests.approveConfirm")}
              icon={<CheckCircleOutlined style={{ color: "green" }} />}
              onConfirm={() => handleApprove(record.id)}
              disabled={!canManage}
            >
              <CheckOutlined
                style={{ color: canManage ? "green" : "#d9d9d9", cursor: canManage ? "pointer" : "not-allowed" }}
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title={!canManage ? t("common.noPermission") : ""}>
            <CloseOutlined
              style={{ color: canManage ? "red" : "#d9d9d9", cursor: canManage ? "pointer" : "not-allowed" }}
              onClick={() => canManage && openRejectModal(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div>
      <h2>{t("pendingRequests.pageTitle")}</h2>
      <p>{t("pendingRequests.pageSubtitle")}</p>
      <Table
        loading={loading}
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        size="small"
        scroll={{ x: 900 }}
        className={styles.table}
        onChange={onChange}
          pagination={{
            current:  queryParams._page,
            pageSize: queryParams._per_page,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (tot, range) =>
              t("pendingRequests.paginationTotal", { start: range[0], end: range[1], total: tot }),
          }}
          footer={() => {
            const urgentCount = tasks.filter((t) => t.priority === "urgent").length;
            const highCount   = tasks.filter((t) => t.priority === "high").length;
            return (
              <Flex align="center" gap={12}>
                <Typography.Text strong>
                  {t("pendingRequests.footerTotal", { count: total })}
                </Typography.Text>
                <Tag color={priorityTagColors["urgent"]} style={{ margin: 0 }}>
                  {t("priority.urgent")}: {urgentCount}
                </Tag>
                <Tag color={priorityTagColors["high"]} style={{ margin: 0 }}>
                  {t("priority.high")}: {highCount}
                </Tag>
              </Flex>
            );
          }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedTaskId(record.id);
              setIsModalOpen(true);
            },
          })}
        />

        <RequestModal
          isModalOpen={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
          id={selectedTaskId}
        />

        <Modal
          title={t("pendingRequests.rejectModalTitle")}
          open={isRejectModalOpen}
          onOk={handleRejectConfirm}
          onCancel={() => { setIsRejectModalOpen(false); rejectForm.resetFields(); }}
          okText={t("common.reject")}
          cancelText={t("common.cancel")}
          okButtonProps={{ danger: true, disabled: rejectReason.trim().length < 3 }}
        >
          <Form form={rejectForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="rejectionReason"
              rules={[
                { required: true, message: t("pendingRequests.rejectReasonRequired") },
                { min: 3, message: t("pendingRequests.rejectReasonMinLength") },
              ]}
            >
              <Input.TextArea rows={4} placeholder={t("pendingRequests.rejectReasonPlaceholder")} />
            </Form.Item>
          </Form>
        </Modal>

        <ToastContainer />
      </div>
  );
}
