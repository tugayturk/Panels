import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import TaskCreation from ".";
import authReducer from "../../store/slices/authSlice";

jest.mock("antd", () => {
  const React = require("react");
  const mockForm: any = Object.assign(
    ({ children, onFinish }: any) =>
      React.createElement("form", {
        "data-testid": "task-form",
        onSubmit: (e: any) => { e.preventDefault(); onFinish?.(); },
      }, children),
    {
      Item: ({ children, label }: any) =>
        React.createElement("div", null,
          label && React.createElement("label", null, label),
          children
        ),
      useForm: () => [{ resetFields: jest.fn(), validateFields: jest.fn().mockResolvedValue({}), setFieldsValue: jest.fn() }],
    }
  );
  return {
    Card:  ({ title, children }: any) =>
      React.createElement("div", { "data-testid": "task-card" },
        React.createElement("h2", null, title),
        children
      ),
    Form:  mockForm,
    Input: Object.assign(
      ({ placeholder, onChange }: any) =>
        React.createElement("input", { placeholder, onChange }),
      {
        TextArea: ({ placeholder, rows }: any) =>
          React.createElement("textarea", { placeholder, rows }),
      }
    ),
    Button: ({ children, htmlType }: any) =>
      React.createElement("button", { type: htmlType }, children),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "taskCreation.pageTitle":       "Talep Oluştur",
        "taskCreation.titleLabel":      "Başlık",
        "taskCreation.titlePlaceholder":"Talep Başlığı",
        "taskCreation.descLabel":       "Açıklama",
        "taskCreation.descPlaceholder": "Talep Açıklaması",
        "table.priority":               "Öncelik",
        "table.category":               "Kategori",
        "common.submit":                "Gönder",
        "priority.selectPlaceholder":   "Öncelik seçiniz",
        "category.selectPlaceholder":   "Kategori seçiniz",
        "priority.selectRequired":      "Öncelik seçiniz",
        "category.selectRequired":      "Kategori seçiniz",
        "taskCreation.titleRequired":   "Lütfen başlık giriniz!",
        "taskCreation.descRequired":    "Lütfen açıklama giriniz!",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

// Ortak form bileşenini basit bir form ile temsil et
jest.mock("../../components/TaskCreationForm", () => ({
  __esModule: true,
  default: () => {
    const React = require("react");
    return React.createElement("div", { "data-testid": "task-creation-form" },
      React.createElement("input", { placeholder: "Talep Başlığı" }),
      React.createElement("textarea", { placeholder: "Talep Açıklaması" }),
      React.createElement("button", { type: "submit" }, "Gönder"),
    );
  },
}));

jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: { success: jest.fn(), error: jest.fn() },
}));

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
        <TaskCreation />
      </MemoryRouter>
    </Provider>
  );

// ── Testler ────────────────────────────────────────────────────────

test("sayfa başlığı görünür", () => {
  renderPage();
  expect(screen.getByText("Talep Oluştur")).toBeInTheDocument();
});

test("form render edilir", () => {
  renderPage();
  expect(screen.getByTestId("task-creation-form")).toBeInTheDocument();
});

test("form alanları görünür", () => {
  renderPage();
  expect(screen.getByPlaceholderText("Talep Başlığı")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Talep Açıklaması")).toBeInTheDocument();
});

test("gönder butonu görünür", () => {
  renderPage();
  expect(screen.getByRole("button", { name: /Gönder/i })).toBeInTheDocument();
});
