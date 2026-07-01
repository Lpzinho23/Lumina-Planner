import type { SvgIconComponent } from "@mui/icons-material";
import {
  Dashboard,
  AccountBalance,
  CreditCard,
  ShowChart,
  Savings,
  PieChart,
  CalendarMonth,
  Balance,
  BarChart,
  Person,
  Category,
  Settings,
} from "@mui/icons-material";

export type NavItem = {
  label: string;
  path: string;
  icon: SvgIconComponent;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Visão geral", path: "/dashboard", icon: Dashboard },
      { label: "Contas", path: "/accounts", icon: AccountBalance },
      { label: "Cartões de crédito", path: "/cards", icon: CreditCard },
      { label: "Transações", path: "/transactions", icon: ShowChart },
      { label: "Orçamentos", path: "/budgets", icon: Savings },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { label: "Gráficos", path: "/reports/charts", icon: PieChart },
      { label: "Resumo diário", path: "/reports/daily", icon: CalendarMonth },
      { label: "Balanço mensal", path: "/reports/monthly", icon: Balance },
      { label: "Total geral", path: "/reports/total", icon: BarChart },
    ],
  },
  {
    title: "Preferências",
    items: [
      { label: "Perfil & Ajustes", path: "/settings", icon: Person },
      { label: "Categorias", path: "/categories", icon: Category },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export type FabActionId = "transfer" | "income" | "expense" | "credit";

export const FAB_ACTIONS: {
  id: FabActionId;
  label: string;
  color: string;
  path: string;
}[] = [
  {
    id: "transfer",
    label: "Transferência",
    color: "#7c3aed",
    path: "/control?open=transfer",
  },
  {
    id: "income",
    label: "Receita",
    color: "#22c55e",
    path: "/control?open=income",
  },
  {
    id: "expense",
    label: "Despesa",
    color: "#f97316",
    path: "/control?open=expense",
  },
  {
    id: "credit",
    label: "Despesa no crédito",
    color: "#fb923c",
    path: "/control?open=credit",
  },
];
