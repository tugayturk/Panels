import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import PendingRequests from ".";
import authReducer from "../../store/slices/authSlice";
import pendingRequestsReducer from "../../store/slices/pendingRequests/pendingRequestSlice";
import * as pendingService from "../../services/pendingRequest.service";
import { Task } from "../../types/task.types";

// ──────────────────────────────────────────────
// Yardımcı mock'lar
// ──────────────────────────────────────────────

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        "pendingRequests.pageTitle":   "Bekleyen Talepler",
        "pendingRequests.pageSubtitle":"Onay bekleyen talepler",
        "table.user":      "Kullanıcı",
        "table.title":     "Başlık",
        "table.category":  "Kategori",
        "table.priority":  "Öncelik",
        "table.actions":   "İşlemler",
      };
      return map[key] ?? key;
    },
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

// Ant Design — sadece bu testte kullanılan bileşenler mock'lanır
jest.mock("antd", () => {
  const React = require("react");
  const mockForm: any = Object.assign(
    ({ children, onFinish }: any) =>
      React.createElement("form", { onSubmit: (e: any) => { e.preventDefault(); onFinish?.(); } }, children),
    {
      Item: ({ children, label }: any) =>
        React.createElement("div", null, label, children),
      useForm: () => [{ resetFields: jest.fn(), validateFields: jest.fn().mockResolvedValue({}), setFieldsValue: jest.fn() }],
    }
  );
  return {
    Table: ({ columns, dataSource, loading: tableLoading }: any) =>
      React.createElement(
        "div",
        { "data-testid": "pending-table" },
        tableLoading
          ? React.createElement("span", null, "loading")
          : React.createElement(
              "table",
              null,
              React.createElement(
                "thead",
                null,
                React.createElement(
                  "tr",
                  null,
                  columns?.map((c: any) =>
                    React.createElement("th", { key: c.key }, c.title)
                  )
                )
              ),
              React.createElement(
                "tbody",
                null,
                dataSource?.map((row: any) =>
                  React.createElement(
                    "tr",
                    { key: row.id, "data-testid": "table-row" },
                    React.createElement("td", null, row.title)
                  )
                )
              )
            )
      ),
    Tag:        ({ children }: any) => React.createElement("span", null, children),
    Tooltip:    ({ children }: any) => React.createElement(React.Fragment, null, children),
    Typography: {
      Title: ({ children }: any) => React.createElement("h2", null, children),
      Text:  ({ children }: any) => React.createElement("span", null, children),
    },
    Button:     ({ children, onClick }: any) => React.createElement("button", { onClick }, children),
    Input:      Object.assign(
      ({ placeholder, onChange }: any) =>
        React.createElement("input", { placeholder, onChange }),
      {
        Search: ({ placeholder, onSearch }: any) =>
          React.createElement("input", { placeholder, onChange: (e: any) => onSearch?.(e.target.value) }),
        TextArea: ({ placeholder, rows }: any) =>
          React.createElement("textarea", { placeholder, rows }),
      }
    ),
    Space:      ({ children }: any) => React.createElement("div", null, children),
    Flex:       ({ children }: any) => React.createElement("div", null, children),
    Popconfirm: ({ children }: any) => React.createElement(React.Fragment, null, children),
    message:    { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
    Modal:      ({ children, open, title }: any) =>
      open ? React.createElement("div", { role: "dialog" }, title, children) : null,
    Form:       mockForm,
    ConfigProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

// RequestModal ve Loading bileşenlerinin kendi antd bağımlılıklarını yoksay
jest.mock("../../components/RequestModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../components/Loading", () => ({
  Loading: () => null,
}));

// Highlight bileşeni
jest.mock("react-highlight-words", () => ({
  __esModule: true,
  default: ({ textToHighlight }: any) => textToHighlight,
}));

// Kullanıcı servisi — varsayılan değer beforeEach içinde ayarlanır
jest.mock("../../services/pendingRequest.service", () => ({
  getPendingRequests: jest.fn(),
  getUsers:           jest.fn().mockResolvedValue([]),
  approveTask:        jest.fn(),
  rejectTask:         jest.fn(),
}));

// ──────────────────────────────────────────────
// Test verileri & kurulum
// ──────────────────────────────────────────────

const mockTasks: Task[] = [
  { id: "1", title: "Teknik Destek Talebi", category: "Teknik Destek",
    priority: "high",   status: "pending", description: "", createdBy: "u1", createdAt: "2024-01-15T10:00:00Z" },
  { id: "2", title: "İzin Talebi",          category: "İzin Talebi",
    priority: "normal", status: "pending", description: "", createdBy: "u2", createdAt: "2024-01-16T09:00:00Z" },
];

// Varsayılan: thunk çağrıldığında mockTasks döner
beforeEach(() => {
  (pendingService.getPendingRequests as jest.Mock).mockResolvedValue(mockTasks);
});

const buildStore = (tasks = mockTasks) =>
  configureStore({
    reducer: { auth: authReducer, pendingRequests: pendingRequestsReducer },
    preloadedState: {
      auth: {
        user: { id: "1", name: "Admin", email: "a@test.com", role: "Admin" as const },
        error: null,
      },
      pendingRequests: { tasks, loading: false, error: null },
    },
  });

const renderPage = (tasks = mockTasks) =>
  render(
    <Provider store={buildStore(tasks)}>
      <MemoryRouter>
        <PendingRequests />
      </MemoryRouter>
    </Provider>
  );

// ──────────────────────────────────────────────
// Testler
// ──────────────────────────────────────────────

test("sayfa başlığı görünür", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByText("Bekleyen Talepler")).toBeInTheDocument()
  );
});

test("tablo render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("pending-table")).toBeInTheDocument()
  );
});

test("tablo sütun başlıkları görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Kullanıcı")).toBeInTheDocument();
    expect(screen.getByText("Başlık")).toBeInTheDocument();
    expect(screen.getByText("Öncelik")).toBeInTheDocument();
  });
});

test("mock görevler tabloda görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Teknik Destek Talebi")).toBeInTheDocument();
    expect(screen.getByText("İzin Talebi")).toBeInTheDocument();
  });
});

test("boş veriyle tablo satır içermez", async () => {
  // Bu test için thunk da boş liste dönsün
  (pendingService.getPendingRequests as jest.Mock).mockResolvedValueOnce([]);
  renderPage([]);
  await waitFor(() =>
    expect(screen.getByTestId("pending-table")).toBeInTheDocument()
  );
  expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
});
