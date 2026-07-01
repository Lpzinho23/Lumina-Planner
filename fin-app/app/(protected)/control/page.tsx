"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  writeBatch,
  doc as firestoreDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import type { SelectChangeEvent } from "@mui/material/Select";
import type {
  AccountRecord,
  AggregatedSavingsRow,
  CardRecord,
  TransactionRecord,
  TransactionType,
} from "@/types/finance";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { sectionHeaderSx, summaryCardsGridSx } from "@/components/layout/shared";
import {
  TrendingUp,
  TrendingDown,
  Savings,
  AccountBalance,
  AddCircleOutline,
  ArrowBack,
  AccountBalanceWallet,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import {
  BANKS_FOR_EXPENSES,
  BANKS_FOR_INVESTMENTS,
  CARD_COLORS,
  CATEGORIES_DEFAULT,
  MONTHS_LIST,
  PAYMENT_METHODS,
  RECEIPT_METHODS,
} from "@/lib/constants";
import { formatBRL, formatDateBR, parseISODateUTC } from "@/lib/format";
import { isExpenseType, isInvestmentType } from "@/lib/finance";
import { getReadableErrorMessage } from "@/lib/errorHandling";
import {
  sanitizeAccountInput,
  sanitizeCardInput,
  sanitizeTransactionInput,
} from "@/lib/writeValidation";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCards } from "@/lib/hooks/useCards";
import { useAccounts } from "@/lib/hooks/useAccounts";
import TopSummaryCard from "@/components/control/TopSummaryCard";
import AccountBlock from "@/components/control/AccountBlock";
import CreditCardBlock from "@/components/control/CreditCardBlock";
import StandardBlock from "@/components/control/StandardBlock";
import PiggyBlock from "@/components/control/PiggyBlock";

export default function ControlPage() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useAppTheme();
  const { transactions } = useTransactions(user?.uid);
  const { cards } = useCards(user?.uid);
  const { accounts } = useAccounts(user?.uid);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const cdiPercentage = 100;

  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] =
    useState<TransactionType>("expense_variable");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardColor, setCardColor] = useState<string>(CARD_COLORS[0].hex as string);

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accName, setAccName] = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accColor, setAccColor] = useState<string>(CARD_COLORS[1].hex as string);

  const [payBillOpen, setPayBillOpen] = useState(false);
  const [selectedCardToPay, setSelectedCardToPay] = useState<CardRecord | null>(
    null,
  );
  const [billAmount, setBillAmount] = useState(0);
  const [paymentSource, setPaymentSource] = useState("");

  const [extractOpen, setExtractOpen] = useState(false);
  const [extractData, setExtractData] = useState<TransactionRecord[]>([]);
  const [extractBankName, setExtractBankName] = useState("");

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(
    null,
  );

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bank, setBank] = useState("");
  const [status, setStatus] = useState("Pendente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [yieldRate, setYieldRate] = useState("100");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isCardPaymentFlow, setIsCardPaymentFlow] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isPayingBill, setIsPayingBill] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  const handleOpenAccountModal = (acc?: AccountRecord) => {
    if (acc) {
      setEditingAccountId(acc.id);
      setAccName(acc.name);
      setAccBalance(acc.initialBalance?.toString() || "0");
      setAccColor(acc.color || (CARD_COLORS[1].hex as string));
    } else {
      setEditingAccountId(null);
      setAccName("");
      setAccBalance("");
      setAccColor(CARD_COLORS[1].hex as string);
    }
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async () => {
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!accName) return toast.error("Nome é obrigatório");
    const accValidation = sanitizeAccountInput({
      name: accName,
      initialBalance: parseFloat(accBalance) || 0,
      color: accColor,
    });
    if (!accValidation.ok) {
      toast.error(accValidation.message);
      return;
    }
    const accData = {
      ...accValidation.data,
      createdAt: new Date(),
    };
    setIsSavingAccount(true);
    try {
      if (editingAccountId)
        await updateDoc(
          doc(db, `users/${user.uid}/accounts`, editingAccountId),
          accData,
        );
      else
        await addDoc(collection(db, `users/${user.uid}/accounts`), accData);
      setAccountModalOpen(false);
      toast.success("Conta salva com sucesso.");
    } catch (error: unknown) {
      console.error("Erro ao salvar conta:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível salvar a conta. Tente novamente.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!user || !deleteAccountId) return;
    setIsDeletingAccount(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/accounts`, deleteAccountId));
      setAccountModalOpen(false);
      setEditingAccountId(null);
      setDeleteAccountId(null);
      toast.success("Conta excluída");
    } catch (error: unknown) {
      console.error("Erro ao excluir conta:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível excluir a conta.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleOpenExtract = (bankName: string) => {
    const history = transactions
      .filter(
        (t) =>
          isInvestmentType(t.type) && t.bank === bankName,
      )
      .sort(
        (a, b) =>
          parseISODateUTC(b.date).getTime() -
          parseISODateUTC(a.date).getTime(),
      );
    setExtractBankName(bankName);
    setExtractData(history);
    setExtractOpen(true);
  };

  const handleOpenPayBill = (c: CardRecord) => {
    const val = transactions
      .filter((t) => {
        const d = parseISODateUTC(t.date);
        const isOld =
          d.getUTCFullYear() < currentYear ||
          (d.getUTCFullYear() === currentYear &&
            d.getUTCMonth() <= currentMonth);
        return (
          t.bank === c.name &&
          t.paymentMethod === "Crédito" &&
          isExpenseType(t.type) &&
          t.status !== "Fatura Paga" &&
          isOld
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    if (val <= 0) return toast.success("Não há fatura pendente para este cartão.");
    setSelectedCardToPay(c);
    setBillAmount(val);
    setPaymentSource("");
    setPayBillOpen(true);
  };

  const handleConfirmPayBill = async () => {
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selectedCardToPay) {
      toast.error("Nenhum cartão selecionado.");
      return;
    }
    if (!paymentSource) {
      toast.error("Selecione a conta para pagar a fatura.");
      return;
    }
    setIsPayingBill(true);
    try {
      const batch = writeBatch(db);
      const items = transactions.filter((t) => {
        const d = parseISODateUTC(t.date);
        const isOld =
          d.getUTCFullYear() < currentYear ||
          (d.getUTCFullYear() === currentYear &&
            d.getUTCMonth() <= currentMonth);
        return (
          t.bank === selectedCardToPay.name &&
          t.paymentMethod === "Crédito" &&
          isExpenseType(t.type) &&
          t.status !== "Fatura Paga" &&
          isOld
        );
      });
      items.forEach((i) =>
        batch.update(doc(db, `users/${user.uid}/transactions`, i.id), {
          status: "Fatura Paga",
        }),
      );
      batch.set(firestoreDoc(collection(db, `users/${user.uid}/transactions`)), {
        type: "expense_fixed",
        description: `Fatura ${selectedCardToPay.name}`,
        category: "Pagamento de Fatura",
        amount: billAmount,
        paymentMethod: "Débito",
        bank: paymentSource,
        status: "Pago",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
      });
      await batch.commit();
      setPayBillOpen(false);
      toast.success("Pagamento da fatura confirmado.");
    } catch (error: unknown) {
      console.error("Erro ao pagar fatura:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível confirmar o pagamento da fatura.");
    } finally {
      setIsPayingBill(false);
    }
  };

  const handleOpenCardModal = (c?: CardRecord) => {
    if (c) {
      setEditingCardId(c.id);
      setCardName(c.name);
      setCardLimit(String(c.limit));
      setCardColor(c.color ?? (CARD_COLORS[0].hex as string));
    } else {
      setEditingCardId(null);
      setCardName("");
      setCardLimit("");
      setCardColor(CARD_COLORS[0].hex as string);
    }
    setCardModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    const cardValidation = sanitizeCardInput({
      name: cardName,
      limit: parseFloat(cardLimit),
      color: cardColor,
    });
    if (!cardValidation.ok) {
      toast.error(cardValidation.message);
      return;
    }
    const d = { ...cardValidation.data };
    setIsSavingCard(true);
    try {
      if (editingCardId)
        await updateDoc(doc(db, `users/${user.uid}/cards`, editingCardId), d);
      else await addDoc(collection(db, `users/${user.uid}/cards`), d);
      setCardModalOpen(false);
      toast.success("Cartão salvo.");
    } catch (error: unknown) {
      console.error("Erro ao salvar cartão:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível salvar o cartão.");
    } finally {
      setIsSavingCard(false);
    }
  };

  const confirmDeleteCard = async () => {
    if (!user || !deleteCardId) return;
    setIsDeletingCard(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/cards`, deleteCardId));
      setCardModalOpen(false);
      setEditingCardId(null);
      setDeleteCardId(null);
      toast.success("Cartão excluído com sucesso.");
    } catch (error: unknown) {
      console.error("Erro ao excluir cartão:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível excluir o cartão.");
    } finally {
      setIsDeletingCard(false);
    }
  };

  const handleOpen = (
    type: TransactionType,
    item?: TransactionRecord,
    preset?: { paymentMethod?: string; status?: string; cardFlow?: boolean },
  ) => {
    setIsCardPaymentFlow(Boolean(preset?.cardFlow));
    setActiveType(type);
    if (item) {
      setEditingId(item.id);
      setDesc(item.description ?? "");
      setAmount(String(item.amount));
      setCategory(item.category ?? "");
      setBank(item.bank ?? "");
      setPaymentMethod(item.paymentMethod ?? "");
      setStatus(item.status ?? "Pendente");
      setDate(item.date);
      setIsInstallment(false);
      setYieldRate(
        item.yieldRate != null ? String(item.yieldRate) : "100",
      );
      setSelectedCardId("");
    } else {
      setEditingId(null);
      setDesc("");
      setAmount("");
      setCategory("");
      setBank("");
      setPaymentMethod(preset?.paymentMethod ?? "");
      setStatus(preset?.status ?? "Pendente");
      setDate(new Date().toISOString().split("T")[0]);
      setIsInstallment(false);
      setYieldRate("100");
      setSelectedCardId("");
      if (type === "piggy") {
        const m = currentMonth + 1;
        setDate(`${currentYear}-${m < 10 ? `0${m}` : m}-05`);
      }
    }
    setOpen(true);
  };

  const searchParams = useSearchParams();
  const openHandledRef = useRef(false);

  useEffect(() => {
    const openParam = searchParams.get("open");
    if (!openParam || openHandledRef.current) return;
    openHandledRef.current = true;

    const timer = window.setTimeout(() => {
      if (openParam === "income") {
        handleOpen("income");
      } else if (openParam === "expense") {
        handleOpen("expense_variable");
      } else if (openParam === "card" || openParam === "credit") {
        handleOpen("expense_variable", undefined, { cardFlow: true });
      } else if (openParam === "transfer") {
        toast("Use duas movimentações para registrar uma transferência entre contas.", {
          icon: "↔️",
        });
        handleOpen("savings");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const closeTransactionModal = () => {
    setOpen(false);
    setIsCardPaymentFlow(false);
  };

  const handleCardSelection = (id: string) => {
    setSelectedCardId(id);
    const c = cards.find((x) => x.id === id);
    if (c) {
      setBank(c.name);
      setPaymentMethod("Crédito");
      setStatus("Pago");
    }
  };

  const handlePaymentMethodChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    setPaymentMethod(val);
    if (isExpenseType(activeType) && val !== "Crédito") {
      setStatus("Pago");
      setBank("");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!amount) return toast.error("Informe um valor.");
    const num = parseFloat(amount);
    let finalDesc = desc;
    if (activeType === "piggy" && !desc) finalDesc = "Aporte Mensal";
    const transactionValidation = sanitizeTransactionInput({
      type: activeType,
      description: finalDesc,
      category,
      amount: num,
      paymentMethod,
      bank,
      status: activeType === "income" ? "Recebido" : status,
      date,
      yieldRate:
        activeType === "piggy" || activeType === "savings"
          ? parseFloat(yieldRate) || 100
          : undefined,
    });
    if (!transactionValidation.ok) {
      toast.error(transactionValidation.message);
      return;
    }
    const data: Record<string, unknown> = {
      ...transactionValidation.data,
      type: activeType,
      createdAt: new Date(),
    };

    setIsSavingTransaction(true);
    try {
      if (editingId) {
        await updateDoc(
          doc(db, `users/${user.uid}/transactions`, editingId),
          data,
        );
      } else {
        if (activeType === "piggy" || activeType === "savings") {
          const targetDate = parseISODateUTC(date);
          const exists = transactions.find(
            (t) =>
              t.type === activeType &&
              t.bank === bank &&
              t.description === finalDesc &&
              parseISODateUTC(t.date).getUTCMonth() ===
                targetDate.getUTCMonth() &&
              parseISODateUTC(t.date).getUTCFullYear() ===
                targetDate.getUTCFullYear(),
          );
          if (exists) {
            await updateDoc(
              doc(db, `users/${user.uid}/transactions`, exists.id),
              {
                amount: exists.amount + num,
                yieldRate: parseFloat(yieldRate),
              },
            );
            closeTransactionModal();
            toast.success("Lançamento salvo.");
            return;
          }
        }
        if (
          isInstallment &&
          installmentsCount > 1 &&
          isExpenseType(activeType)
        ) {
          const batch = writeBatch(db);
          const base = new Date(date);
          const val = num / installmentsCount;
          for (let i = 0; i < installmentsCount; i++) {
            const next = new Date(base);
            next.setMonth(base.getMonth() + i);
            const ref = firestoreDoc(
              collection(db, `users/${user.uid}/transactions`),
            );
            batch.set(ref, {
              ...data,
              description: `${finalDesc} (${i + 1}/${installmentsCount})`,
              amount: val,
              status:
                i === 0 && status === "Pago" ? "Pago" : "Pendente",
              date: next.toISOString().split("T")[0],
            });
          }
          await batch.commit();
        } else {
          await addDoc(collection(db, `users/${user.uid}/transactions`), data);
        }
      }
      closeTransactionModal();
      toast.success("Lançamento salvo.");
    } catch (error: unknown) {
      console.error("Erro ao salvar lançamento:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível salvar o lançamento.");
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const confirmDeleteTransaction = async () => {
    if (!user || !deleteTransactionId) return;
    setIsDeletingTransaction(true);
    try {
      await deleteDoc(
        doc(db, `users/${user.uid}/transactions`, deleteTransactionId),
      );
      setDeleteTransactionId(null);
      toast.success("Registro removido.");
    } catch (error: unknown) {
      console.error("Erro ao excluir transação:", getReadableErrorMessage(error), error);
      toast.error("Não foi possível excluir o registro.");
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const filterByDate = (l: TransactionRecord[]) =>
    l.filter((t) => {
      const d = parseISODateUTC(t.date);
      return (
        d.getUTCMonth() === currentMonth &&
        d.getUTCFullYear() === currentYear
      );
    });

  const incomes = filterByDate(transactions.filter((t) => t.type === "income"));
  const fixedExpenses = filterByDate(
    transactions.filter((t) => t.type === "expense_fixed"),
  );
  const variableExpenses = filterByDate(
    transactions.filter((t) => t.type === "expense_variable"),
  );
  const rawSavings = transactions.filter(
    (t) => t.type === "savings" || t.type === "piggy",
  );
  const piggyData = transactions.filter(
    (t) =>
      t.type === "piggy" &&
      parseISODateUTC(t.date).getUTCFullYear() === currentYear,
  );
  const combinedSavings = rawSavings.reduce<AggregatedSavingsRow[]>(
    (acc, curr) => {
      const k = `${curr.bank}-${curr.description}`;
      const ex = acc.find((i) => i._key === k);
      if (ex) {
        ex.amount += curr.amount;
        ex.yieldRate = curr.yieldRate ?? ex.yieldRate;
      } else {
        acc.push({ ...curr, _key: k });
      }
      return acc;
    },
    [],
  ).sort((a, b) => b.amount - a.amount);

  const sumIncomes = incomes.reduce((a, t) => a + t.amount, 0);
  const sumExpenses =
    fixedExpenses.reduce((a, t) => a + t.amount, 0) +
    variableExpenses.reduce((a, t) => a + t.amount, 0);
  const sumSavedMonth = filterByDate(rawSavings).reduce(
    (a, t) => a + t.amount,
    0,
  );

  const totalAccountsBalance = accounts.reduce((acc, account) => {
    const totalIn = transactions
      .filter((t) => t.type === "income" && t.bank === account.name)
      .reduce((a, b) => a + b.amount, 0);
    const totalOut = transactions
      .filter(
        (t) =>
          isExpenseType(t.type) &&
          t.paymentMethod !== "Crédito" &&
          t.bank === account.name,
      )
      .reduce((a, b) => a + b.amount, 0);
    const totalInvestedFromHere = transactions
      .filter(
        (t) => isInvestmentType(t.type) && t.bank === account.name,
      )
      .reduce((a, b) => a + b.amount, 0);
    const currentAccBalance =
      (account.initialBalance ?? 0) +
      totalIn -
      totalOut -
      totalInvestedFromHere;
    return acc + currentAccBalance;
  }, 0);

  const getBankOptions = (): string[] => {
    const accNames = accounts.map((a) => a.name);
    if (activeType === "savings" || activeType === "piggy") {
      return [...new Set([...BANKS_FOR_INVESTMENTS, ...accNames])];
    }
    if (isExpenseType(activeType)) {
      if (paymentMethod === "Crédito") return cards.map((c) => c.name);
      if (paymentMethod && paymentMethod !== "") return accNames;
      return [...new Set([...BANKS_FOR_EXPENSES, ...accNames])];
    }
    return accNames;
  };

  return (
    <Box maxWidth="xl" sx={{ mx: "auto", minWidth: 0 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        color={colors.text}
        sx={{ mb: 2, fontSize: { xs: "1.35rem", sm: "1.6rem", md: "2rem" } }}
      >
        Controle financeiro
      </Typography>
      <Paper
        sx={{
          p: 2,
          mb: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          color={colors.textSecondary}
          fontWeight="bold"
        >
          FILTRAR PERÍODO:
        </Typography>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
          <Select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            inputProps={{ "aria-label": "Selecionar mês do controle financeiro" }}
            sx={{ color: colors.text, bgcolor: colors.input }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: colors.paper, color: colors.text } },
            }}
          >
            {MONTHS_LIST.map((m, i) => (
              <MenuItem key={m} value={i}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 100 } }}>
          <Select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            inputProps={{ "aria-label": "Selecionar ano do controle financeiro" }}
            sx={{ color: colors.text, bgcolor: colors.input }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: colors.paper, color: colors.text } },
            }}
          >
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2026}>2026</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Box sx={{ ...summaryCardsGridSx, mb: 4 }}>
        <TopSummaryCard
          title="Saldo em Conta"
          value={totalAccountsBalance}
          icon={<AccountBalanceWallet />}
          color="#a78bfa"
          bg="#2e1065"
          colors={colors}
        />
        <TopSummaryCard
          title="Total Recebido"
          value={sumIncomes}
          icon={<TrendingUp />}
          color="#4ade80"
          bg="#14532d"
          colors={colors}
        />
        <TopSummaryCard
          title="Total Gasto"
          value={sumExpenses}
          icon={<TrendingDown />}
          color="#f87171"
          bg="#450a0a"
          colors={colors}
        />
        <TopSummaryCard
          title="Guardado (Mês)"
          value={sumSavedMonth}
          icon={<Savings />}
          color="#60a5fa"
          bg="#172554"
          colors={colors}
        />
      </Box>

      <Box mb={4}>
        <Box sx={sectionHeaderSx}>
          <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
            Minhas Contas Bancárias
          </Typography>
          <Button
            startIcon={<AddCircleOutline />}
            variant="outlined"
            aria-label="Cadastrar nova conta bancária"
            onClick={() => handleOpenAccountModal()}
            sx={{
              color: colors.text,
              borderColor: colors.border,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Nova Conta
          </Button>
        </Box>
        <Grid container spacing={3}>
          {accounts.map((acc) => (
            <Grid item xs={12} sm={6} lg={4} key={acc.id}>
              <AccountBlock
                account={acc}
                transactions={transactions}
                handleOpenAccountModal={handleOpenAccountModal}
                colors={colors}
              />
            </Grid>
          ))}
          {accounts.length === 0 && (
            <Grid item xs={12}>
              <Typography color={colors.textSecondary} fontStyle="italic">
                Nenhuma conta cadastrada.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box mb={4}>
        <Box sx={sectionHeaderSx}>
          <Typography variant="h6" component="h2" fontWeight="bold" color={colors.text}>
            Meus Cartões de Crédito
          </Typography>
          <Button
            startIcon={<AddCircleOutline />}
            variant="outlined"
            aria-label="Cadastrar novo cartão de crédito"
            onClick={() => handleOpenCardModal()}
            sx={{
              color: colors.text,
              borderColor: colors.border,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Novo Cartão
          </Button>
        </Box>
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} lg={6} key={card.id}>
              <CreditCardBlock
                card={card}
                transactions={transactions}
                currentMonth={currentMonth}
                currentYear={currentYear}
                handleOpenCardModal={handleOpenCardModal}
                handleOpenPayBill={handleOpenPayBill}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </Grid>
          ))}
          {cards.length === 0 && (
            <Grid item xs={12}>
              <Typography color={colors.textSecondary} fontStyle="italic">
                Nenhum cartão cadastrado.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <StandardBlock
        title="Todos os Meus Ganhos"
        icon={<TrendingUp />}
        color="#4ade80"
        type="income"
        data={incomes}
        columns={["Descrição", "Valor", "Data", "Recebimento", "Banco"]}
        handleOpen={handleOpen}
        handleDelete={(id) => setDeleteTransactionId(id)}
        colors={colors}
        isDarkMode={isDarkMode}
      />
      <StandardBlock
        title="Despesas Fixas"
        icon={<TrendingDown />}
        color="#fbbf24"
        type="expense_fixed"
        data={fixedExpenses}
        columns={[
          "Descrição",
          "Categoria",
          "Data",
          "Valor",
          "Status",
          "Pagamento",
          "Banco",
        ]}
        handleOpen={handleOpen}
        handleDelete={(id) => setDeleteTransactionId(id)}
        colors={colors}
        isDarkMode={isDarkMode}
      />
      <StandardBlock
        title="Despesas Variáveis"
        icon={<TrendingDown />}
        color="#f87171"
        type="expense_variable"
        data={variableExpenses}
        columns={[
          "Descrição",
          "Categoria",
          "Data",
          "Valor",
          "Status",
          "Pagamento",
          "Banco",
        ]}
        handleOpen={handleOpen}
        handleDelete={(id) => setDeleteTransactionId(id)}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      <PiggyBlock
        data={piggyData}
        handleOpen={handleOpen}
        handleDelete={(id) => setDeleteTransactionId(id)}
        colors={colors}
        isDarkMode={isDarkMode}
        cdiPercentage={cdiPercentage}
        currentYear={currentYear}
      />
      <StandardBlock
        title="Dinheiro Guardado (Total Acumulado)"
        icon={<AccountBalance />}
        color="#60a5fa"
        type="savings"
        data={combinedSavings}
        columns={["Banco", "Descrição", "Valor", "Rendimento"]}
        handleOpen={handleOpen}
        handleDelete={(id) => setDeleteTransactionId(id)}
        handleOpenExtract={handleOpenExtract}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      <Dialog
        open={extractOpen}
        onClose={() => setExtractOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 560,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${colors.border}` }}>
          Histórico - {extractBankName}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.textSecondary }}>Data</TableCell>
                  <TableCell sx={{ color: colors.textSecondary }}>
                    Descrição
                  </TableCell>
                  <TableCell align="right" sx={{ color: colors.textSecondary }}>
                    Valor
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extractData.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ color: colors.text }}>
                      {formatDateBR(t.date)}
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {t.description}{" "}
                      {t.type === "piggy" && "(Cofrinho)"}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "#60a5fa", fontWeight: "bold" }}
                    >
                      + {formatBRL(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {extractData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Sem registros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExtractOpen(false)}
            color="inherit"
            aria-label={`Fechar extrato de investimentos de ${extractBankName}`}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle>
          {editingAccountId ? "Editar Conta" : "Nova Conta"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2} sx={{ width: { xs: "100%", sm: 300 } }}>
            <TextField
              label="Nome da Conta / Banco"
              fullWidth
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.input,
                  color: colors.text,
                },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
            <TextField
              label="Saldo Inicial (R$)"
              type="number"
              fullWidth
              value={accBalance}
              onChange={(e) => setAccBalance(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.input,
                  color: colors.text,
                },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Cor</InputLabel>
              <Select
                value={accColor}
                label="Cor"
                onChange={(e) => setAccColor(e.target.value)}
                sx={{ bgcolor: colors.input, color: colors.text }}
              >
                {CARD_COLORS.map((c) => (
                  <MenuItem key={c.hex} value={c.hex}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: c.hex,
                        }}
                      />
                      {c.name}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          {editingAccountId && (
            <Button
              onClick={() => setDeleteAccountId(editingAccountId)}
              color="error"
              disabled={isSavingAccount}
            >
              Excluir
            </Button>
          )}
          <Button
            onClick={() => setAccountModalOpen(false)}
            color="inherit"
            disabled={isSavingAccount}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAccount}
            sx={{ bgcolor: "#7c3aed" }}
            disabled={isSavingAccount}
          >
            {isSavingAccount ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle>
          {editingCardId ? "Editar Cartão" : "Novo Cartão"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2} sx={{ width: { xs: "100%", sm: 300 } }}>
            <TextField
              label="Nome do Cartão"
              fullWidth
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.input,
                  color: colors.text,
                },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
            <TextField
              label="Limite (R$)"
              type="number"
              fullWidth
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.input,
                  color: colors.text,
                },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>
                Cor do Cartão
              </InputLabel>
              <Select
                value={cardColor}
                label="Cor do Cartão"
                onChange={(e) => setCardColor(e.target.value)}
                sx={{ bgcolor: colors.input, color: colors.text }}
              >
                {CARD_COLORS.map((c) => (
                  <MenuItem key={c.hex} value={c.hex}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: c.hex,
                        }}
                      />
                      {c.name}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          {editingCardId && (
            <Button
              onClick={() => setDeleteCardId(editingCardId)}
              color="error"
              disabled={isSavingCard}
            >
              Excluir
            </Button>
          )}
          <Button
            onClick={() => setCardModalOpen(false)}
            color="inherit"
            disabled={isSavingCard}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCard}
            sx={{ bgcolor: "#7c3aed" }}
            disabled={isSavingCard}
          >
            {isSavingCard ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={payBillOpen}
        onClose={() => setPayBillOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 460,
          },
        }}
      >
        <DialogTitle>Pagar Fatura - {selectedCardToPay?.name}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" color={colors.textSecondary} mb={2}>
            Isso vai marcar todas as despesas deste cartão como &quot;Fatura
            Paga&quot; e liberar seu limite.
          </Typography>
          <Typography
            variant="h4"
            color="#4ade80"
            fontWeight="bold"
            align="center"
            mb={3}
          >
            {formatBRL(billAmount)}
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: colors.textSecondary }}>
              Pagar usando saldo de:
            </InputLabel>
            <Select
              value={paymentSource}
              label="Pagar usando saldo de:"
              onChange={(e) => setPaymentSource(e.target.value)}
              sx={{ bgcolor: colors.input, color: colors.text }}
            >
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.name}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPayBillOpen(false)}
            color="inherit"
            disabled={isPayingBill}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPayBill}
            sx={{ bgcolor: "#4ade80", color: "#000" }}
            disabled={isPayingBill || !paymentSource}
          >
            {isPayingBill ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={closeTransactionModal}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 520,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${colors.border}` }}>
          {editingId
            ? "Editar Lançamento"
            : isCardPaymentFlow
              ? "Nova despesa no cartão"
              : "Novo Lançamento"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            {activeType !== "piggy" && (
              <TextField
                label="Descrição"
                fullWidth
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.input,
                    color: colors.text,
                  },
                  "& .MuiInputLabel-root": { color: colors.textSecondary },
                }}
              />
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Valor (R$)"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.input,
                    color: colors.text,
                  },
                  "& .MuiInputLabel-root": { color: colors.textSecondary },
                }}
              />
              <TextField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.input,
                    color: colors.text,
                  },
                }}
              />
            </Stack>
            {(activeType === "piggy" || activeType === "savings") && (
              <TextField
                label="Rendimento (% do CDI)"
                type="number"
                fullWidth
                value={yieldRate}
                onChange={(e) => setYieldRate(e.target.value)}
                placeholder="Ex: 100"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.input,
                    color: colors.text,
                  },
                  "& .MuiInputLabel-root": { color: colors.textSecondary },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography color={colors.textSecondary}>%</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {!editingId && isExpenseType(activeType) && (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isInstallment}
                      onChange={(e) => setIsInstallment(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label="Parcelado?"
                />
                {isInstallment && (
                  <>
                    <TextField
                      label="Parcelas"
                      type="number"
                      fullWidth
                      value={installmentsCount}
                      onChange={(e) =>
                        setInstallmentsCount(Number(e.target.value))
                      }
                      size="small"
                      sx={{
                        bgcolor: colors.input,
                        mt: 1,
                        mb: 2,
                        input: { color: colors.text },
                      }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: colors.textSecondary }}>
                        Selecione o Cartão
                      </InputLabel>
                      <Select
                        value={selectedCardId}
                        label="Selecione o Cartão"
                        onChange={(e) => handleCardSelection(e.target.value)}
                        sx={{ bgcolor: colors.input, color: colors.text }}
                      >
                        {cards.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
              </Paper>
            )}
            {isExpenseType(activeType) && (
              <Stack direction="row" spacing={1} alignItems="center">
                {isCustomCategory ? (
                  <TextField
                    label="Nova Categoria"
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    autoFocus
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: colors.input,
                        color: colors.text,
                      },
                    }}
                  />
                ) : (
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.textSecondary }}>
                      Categoria
                    </InputLabel>
                    <Select
                      value={category}
                      label="Categoria"
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ bgcolor: colors.input, color: colors.text }}
                    >
                      {CATEGORIES_DEFAULT.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Tooltip title="Alternar">
                  <IconButton
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      setCategory("");
                    }}
                    aria-label={
                      isCustomCategory
                        ? "Voltar para lista de categorias"
                        : "Usar categoria personalizada"
                    }
                    sx={{ bgcolor: colors.input, color: colors.text }}
                  >
                    {isCustomCategory ? <ArrowBack /> : <AddCircleOutline />}
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
            {activeType !== "savings" && activeType !== "piggy" && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.textSecondary }}>
                  {activeType === "income"
                    ? "Recebimento"
                    : isCardPaymentFlow
                      ? "Débito ou crédito"
                      : "Pagamento"}
                </InputLabel>
                <Select
                  value={paymentMethod}
                  label={
                    activeType === "income"
                      ? "Recebimento"
                      : isCardPaymentFlow
                        ? "Débito ou crédito"
                        : "Pagamento"
                  }
                  onChange={handlePaymentMethodChange}
                  sx={{ bgcolor: colors.input, color: colors.text }}
                >
                  {(activeType === "income"
                    ? RECEIPT_METHODS
                    : isCardPaymentFlow
                      ? (["Débito", "Crédito"] as const)
                      : PAYMENT_METHODS
                  ).map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {isExpenseType(activeType) && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.textSecondary }}>
                  Status
                </InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ bgcolor: colors.input, color: colors.text }}
                >
                  <MenuItem value="Pago">Pago</MenuItem>
                  <MenuItem value="Pendente">Pendente</MenuItem>
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>
                Banco / Conta
              </InputLabel>
              <Select
                value={bank}
                label="Banco / Conta"
                onChange={(e) => setBank(e.target.value)}
                sx={{ bgcolor: colors.input, color: colors.text }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: colors.paper,
                      color: colors.text,
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {getBankOptions().map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: `1px solid ${colors.border}` }}
        >
          <Button
            onClick={closeTransactionModal}
            color="inherit"
            disabled={isSavingTransaction}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ bgcolor: "#7c3aed" }}
            disabled={isSavingTransaction}
            startIcon={
              isSavingTransaction ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {isSavingTransaction ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteAccountId)}
        onClose={() => setDeleteAccountId(null)}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="delete-account-title">Excluir conta?</DialogTitle>
        <DialogContent id="delete-account-desc">
          <Typography color={colors.textSecondary}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteAccountId(null)}
            color="inherit"
            disabled={isDeletingAccount}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeletingAccount}
          >
            {isDeletingAccount ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteCardId)}
        onClose={() => setDeleteCardId(null)}
        aria-labelledby="delete-card-title"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="delete-card-title">Excluir cartão?</DialogTitle>
        <DialogContent>
          <Typography color={colors.textSecondary}>
            Confirme a exclusão deste cartão.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteCardId(null)}
            color="inherit"
            disabled={isDeletingCard}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteCard}
            color="error"
            variant="contained"
            disabled={isDeletingCard}
          >
            {isDeletingCard ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTransactionId)}
        onClose={() => setDeleteTransactionId(null)}
        aria-labelledby="delete-trans-title"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="delete-trans-title">Excluir lançamento?</DialogTitle>
        <DialogContent>
          <Typography color={colors.textSecondary}>
            O registro será removido permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTransactionId(null)}
            color="inherit"
            disabled={isDeletingTransaction}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteTransaction}
            color="error"
            variant="contained"
            disabled={isDeletingTransaction}
          >
            {isDeletingTransaction ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
