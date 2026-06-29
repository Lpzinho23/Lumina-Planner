"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { auth, db, storage } from "@/lib/firebase";
import {
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, getDocs, writeBatch } from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Switch,
  CircularProgress,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  CloudDownload,
  DeleteForever,
  DarkMode,
  LightMode,
  PhotoCamera,
  AccountCircle,
  Save,
  LockReset,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { formatBRL } from "@/lib/format";
import { isExpenseType } from "@/lib/finance";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { escapeCSV } from "@/lib/csv";
import { extractAuthErrorCode } from "@/lib/authErrors";
import { validateAvatarFile } from "@/lib/security";
import { sanitizeDisplayName } from "@/lib/profileValidation";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useAppTheme();
  const { transactions } = useTransactions(user?.uid);

  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoPreviewObjectUrl, setPhotoPreviewObjectUrl] = useState<string | null>(
    null,
  );
  const [profileLoading, setProfileLoading] = useState(false);

  const [isResettingData, setIsResettingData] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [passModalOpen, setPassModalOpen] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const accountSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => isExpenseType(t.type))
      .reduce((a, t) => a + t.amount, 0);
    const globalBalance = totalIncome - totalExpense;
    return {
      totalIncome,
      totalExpense,
      globalBalance,
      count: transactions.length,
    };
  }, [transactions]);

  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
    if (user?.photoURL) setPhotoPreview(user.photoURL);
  }, [user]);

  useEffect(() => {
    return () => {
      if (photoPreviewObjectUrl) {
        URL.revokeObjectURL(photoPreviewObjectUrl);
      }
    };
  }, [photoPreviewObjectUrl]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    const displayNameValidation = sanitizeDisplayName(name);
    if (!displayNameValidation.ok) {
      toast.error(displayNameValidation.message);
      return;
    }
    setProfileLoading(true);
    try {
      let photoURL = user.photoURL;
      if (photoFile) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateProfile(user, {
        displayName: displayNameValidation.value,
        photoURL,
      });
      toast.success("Perfil atualizado!");
    } catch (error: unknown) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Não foi possível atualizar o perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    if (photoPreviewObjectUrl) {
      URL.revokeObjectURL(photoPreviewObjectUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreviewObjectUrl(objectUrl);
    setPhotoFile(file);
    setPhotoPreview(objectUrl);
  };

  const applyPasswordChange = async (currentPassword?: string) => {
    if (!user || auth.currentUser?.uid !== user.uid) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }
    if (!auth.currentUser?.email) {
      toast.error("Usuário sem e-mail vinculado.");
      return;
    }
    const u = auth.currentUser;
    if (currentPassword) {
      const email = u.email;
      if (!email) {
        toast.error("Conta sem e-mail para reautenticação.");
        return;
      }
      const cred = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(u, cred);
    }
    await updatePassword(u, newPass);
    toast.success("Senha alterada com sucesso!");
    setPassModalOpen(false);
    setNewPass("");
    setConfirmPass("");
    setReauthOpen(false);
    setReauthPassword("");
  };

  const handleChangePassword = async () => {
    if (!newPass || !confirmPass) return toast.error("Preencha os campos.");
    if (newPass !== confirmPass) return toast.error("As senhas não coincidem.");
    if (newPass.length < 6) return toast.error("Mínimo de 6 caracteres.");
    if (!auth.currentUser) return;

    setLoadingPass(true);
    try {
      await applyPasswordChange();
    } catch (error: unknown) {
      console.error(error);
      const code = extractAuthErrorCode(error);
      if (code === "auth/requires-recent-login") {
        setReauthOpen(true);
        toast.error("Confirme sua senha atual para continuar.");
      } else {
        toast.error("Erro ao alterar senha.");
      }
    } finally {
      setLoadingPass(false);
    }
  };

  const handleReauthSubmit = async () => {
    if (!reauthPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    setReauthLoading(true);
    try {
      await applyPasswordChange(reauthPassword);
    } catch (error: unknown) {
      console.error(error);
      const code = extractAuthErrorCode(error);
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        toast.error("Senha atual incorreta.");
      } else {
        toast.error("Não foi possível validar a senha.");
      }
    } finally {
      setReauthLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      const headers = [
        "data",
        "descricao",
        "categoria",
        "valor",
        "tipo",
        "banco",
      ];
      const rows = querySnapshot.docs.map((d) => {
        const x = d.data();
        return [x.date, x.description, x.category, x.amount, x.type, x.bank]
          .map(escapeCSV)
          .join(",");
      });
      const csv =
        "\uFEFF" + headers.join(",") + "\r\n" + rows.join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meus_gastos.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error: unknown) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Não foi possível exportar os dados.");
    } finally {
      setExporting(false);
    }
  };

  const handleResetAccount = async () => {
    if (!user) return;
    setIsResettingData(true);
    try {
      const batch = writeBatch(db);
      const snapT = await getDocs(
        query(collection(db, `users/${user.uid}/transactions`)),
      );
      snapT.docs.forEach((d) => batch.delete(d.ref));
      const snapC = await getDocs(query(collection(db, `users/${user.uid}/cards`)));
      snapC.docs.forEach((d) => batch.delete(d.ref));
      const snapA = await getDocs(
        query(collection(db, `users/${user.uid}/accounts`)),
      );
      snapA.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      toast.success("Dados apagados.");
      setResetDialogOpen(false);
      setResetConfirmText("");
    } catch (error: unknown) {
      console.error("Erro ao zerar conta:", error);
      toast.error("Não foi possível limpar os dados.");
    } finally {
      setIsResettingData(false);
    }
  };

  const runDeleteAccount = async (password: string) => {
    if (!user?.email) {
      toast.error("Conta sem e-mail não pode ser reautenticada por senha.");
      return;
    }
    const u = auth.currentUser;
    if (!u) {
      toast.error("Sessão inválida.");
      return;
    }
    if (u.uid !== user.uid) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(u, cred);

    const batch = writeBatch(db);
    const snapT = await getDocs(
      query(collection(db, `users/${user.uid}/transactions`)),
    );
    snapT.docs.forEach((d) => batch.delete(d.ref));
    const snapC = await getDocs(query(collection(db, `users/${user.uid}/cards`)));
    snapC.docs.forEach((d) => batch.delete(d.ref));
    const snapA = await getDocs(
      query(collection(db, `users/${user.uid}/accounts`)),
    );
    snapA.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    await deleteUser(u);
    toast.success("Conta excluída.");
    setDeleteAccountOpen(false);
    setDeleteConfirmText("");
    setDeletePassword("");
    setReauthOpen(false);
    setReauthPassword("");
    router.push("/login");
  };

  const handleDeleteAccountConfirm = async () => {
    if (!user) return;
    if (deleteConfirmText !== "EXCLUIR") {
      toast.error('Digite exatamente "EXCLUIR" para confirmar.');
      return;
    }
    if (!deletePassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    setDeleteLoading(true);
    try {
      await runDeleteAccount(deletePassword);
    } catch (error: unknown) {
      console.error(error);
      const code = extractAuthErrorCode(error);
      if (code === "auth/requires-recent-login") {
        toast.error("Faça login novamente e tente excluir a conta.");
      } else if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        toast.error("Senha incorreta.");
      } else {
        toast.error("Não foi possível excluir a conta.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const memberSince =
    user?.metadata.creationTime != null
      ? new Date(user.metadata.creationTime).toLocaleDateString("pt-BR")
      : "—";

  return (
    <Box maxWidth="md" sx={{ mx: "auto", p: 2 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" color={colors.text} mb={4}>
        Configurações
      </Typography>

      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="h6" component="h2" color={colors.text} mb={2}>
          Resumo da conta
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} mb={2}>
          Patrimônio líquido (receitas − despesas):{" "}
          <strong style={{ color: colors.text }}>
            {formatBRL(accountSummary.globalBalance)}
          </strong>
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} mb={2}>
          Lançamentos:{" "}
          <strong style={{ color: colors.text }}>{accountSummary.count}</strong>
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Membro desde:{" "}
          <strong style={{ color: colors.text }}>{memberSince}</strong>
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="h6" component="h2" color={colors.text} mb={3}>
          Meu Perfil
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
          <Box position="relative">
            <Avatar
              src={photoPreview}
              sx={{ width: 100, height: 100, bgcolor: colors.primary, fontSize: 40 }}
            >
              {!photoPreview && <AccountCircle fontSize="inherit" />}
            </Avatar>
            <IconButton
              component="label"
              aria-label="Trocar foto de perfil"
              sx={{
                position: "absolute",
                bottom: -5,
                right: -5,
                bgcolor: colors.primary,
                color: "#fff",
                "&:hover": { bgcolor: "#6d28d9" },
              }}
            >
              <PhotoCamera fontSize="small" />
              <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
            </IconButton>
          </Box>
          <Box flex={1} width="100%">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { color: colors.text, bgcolor: colors.input },
                    "& .MuiInputLabel-root": { color: colors.textSecondary },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="E-mail"
                  fullWidth
                  value={user?.email || ""}
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: colors.textSecondary,
                      bgcolor: "rgba(0,0,0,0.1)",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleUpdateProfile}
                disabled={profileLoading}
                sx={{ bgcolor: colors.primary, flex: 1 }}
              >
                {profileLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockReset />}
                onClick={() => setPassModalOpen(true)}
                sx={{ color: colors.text, borderColor: colors.border, flex: 1 }}
              >
                Alterar Senha
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color={colors.text} fontWeight="bold">
              Tema Escuro
            </Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              Alternar aparência.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <LightMode sx={{ color: !isDarkMode ? colors.primary : colors.textSecondary }} />
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              color="secondary"
              inputProps={{ "aria-label": "Alternar tema escuro/claro" }}
            />
            <DarkMode sx={{ color: isDarkMode ? colors.primary : colors.textSecondary }} />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="h6" component="h2" color={colors.text} mb={3}>
          Dados
        </Typography>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography color={colors.text} fontWeight="bold">
                Exportar CSV
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={
                exporting ? <CircularProgress size={20} /> : <CloudDownload />
              }
              onClick={handleExportData}
              disabled={exporting}
              aria-busy={exporting}
              sx={{ color: colors.text, borderColor: colors.border }}
            >
              Baixar
            </Button>
          </Box>
          <Divider sx={{ bgcolor: colors.border }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography color="#ef4444" fontWeight="bold">
                Zerar Conta
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={() => setResetDialogOpen(true)}
              disabled={isResettingData}
              aria-busy={isResettingData}
            >
              {isResettingData ? "Apagando…" : "Apagar Tudo"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 4,
          bgcolor: colors.paper,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="h6" component="h2" color={colors.danger} mb={2}>
          Zona de perigo: Excluir conta
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} mb={2}>
          Remove sua conta de autenticação e apaga transações, cartões e contas no
          Firestore. Esta ação não pode ser desfeita.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteAccountOpen(true)}
        >
          Excluir minha conta
        </Button>
      </Paper>

      <Dialog
        open={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
            color: colors.text,
            width: "calc(100vw - 32px)",
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Nova Senha"
              type="password"
              fullWidth
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
            <TextField
              label="Confirmar Nova Senha"
              type="password"
              fullWidth
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
                "& .MuiInputLabel-root": { color: colors.textSecondary },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPassModalOpen(false)}
            color="inherit"
            disabled={loadingPass}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loadingPass}
            sx={{ bgcolor: colors.primary }}
          >
            {loadingPass ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reauthOpen}
        onClose={() => {
          setReauthOpen(false);
          setReauthPassword("");
        }}
        aria-labelledby="reauth-title"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="reauth-title">Confirmar senha atual</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color={colors.textSecondary} id="reauth-desc" mb={2}>
            Por segurança, informe sua senha atual para continuar.
          </Typography>
          <TextField
            type="password"
            fullWidth
            label="Senha atual"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReauthOpen(false);
              setReauthPassword("");
            }}
            color="inherit"
            disabled={reauthLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReauthSubmit}
            variant="contained"
            disabled={reauthLoading}
            sx={{ bgcolor: colors.primary }}
          >
            {reauthLoading ? "Validando..." : "Continuar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resetDialogOpen}
        onClose={() => {
          setResetDialogOpen(false);
          setResetConfirmText("");
        }}
        aria-labelledby="reset-title"
        aria-describedby="reset-desc"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="reset-title">Zerar todos os dados</DialogTitle>
        <DialogContent>
          <Typography id="reset-desc" variant="body2" color={colors.textSecondary} mb={2}>
            Esta ação apaga transações, cartões e contas. Digite{" "}
            <strong>DELETAR</strong> para confirmar.
          </Typography>
          <TextField
            fullWidth
            label='Digite "DELETAR" para confirmar'
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setResetDialogOpen(false);
              setResetConfirmText("");
            }}
            color="inherit"
            disabled={isResettingData}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={resetConfirmText !== "DELETAR" || isResettingData}
            onClick={handleResetAccount}
          >
            {isResettingData ? "Apagando…" : "Apagar Tudo"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteAccountOpen}
        onClose={() => {
          setDeleteAccountOpen(false);
          setDeleteConfirmText("");
          setDeletePassword("");
        }}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}
      >
        <DialogTitle id="delete-account-title">Excluir conta permanentemente</DialogTitle>
        <DialogContent>
          <Typography id="delete-account-desc" variant="body2" color={colors.textSecondary} mb={2}>
            Digite <strong>EXCLUIR</strong> e sua senha atual. Em seguida confirmaremos
            no servidor.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label='Confirmação (digite "EXCLUIR")'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Senha atual"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: colors.input, color: colors.text },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteAccountOpen(false);
              setDeleteConfirmText("");
              setDeletePassword("");
            }}
            color="inherit"
            disabled={deleteLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={
              deleteConfirmText !== "EXCLUIR" ||
              !deletePassword ||
              deleteLoading
            }
            onClick={handleDeleteAccountConfirm}
          >
            {deleteLoading ? "Excluindo…" : "Excluir definitivamente"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
