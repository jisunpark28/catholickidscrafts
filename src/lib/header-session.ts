export type HeaderSessionResponse = {
  family: { email: string; displayName: string | null } | null;
  reader: { type: "owner" | "sub"; displayName: string } | null;
};
