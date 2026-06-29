import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Tasks from ".";
import authReducer from "../../store/slices/authSlice";
import { Task } from "../../types/task.types";
import * as taskService from "../../services/task.service";

jest.mock("antd", () => {
  const React = require("react");
  return {
    Table:   ({ columns, dataSource }: any) =>
      React.createElement("table", { "data-testid": "tasks-table" },
        React.createElement("thead", null,
          React.createElement("tr", null,
            columns?.map((c: any) => React.createElement("th", { key: c.key }, c.title))
          )
        ),
        React.createElement("tbody", null,
          dataSource?.map((row: any) =>
            React.createElement("tr", { key: row.id, "data-testid": "table-row" },
              React.createElement("td", null, row.title)
            )
          )
        )
      ),
    Button:  ({ children, onClick, icon }: any) =>
      React.createElement("button", { onClick }, icon, children),
    Tag:     ({ children }: any) => React.createElement("span", null, children),
    Tooltip: ({ children }: any) => React.createElement(React.Fragment, null, children),
    Flex:    ({ children }: any) => React.createElement("div", null, children),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      ({
        "table.title":                  "Başlık",
        "table.category":               "Kategori",
        "table.priority":               "Öncelik",
        "table.status":                 "Durum",
        "table.createdAt":              "Tarih",
        "table.detail":                 "Detay",
        "table.requestCount":           `Talep Sayısı: ${opts?.count ?? 0}`,
        "taskCreation.modalTitle":      "Talep Oluştur",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

jest.mock("./taskById", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("./taskCreationModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../services/task.service", () => ({
  getTasks: jest.fn(),
}));

const mockTasks: Task[] = [
  { id: "1", title: "Teknik Destek", category: "Teknik Destek", priority: "high",   status: "pending",  description: "", createdBy: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", title: "İzin Talebi",   category: "İzin Talebi",   priority: "normal", status: "approved", description: "", createdBy: "u1", createdAt: "2024-01-02T00:00:00Z" },
];

beforeEach(() => {
  (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
});

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: { id: "u1", name: "Kullanıcı", email: "u@test.com", role: "User" as const }, error: null },
    },
  });

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>
    </Provider>
  );

// ── Testler ────────────────────────────────────────────────────────

test("tablo render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("tasks-table")).toBeInTheDocument()
  );
});

test("tablo sütun başlıkları görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Başlık")).toBeInTheDocument();
    expect(screen.getByText("Öncelik")).toBeInTheDocument();
    expect(screen.getByText("Durum")).toBeInTheDocument();
  });
});

test("görevler tabloda görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Teknik Destek")).toBeInTheDocument();
    expect(screen.getByText("İzin Talebi")).toBeInTheDocument();
  });
});

test("boş veriyle tablo satır içermez", async () => {
  (taskService.getTasks as jest.Mock).mockResolvedValueOnce([]);
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("tasks-table")).toBeInTheDocument()
  );
  expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
});
