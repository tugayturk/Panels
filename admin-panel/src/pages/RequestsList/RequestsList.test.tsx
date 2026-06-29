import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AllTasks from ".";
import authReducer from "../../store/slices/authSlice";
import { Task } from "../../types/task.types";

jest.mock("antd", () => {
  const React = require("react");
  return {
    Table:      ({ columns, dataSource }: any) =>
      React.createElement("table", { "data-testid": "requests-table" },
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
    Tag:        ({ children }: any) => React.createElement("span", null, children),
    Tooltip:    ({ children }: any) => React.createElement(React.Fragment, null, children),
    Button:     ({ children, onClick }: any) => React.createElement("button", { onClick }, children),
    Space:      ({ children }: any) => React.createElement("div", null, children),
    DatePicker: () => React.createElement("input", { "data-testid": "date-picker" }),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "table.title":     "Başlık",
        "table.user":      "Kullanıcı",
        "table.category":  "Kategori",
        "table.priority":  "Öncelik",
        "table.status":    "Durum",
        "table.createdAt": "Tarih",
        "table.actions":   "İşlemler",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

jest.mock("../../components/Loading", () => ({
  Loading: () => null,
}));

jest.mock("../../components/RequestModal", () => ({
  __esModule: true,
  default: () => null,
}));

const mockTasks: Task[] = [
  { id: "1", title: "Teknik Destek",   category: "Teknik Destek", priority: "high",   status: "pending",  description: "", createdBy: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", title: "İzin Talebi",     category: "İzin Talebi",   priority: "normal", status: "approved", description: "", createdBy: "u2", createdAt: "2024-01-02T00:00:00Z" },
];

jest.mock("../../services/requests.service");
jest.mock("../../services/pendingRequest.service", () => ({
  getUsers: jest.fn().mockResolvedValue([]),
}));

import * as requestsService from "../../services/requests.service";

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: { id: "1", name: "Admin", email: "a@test.com", role: "Admin" as const }, error: null },
    },
  });

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <AllTasks />
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  (requestsService.getRequests as jest.Mock).mockResolvedValue(mockTasks);
});

// ── Testler ────────────────────────────────────────────────────────

test("tablo render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("requests-table")).toBeInTheDocument()
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

test("veriler tabloda görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Teknik Destek")).toBeInTheDocument();
    expect(screen.getByText("İzin Talebi")).toBeInTheDocument();
  });
});

test("boş veriyle tablo satır içermez", async () => {
  (requestsService.getRequests as jest.Mock).mockResolvedValueOnce([]);
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("requests-table")).toBeInTheDocument()
  );
  expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
});
