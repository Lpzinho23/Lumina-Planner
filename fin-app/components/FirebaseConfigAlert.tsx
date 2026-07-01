"use client";

import { Alert } from "@mui/material";
import {
  getFirebaseSetupIssue,
  readFirebaseEnvFromProcess,
} from "@/lib/firebaseConfig";

export default function FirebaseConfigAlert() {
  const issue = getFirebaseSetupIssue(readFirebaseEnvFromProcess());
  if (!issue) return null;

  return (
    <Alert severity="warning" role="status" sx={{ mb: 2 }}>
      {issue}
    </Alert>
  );
}
