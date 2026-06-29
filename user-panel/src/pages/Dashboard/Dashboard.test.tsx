import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from ".";
import authReducer from "../../store/slices/authSlice";
import * as dashboardSvc from "../../services/dashboard.service";

const mockDashboardData = {
  stats:       { total: 3, pending: 1, approved: 1, rejected: 1 },
  recentTasks: [
    { id: "1", title: "Son Talep", category: "Teknik", status: "pending" as const, priority: "high" as const, createdBy: "u1", createdAt: "2024-01-01T00:00:00Z", description: "" },
  ],
};

jest.mock("antd", () => {
  const React = require("react");
  return {
    Alert:     ({ message }: any) => React.createElement("div", { role: "alert" }, message),
    Card:      ({ title, children }: any) => React.createElement("div", { "data-testid": "card" }, title, children),
    Col:       ({ children }: any) => React.createElement("div", null, children),
    Row:       ({ children }: any) => React.createElement("div", null, children),
    Spin:      () => React.createElement("div", { "data-testid": "spin" }),
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
    Typography: {
      Title:     ({ children, level }: any) => React.createElement(`h${level ?? 1}`, null, children),
      Paragraph: ({ children }: any) => React.createElement("p", null, children),
    },
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
        "dashboard.totalRequests":    "Toplam Talep",
        "dashboard.pending":          "Bekleyen",
        "dashboard.approved":         "Onaylanan",
        "dashboard.rejected":         "Reddedilen",
        "dashboard.recentRequests":   "Son Taleplerim",
        "dashboard.loadError":        "Yüklenemedi",
        "dashboard.noDataError":      "Veri bulunamadı",
        "dashboard.noData":           "Veri yok",
        "dashboard.footerText":       "Son 5 talep",
        "dashboard.footerLink":       "tıklayınız",
        "table.title":                "Başlık",
        "table.category":             "Kategori",
        "table.status":               "Durum",
        "table.priority":             "Öncelik",
        "table.createdAt":            "Tarih",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

jest.mock("../../services/dashboard.service");

jest.mock("../Tasks/taskById", () => ({
  __esModule: true,
  default: () => null,
}));

beforeEach(() => {
  (dashboardSvc.dashboardService as jest.Mock).mockResolvedValue(mockDashboardData);
});

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: { id: "u1", name: "Tugay", email: "t@test.com", role: "User" as const }, error: null },
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

// ── Testler ────────────────────────────────────────────────────────

test("karşılama metni görünür", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByText("Hoş geldin, Tugay")).toBeInTheDocument()
  );
});

test("istatistik kartları render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getAllByTestId("statistic").length).toBeGreaterThanOrEqual(3)
  );
});

test("son talepler tablosu render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("dashboard-table")).toBeInTheDocument()
  );
});

test("son talep satırları görünür", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByText("Son Talep")).toBeInTheDocument()
  );
});
