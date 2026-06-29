import { useEffect, useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '../../types/task.types';
import { getRequests, RequestsParams } from '../../services/requests.service';
import { Loading } from '../../components/Loading';
import { Table, Tag, Tooltip, Button, Space, DatePicker } from 'antd';
import { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import { priorityTagColors, statusTagColors } from '../../constants/task.constants';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import RequestModal from '../../components/RequestModal';
import { User } from '../../types/user.types';
import { getUsers } from '../../services/pendingRequest.service';
import { CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

// Ant Design filteredValue'nun bildiği tip
interface ActiveFilters {
  status:    FilterValue | null;
  priority:  FilterValue | null;
  createdAt: FilterValue | null;
}

const AllTasks = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  // Sunucu tarafı filtre / sayfalama parametreleri
  const [queryParams, setQueryParams] = useState<RequestsParams>({
    _page: 1,
    _per_page: 10,
  });

  // Kontrollü mod: filteredValue sütunlara geri beslenir; böylece
  // farklı sütun filtrelerini aynı anda etkin tutabiliyoruz
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status:    null,
    priority:  null,
    createdAt: null,
  });

  const getUserNameById = (userId: string) =>
    users.find((user) => user.id === userId)?.name ?? "";

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers();
      setUsers(users);
    };
    fetchUsers();
  }, []);

  const handleOk = () => { setIsModalOpen(false); };
  const handleCancel = () => { setIsModalOpen(false); };

  // queryParams değiştiğinde servisi çağır
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getRequests(queryParams);
      setData(result.data);
      setTotal(result.total);
      setIsLoading(false);
    };
    fetchData();
  }, [queryParams]);

  const columns: ColumnsType<Task> = [
    {
      title: t("table.user"),
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: string, row: Task) => (
        <span>{getUserNameById(row.createdBy)}</span>
      ),
    },
    {
      title: t("table.title"),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, row: Task) => (
        <Tooltip title={row.description}>
          <div>{title}</div>
        </Tooltip>
      ),
    },
    {
      title: t("table.category"),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <span>{category}</span>
      ),
    },
    {
      title: t("table.priority"),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={priorityTagColors[priority]}>{t(`priority.${priority}`)}</Tag>
      ),
      filteredValue: activeFilters.priority,
      filters: [
        { text: t("priority.low"), value: 'low' },
        { text: t("priority.normal"), value: 'normal' },
        { text: t("priority.high"), value: 'high' },
        { text: t("priority.urgent"), value: 'urgent' },
      ],
    },
    {
      title: t("table.status"),
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={statusTagColors[status]}>{t(`status.${status}`)}</Tag>
      ),
      filteredValue: activeFilters.status,
      filters: [
        { text: t("status.pending"),  value: 'pending' },
        { text: t("status.approved"), value: 'approved' },
        { text: t("status.rejected"), value: 'rejected' },
      ],
    },
    {
      title: t("table.requestDate"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      filteredValue: activeFilters.createdAt,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <DatePicker
            format="DD/MM/YYYY"
            placeholder={t("table.selectDate")}
            value={selectedKeys[0] ? (selectedKeys[0] as unknown as Dayjs) : null}
            onChange={(date) => setSelectedKeys(date ? [date as unknown as string] : [])}
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
              style={{ width: 90 }}
            >
              {t("common.filter")}
            </Button>
            <Button
              size="small"
              onClick={() => { clearFilters?.(); confirm(); }}
              style={{ width: 90 }}
            >
              {t("common.reset")}
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <CalendarOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      render: (date: string) => (
        <div>{moment(date).format('DD/MM/YYYY')}</div>
      ),
    },
  ];

  // Dizi filtrelerini servis parametresine çevir: null/[] → undefined, dolu dizi → string[]
  const toFilter = (vals: FilterValue | null): string[] | undefined => {
    if (!vals || vals.length === 0) return undefined;
    return vals as string[];
  };

  // Ant Design Table onChange → activeFilters + queryParams güncellenir → useEffect fetch'i tetikler
  const onChange: TableProps<Task>['onChange'] = (pagination, filters, sorter) => {
    const dateValue = filters.createdAt?.[0] as unknown as Dayjs | null | undefined;

    // filteredValue geri beslemesi için aktif filtre state'ini güncelle
    setActiveFilters({
      status:    filters.status    ?? null,
      priority:  filters.priority  ?? null,
      createdAt: filters.createdAt ?? null,
    });

    setQueryParams((prev) => {
      const next: RequestsParams = {
        ...prev,
        // null gelirse filtre kaldırılmış demektir → undefined (query'ye gönderilmez)
        status:   toFilter(filters.status),
        priority: toFilter(filters.priority),
        createdAt_gte: dateValue
          ? dateValue.startOf('day').toISOString()
          : undefined,
        createdAt_lte: dateValue
          ? dateValue.endOf('day').toISOString()
          : undefined,
        _page:     pagination.current  ?? 1,
        _per_page: pagination.pageSize ?? 10,
      };

      // Sıralama
      if (sorter && !Array.isArray(sorter) && sorter.field) {
        next._sort = sorter.order === 'descend'
          ? `-${sorter.field as string}`
          : (sorter.field as string);
      } else {
        delete next._sort;
      }

      return next;
    });
  };

  return (
    isLoading ? <Loading /> : (
      <div>
        <h3>{t("allRequests.pageTitle")}</h3>
        <Table dataSource={data}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 900 }}
          onChange={onChange}
          pagination={{
            current:     queryParams._page,
            pageSize:    queryParams._per_page,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (t_total, range) => t("allRequests.paginationTotal", { start: range[0], end: range[1], total: t_total }),
          }}
          footer={() => (
            <div>
              <Tag style={{ marginRight: '10px', color: '#52c41a' }} color="green">
                {t("allRequests.footerApproved", { count: data.filter((task) => task.status === 'approved').length })}
              </Tag>
              <Tag style={{ marginRight: '10px', color: '#ff4d4f' }} color="red">
                {t("allRequests.footerRejected", { count: data.filter((task) => task.status === 'rejected').length })}
              </Tag>
              <Tag style={{ marginRight: '10px', color: '#faad14' }} color="yellow">
                {t("allRequests.footerPending", { count: data.filter((task) => task.status === 'pending').length })}
              </Tag>
            </div>
          )}
          onRow={(record) => ({
            onClick: () => {
              setId(record.id);
              setIsModalOpen(true);
            },

          })} />
        <RequestModal isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} id={id} />
      </div>
    )
  )
}

export default AllTasks