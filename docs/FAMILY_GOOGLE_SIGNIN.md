# Family account — Google sign-in (optional)

Parents can sign up or sign in at `/account/signup` and `/account/login` with **Google** instead of a password. Children still use **Access ID** only at `/reader/login`.

## 1. Google Cloud setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. **Create project** (or pick an existing one).
3. **Configure OAuth consent screen** (External; add app name, support email, `catholickidscrafts.com` domain if verified).
4. **Create credentials** → **OAuth client ID** → **Web application**.
5. **Authorized JavaScript origins** (production + local):
   - `https://www.catholickidscrafts.com`
   - `http://localhost:3000` (dev)
6. **Authorized redirect URIs**:
   - `https://www.catholickidscrafts.com/api/auth/family/google/callback`
   - `http://localhost:3000/api/auth/family/google/callback` (dev)
7. Copy **Client ID** and **Client secret**.

## 2. Environment variables (Vercel + `.env`)

```bash
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

Also ensure:

- `AUTH_SECRET` — same secret used for family JWT cookies and OAuth state
- `NEXT_PUBLIC_SITE_URL` — production `https://www.catholickidscrafts.com` (used to build redirect URI)

Redeploy after setting env vars. The **Continue with Google** button appears only when both Google variables are set.

### Email sign-up troubleshooting

If sign-up shows **“Could not create account”** or **“temporarily unavailable”**, check on Vercel (Production):

1. **`AUTH_SECRET`** — required for sessions (generate: `openssl rand -base64 32`)
2. **`DATABASE_URL`** and **`DIRECT_URL`** — Neon Postgres connection strings
3. **Build logs** — confirm `prisma migrate deploy` succeeded (creates `FamilyAccount` table)

After changing env vars, **redeploy** Production.

## 3. Behavior

| Flow | Result |
|------|--------|
| New Google user | Creates `FamilyAccount` with `googleId`, no password |
| Existing email + password account | Links `googleId` on first Google sign-in (same email) |
| Google-only account | Email/password login returns a message to use Google |
| After sign-in | Sets `ckc_family` + `ckc_reader` (parent); merges guest Bible stickers |

Google receives: OpenID `email`, `profile` scopes only (no admin scopes).

## 4. Privacy

Disclosed on `/privacy` under family accounts and third-party sign-in.
