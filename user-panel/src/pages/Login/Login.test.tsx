import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { Login } from ".";
import authReducer from "../../store/slices/authSlice";
import * as authService from "../../services/auth.service";

jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    p:   ({ children, ...p }: any) => <p   {...p}>{children}</p>,
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "login.welcome":             "Hoş Geldiniz",
        "login.subtitle":            "Hesabınıza giriş yapın",
        "login.email":               "Email Adresi",
        "login.emailPlaceholder":    "örnek@email.com",
        "login.password":            "Şifre",
        "login.passwordPlaceholder": "••••••••",
        "login.submit":              "Giriş Yap",
        "login.loading":             "Giriş yapılıyor...",
        "login.footer":              "© 2026 Beymen - Kullanıcı Portalı",
        "login.brandName":           "Case",
        "login.brandTagline":        "Kullanıcı Portalı",
        "login.brandDesc":           "Taleplerinizi kolayca oluşturun ve takip edin.",
        "login.badge1":              "Talep Oluştur",
        "login.badge2":              "Durum Takibi",
        "login.badge3":              "Bildirimler",
      })[key] ?? key,
    i18n: { changeLanguage: jest.fn(), language: "tr" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/auth.service");
const mockLogin = authService.loginService as jest.MockedFunction<typeof authService.loginService>;

const renderLogin = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => jest.clearAllMocks());

test("form render edilir", () => {
  renderLogin();
  expect(screen.getByText("Hoş Geldiniz")).toBeInTheDocument();
  expect(screen.getByText("Hesabınıza giriş yapın")).toBeInTheDocument();
  expect(screen.getByText("Email Adresi")).toBeInTheDocument();
  expect(screen.getByText("Şifre")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("örnek@email.com")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Giriş Yap/i })).toBeInTheDocument();
});

test("marka bilgileri render edilir", () => {
  renderLogin();
  expect(screen.getByText("Case")).toBeInTheDocument();
  expect(screen.getByText("Kullanıcı Portalı")).toBeInTheDocument();
  expect(screen.getByText("Talep Oluştur")).toBeInTheDocument();
  expect(screen.getByText("Durum Takibi")).toBeInTheDocument();
  expect(screen.getByText("Bildirimler")).toBeInTheDocument();
});

test("inputlara yazılabilir", async () => {
  renderLogin();
  await userEvent.type(screen.getByPlaceholderText("örnek@email.com"), "admin@test.com");
  await userEvent.type(screen.getByPlaceholderText("••••••••"), "admin123");
  expect(screen.getByPlaceholderText("örnek@email.com")).toHaveValue("admin@test.com");
  expect(screen.getByPlaceholderText("••••••••")).toHaveValue("admin123");
});

test("başarılı loginde /dashboard'a yönlendirilir", async () => {
  mockLogin.mockResolvedValue({
    user: { id: "1", name: "Admin", email: "admin@test.com", role: "Admin" },
    token: "mock-token",
  });

  renderLogin();

  await userEvent.type(screen.getByPlaceholderText("örnek@email.com"), "admin@test.com");
  await userEvent.type(screen.getByPlaceholderText("••••••••"), "admin123");
  await userEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard")
  );
});
