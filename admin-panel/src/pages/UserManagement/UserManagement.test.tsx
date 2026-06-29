import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import UserManagement from ".";
import authReducer from "../../store/slices/authSlice";
import userReducer from "../../store/slices/users/userSlice";
import { User } from "../../types/user.types";
import * as userService from "../../services/userManagement.service";

jest.mock("antd", () => {
  const React = require("react");
  return {
    Table:      ({ columns, dataSource }: any) =>
      React.createElement("table", { "data-testid": "user-table" },
        React.createElement("thead", null,
          React.createElement("tr", null,
            columns?.map((c: any) => React.createElement("th", { key: c.key }, c.title))
          )
        ),
        React.createElement("tbody", null,
          (dataSource ?? []).map((row: any) =>
            React.createElement("tr", { key: row.id, "data-testid": "table-row" },
              React.createElement("td", null, row.name)
            )
          )
        )
      ),
    Button:     ({ children, onClick, icon }: any) =>
      React.createElement("button", { onClick }, icon, children),
    Tooltip:    ({ children }: any) => React.createElement(React.Fragment, null, children),
    Popconfirm: ({ children }: any) => React.createElement(React.Fragment, null, children),
    message:    { success: jest.fn(), error: jest.fn() },
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "userManagement.title":         "Kullanıcı Yönetimi",
        "userManagement.addUser":       "Kullanıcı Ekle",
        "table.name":                   "Ad",
        "table.email":                  "Email",
        "table.role":                   "Rol",
        "table.actions":                "İşlemler",
        "userManagement.deleteSuccess": "Silindi",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

jest.mock("../../components/Loading", () => ({
  Loading: () => null,
}));

jest.mock("./addUserModal", () => ({
  AddUserModal: () => null,
}));

jest.mock("react-toastify", () => ({
  toast:          { success: jest.fn(), error: jest.fn() },
  ToastContainer: () => null,
}));

// Servis mock'ları — thunk bu servisleri çağırır
jest.mock("../../services/userManagement.service");

const mockUsers: User[] = [
  { id: "1", name: "Ali Veli",    email: "ali@test.com",  role: "Admin",     password: "123" },
  { id: "2", name: "Ayşe Yılmaz", email: "ayse@test.com", role: "Moderator", password: "123" },
];

beforeEach(() => {
  (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
});

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState: {
      auth: { user: { id: "1", name: "Admin", email: "a@test.com", role: "Admin" as const }, error: null },
      user: { users: [], loading: false, error: null },
    },
  });

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    </Provider>
  );

// ── Testler ────────────────────────────────────────────────────────

test("tablo render edilir", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("user-table")).toBeInTheDocument()
  );
});

test("kullanıcı adları tabloda görünür", async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Ali Veli")).toBeInTheDocument();
    expect(screen.getByText("Ayşe Yılmaz")).toBeInTheDocument();
  });
});

test("kullanıcı ekle butonu görünür", async () => {
  renderPage();
  await waitFor(() =>
    expect(screen.getByText("Kullanıcı Ekle")).toBeInTheDocument()
  );
});

test("boş veriyle tablo satır içermez", async () => {
  (userService.getUsers as jest.Mock).mockResolvedValueOnce([]);
  renderPage();
  await waitFor(() =>
    expect(screen.getByTestId("user-table")).toBeInTheDocument()
  );
  await waitFor(() =>
    expect(screen.queryAllByTestId("table-row")).toHaveLength(0)
  );
});
