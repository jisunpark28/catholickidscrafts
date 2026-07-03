# For teachers

Catholic Kids Crafts is built for **individual catechists and Catholic school teachers** running Sunday school or religion class—not parish-wide admin workspaces.

## Product name

We call assembled classroom lessons **Lesson Kits** (not “Recipe” or other internal codenames).

## Account model

| Role | Technical model | What you do |
|------|-----------------|-------------|
| **Teacher** | `FamilyAccount` (free sign-in) | Build Lesson Kits, run class, assign follow-up |
| **Student** | `SubProfile` + Access ID | Sign in at `/reader/login`, see assigned lesson on home |

Create students from **Teacher dashboard** (`/account`) → **Add student**. Copy each Access ID once and give it to the child.

## Lesson Kits (`/program`)

1. **My Sunday** — pin the kit you will run this Sunday (`/program` top card). **Run classroom**, **Copy at-home link**, or **Edit** your personal copy.
2. **Run** a starter template in class (one link: games, Gospel typing, crafts). Try the showcase kit: [`/lesson/lent-wk1-g3`](/lesson/lent-wk1-g3) (Lent Week 1, Grade 3).
3. **Use this** to copy a template into your account and edit steps.
4. Optional **TPT pack link** on your kit — free sample on this site, full worksheets on [Teachers Pay Teachers](https://www.teacherspayteachers.com/store/catholic-kids-crafts).

In the kit editor, use **At-home link** to set Gospel length, choose smart defaults per step, or pick exact steps for the `/family` runner.

## Assign to students

From `/account`, pick a kit for the week and optionally one student. They see **Teacher assigned** on the home page and open the shortened family runner.

**Lesson activity** (same dashboard) shows kit opens this week and each student’s completions, including whether this week’s assignment is done.

## TPT partnership

- Site = run lessons, games, and samples in the room.
- TPT = printable packs and seasonal bundles we link from kits and the hub.
- Set `NEXT_PUBLIC_TPT_STORE_URL` in production to your store URL.

## Deploy

```bash
pnpm run db:migrate-deploy
pnpm run db:seed-production-once
```

See also [`docs/LESSON_KITS.md`](LESSON_KITS.md) and [`docs/GITHUB_PROD_SEED.md`](GITHUB_PROD_SEED.md).
