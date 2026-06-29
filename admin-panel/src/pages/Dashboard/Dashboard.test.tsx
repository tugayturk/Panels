import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Dashboard from ".";
import authReducer from "../../store/slices/authSlice";
import * as dashboardService from "../../services/dashboard.service";

const mockTasks = [
  { id: "1", title: "Talep A", category: "Teknik", status: "pending",  priority: "high",   createdBy: "u1", createdAt: "2024-01-01T00:00:00Z", description: "" },
  { id: "2", title: "Talep B", category: "İzin",   status: "approved", priority: "normal", createdBy: "u2", createdAt: "2024-01-01T00:00:00Z", description: "" },
];

// ── Ant Design Table mock ─────────────────────────────────────────
jest.mock("antd", () => {
  const React = require("react");
  return {
    Card:      ({ title, children }: any) => React.createElement("div", { "data-testid": "card" }, title, children),
    Col:       ({ children }: any) => React.createElement("div", null, children),
    Flex:      ({ children }: any) => React.createElement("div", null, children),
    Progress:  () => React.createElement("div", { "data-testid": "progress" }),
    Row:       ({ children }: any) => React.createElement("div", null, children),
    Statistic: ({ title, value }: any) =>
      React.createElement("div", { "data-testid": "statistic" },
        React.createElement("span", null, title),
        React.createElement("span", null, String(value ?? "")),
      ),
    Table:     ({ columns, dataSource }: any) =>
      React.createElement("table", { "data-testid": "dashboard-table" },
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
    Tag:     ({ children }: any) => React.createElement("span", null, children),
    Tooltip: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...p }: any) => require("react").createElement("div", p, children),
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      ({
        "dashboard.welcome":          `Hoş geldin, ${opts?.name ?? ""}`,
        "dashboard.subtitle":         "Genel bakış",
        "dashboard.pending":          "Bekleyen",
        "dashboard.approvedToday":    "Bugün Onaylanan",
        "dashboard.rejectedToday":    "Bugün Reddedilen",
        "dashboard.priorityDist":     "Öncelik Dağılımı",
        "dashboard.recentRequests":   "Son Talepler",
        "table.title":                "Başlık",
        "table.status":               "Durum",
        "table.priority":             "Öncelik",
        "table.createdAt":            "Tarih",
        "table.user":                 "Kullanıcı",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

jest.mock("../../services/dashboard.service");

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
        <Dashboard />
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  (dashboardService.getDashboardData as jest.Mock).mockResolvedValue(mockTasks);
});

// ── Testler ────────────────────────────────────────────────────────

test("istatistik kartları render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getAllByTestId("statistic").length).toBeGreaterThanOrEqual(1)
  );
});

test("tablo render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("dashboard-table")).toBeInTheDocument()
  );
});

test("öncelik progress barları render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getAllByTestId("progress").length).toBeGreaterThanOrEqual(1)
  );
});
