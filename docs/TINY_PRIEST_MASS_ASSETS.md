# Tiny Priest — Mass Quest 캐릭터·물품 에셋 브리프

미사 참여 게임(Mass Quest)과 **성당 밖 환영 공간(Courtyard)** 구현을 위해 먼저 준비할 캐릭터·물품 목록입니다.  
기존 `priest_front/back`, `nun_front/back`, `mary.png`, `church.png`, Stations(360×360)와 **동일 화풍·비율**을 유지합니다.

관련: `prisma/data/mass-order-steps.ts`, `src/lib/mass-participation/preview-script.ts`, `public/games/tiny-priest/script.js`

---

## 1. 화풍 & 기술 규격 (Art Bible)

### 1.1 비주얼 톤

| 항목 | 기준 |
|------|------|
| 스타일 | 부드러운 일러스트, 얇은 윤곽선, 따뜻한 파스텔·베이지 배경과 어울리는 채도 |
| 참고 파일 | `assets/priest_front.png`, `assets/nun_front.png`, `assets/mary.png`, `assets/church.png` |
| 피해야 할 것 | 사실적 3D, Poki용 과장된 네온, 성스러운 장면의 코믹 과장 |
| 조명 | 위에서 부드러운 빛, 그림자는 짧고 둥글게 |

### 1.2 캔버스 & 비율

| 용도 | 권장 픽셀 | 비율 | 비고 |
|------|-----------|------|------|
| 주요 캐릭터 (걷기·탭) | **1739×2250** (신부) 또는 **1545×2000** (수녀) | **~0.773** (가로÷세로) | front + back **쌍** 필수 |
| 성당 밖 NPC·가족 | **1200×1550** | ~0.77 | 디테일 약간 단순화 OK |
| 성모님 (조각상·환영) | **1545×1999** | mary.png와 동일 | 기존 `mary.png` 확장 |
| 손에 드는 물품 (2D) | **512×512** | 1:1 | 투명 PNG |
| 미사 단계 아이콘/HUD | **360×360** | Stations와 동일 | 파트별 카드용 |
| 성당 밖 소품 (벤치·성수조) | **800×600** ~ **1200×900** | 장면별 | `church.png`와 같은 따뜻한 팔레트 |

### 1.3 게임 내 월드 스케일 (3D)

| 요소 | 월드 단위 (현재 코드) |
|------|----------------------|
| 플레이어 스프라이트 높이 | **2.35** (`PLAYER_SPRITE_WORLD_HEIGHT`) |
| 손에 드는 소품 | 높이 **0.35–0.55**, 깊이 **0.15–0.3** (현재 liturgy box 0.52×0.64×0.26 참고) |
| 제단 위 물품 | 높이 **0.4–0.9**, 제단 면적 7×3.7 안에 배치 |
| 벽 걸이 그림 | 내부 **1.12×1.48** (Stations와 동일) |
| 성당 밖 2D 씬 | CSS `clamp` — 캐릭터 `12vw` max 168px, Mary `14vw` max 220px |

**규칙:** 새 캐릭터 PNG는 기존과 **같은 발-바닥 기준선**(캔버스 하단 여백)을 맞춰야 entry 화면·3D 빌보드에서 나란히 서도 어색하지 않습니다.

---

## 2. 캐릭터 — 우선순위별 제작 목록

### Phase A — 반드시 먼저 (미사 + 환영의 핵심)

| ID | 이름 (EN UI) | 파일명 (제안) | front/back | 역할 | 비고 |
|----|--------------|---------------|------------|------|------|
| `child_girl` | Child (girl) | `child_girl_front.png`, `_back.png` | ✅ | **미사 참여 플레이어** — 좌석에서 응답·자세 | 머리 높이 신부의 ~85% |
| `child_boy` | Child (boy) | `child_boy_front.png`, `_back.png` | ✅ | 플레이어 선택지 2 | alb 없이 평상복 |
| `celebrant` | Celebrant | `celebrant_front.png`, `_back.png` | ✅ | 제단 **주례 신부** NPC | 기존 priest와 구분: **chasuble** 색상 레이어(시즌별 스왑 또는 4색 세트) |
| `greeter_nun` | Sister (greeter) | `nun_front.png` 재사용 또는 `nun_welcome_front.png` | front만 우선 | 현관·성당 밖 인사 | 미소·손 흔들기 pose variant |
| `greeter_priest` | Father (greeter) | `priest_welcome_front.png` | front만 우선 | 신부님 환영 대사 | 기존 priest와 옷만 동일, 표정만 밝게 |

**설계 의도:** 지금은 플레이어가 신부/수녀 스프라이트로 성당에 들어갑니다. Mass Quest에서는 **아이 캐릭터가 신자**이고, 신부님은 **제단 NPC**가 자연스럽습니다. entry에서는 여전히 신부/수녀를 탭해 인사한 뒤, “오늘은 아이로 참여할래?” → boy/girl 선택.

### Phase B — 미사 연출 풍부함

| ID | 이름 | 파일명 | 역할 | 연결 Mass step |
|----|------|--------|------|----------------|
| `lector` | Lector | `lector_front.png`, `_back.png` | 독서대에서 말씀 | 1st/2nd Reading |
| `altar_server` | Altar server | `server_front.png`, `_back.png` | 선물 봉헌 행진 | Preparation of the Gifts |
| `family_mom` | Parishioner | `family_adult_front.png` | 좌석·마당 배경 | Sign of Peace, 환영 |
| `family_toddler` | Little child | `family_toddler_front.png` | 마당에서 손 흔듦 | Courtyard 이벤트 |

### Phase C — 시즌·확장

| ID | 용도 |
|----|------|
| `deacon` | 복음 독서·보조 (선택) |
| `choir_member` | 입장송·할렐루야 (악보 들고) |
| `mary_living` | 대림/성탄 **환영 일러스트** (조각상과 별도, 후광만 — 얼굴은 조각상과 톤 통일) |
| `jesus_good_shepherd` | **비추천** — 아이들용으로는 빛·십자가 상징만 사용 |

### 캐릭터 포즈 세트 (같은 캐릭터, 별도 PNG 또는 스프라이트 시트)

미사 단계 `gesture`와 맞춤 (`MASS_ORDER_GESTURES`):

| 포즈 ID | 제스처 | 누가 |
|---------|--------|------|
| `pose_idle` | idle | 전원 |
| `pose_sign_cross` | signCross | celebrant, child |
| `pose_pray` | pray | 전원 |
| `pose_orans` | ourFather | celebrant, assembly |
| `pose_point_gospel` | point | celebrant, lector |
| `pose_hold_gift` | hold | server, child |
| `pose_elevate` | lift | celebrant only |
| `pose_kneel` | (신규) | child, assembly |
| `pose_peace` | (신규) | family, child |
| `pose_wave` | (신규) | greeter, courtyard |

**제작 팁:** Phase A는 **front/back 걷기**만으로 시작하고, 포즈는 Phase B에서 **상반신 클로즈업 512×512**로 HUD에 띄워도 됩니다 (전신 24장을 한 번에 만들 필요 없음).

---

## 3. 물품 — 우선순위별 제작 목록

### Phase A — 24 Mass Order 단계에 직접 연결

| ID | 이름 (EN) | 파일명 | 2D | 3D prop | Mass step(s) |
|----|-----------|--------|-----|---------|--------------|
| `item_chalice` | Chalice | `item_chalice.png` | 512² | 높이 0.45 | EP, Communion |
| `item_patten` | Paten | `item_patten.png` | 512² | Ø0.35 | Offertory, Communion |
| `item_ciborium` | Ciborium | `item_ciborium.png` | 512² | 높이 0.5 | Communion |
| `item_host` | Host | `item_host.png` | 256² | Ø0.12 | Elevación |
| `item_bread_loaf` | Bread (gifts) | `item_bread_loaf.png` | 512² | 0.4×0.25 | Preparation of Gifts |
| `item_wine_cruet` | Wine cruet | `item_wine_cruet.png` | 512² | 0.35 | Preparation of Gifts |
| `item_water_cruet` | Water cruet | `item_water_cruet.png` | 512² | 0.35 | Preparation of Gifts |
| `item_missal` | Missal / Book | `item_missal.png` | 512² | 0.5×0.35 | Collect, EP |
| `item_lectionary` | Lectionary | `item_lectionary.png` | 512² | 0.55×0.4 | Readings |
| `item_processional_cross` | Processional cross | `item_cross_processional.png` | 512² | 높이 1.2 | Entrance |
| `item_candle` | Candle | `item_candle.png` | 256² | 기존 voxel 확장 | 전 구간 |
| `item_thurible` | Thurible (선택) | `item_thurible.png` | 512² | — | Incense optional |

### Phase B — 성당 밖 · 공동체

| ID | 이름 | 파일명 | Courtyard 용도 |
|----|------|--------|----------------|
| `item_holy_water_font` | Holy water font | `courtyard_font.png` | 성수조 — “성호를 그으며 들어가요” |
| `item_bulletin_board` | Bulletin board | `courtyard_bulletin.png` | 오늘 미사·환영 메시지 |
| `item_bench` | Parish bench | `courtyard_bench.png` | 가족 NPC 앉기 |
| `item_flower_basket` | Flowers for Mary | `courtyard_flowers.png` | 성모님께 꽃 한 송이 |
| `item_church_bell` | Bell (small) | `courtyard_bell.png` | 탭 시 부드러운 종소리 |
| `item_welcome_sign` | Welcome home sign | `courtyard_sign.png` | “Welcome home” / “환영합니다” |

### Phase C — 시즌 스왑 (같은 슬롯, 이미지만 교체)

| 시즌 | 추가 물품 |
|------|-----------|
| Advent/Lent | 보라색 chasuble 텍스처, 초 |
| Easter | 백색·금색, 백합 |
| Palm Sunday | `item_palm.png` |
| Ash Wednesday | `item_ashes.png` (회중 그릇) |

### 물품 화풍

- Stations(`station-01.png`)와 같이 **단순하고 읽기 쉬운 실루엣**, 따뜻한 갈색·금색 하이라이트.
- 금속(성배)은 과한 반사 없이 **부드러운 하이라이트 한 줄**.

---

## 4. 성당 밖 — 「Courtyard of Welcome」 설계

성당 **안** 3D에 들어가기 **전**, `church.png` 앞 마당을 **가로 스크롤 또는 탭 핫스팟** 2D 씬으로 확장합니다.  
목표: *“하나의 가정 같은 공동체, 하느님·신부님·수녀님·성모님이 나를 기다리신다”*.

### 4.1 공간 레이아웃 (왼쪽 → 오른쪽)

```
[성모님 조각상 + 꽃바구니] — [벤치·가족 NPC] — [성당 정문] — [성수조] — [게시판]
         ↑ 탭                    ↑ 손 흔듦              ↑ 신부/수녀    ↑ 성호      ↑ 오늘 말씀
```

- 배경: `church.png` 확장 또는 `courtyard_bg.png` (동일 화풍, 하늘·잔디·길).
- 정문은 기존 `door-zoom` 앵커(`--door-x/y`) 유지.

### 4.2 미니 이벤트 (각 20–40초, 스킵 가능)

| 순서 | 이벤트 | 캐릭터/물품 | 아이가 받는 느낌 |
|------|--------|-------------|------------------|
| 1 | **Ring & Welcome** | `greeter_priest` / `greeter_nun` | “잘 왔어요! 오늘도 하느님 집에 온 걸 환영해요.” |
| 2 | **Holy Water** | `item_holy_water_font` | 성호 애니 + 짧은 문구 (“하느님께 마음을 열어요”) |
| 3 | **Mary’s Corner** | `mary.png` + `courtyard_flowers` | 꽃 1개 선택 → “성모님이 너를 보고 계셔요” (가족 같은 돌봄) |
| 4 | **Parish Family** | `family_*` on bench | NPC가 손 흔듦 → 탭하면 “우리도 같이 미사해요!” |
| 5 | **Today’s Word** | `courtyard_bulletin` | 오늘 복음 한 줄 (API 또는 정적) |
| 6 | **Open the Door** | 정문 | 신부/수녀가 문 열어 줌 → 기존 zoom-in → 3D interior |

**실패/압박 없음:** 모든 이벤트는 optional. “바로 들어가기”는 항상 가능 (아이들 재방문용).

### 4.3 “하느님이 기다리신다” 연출 (직접 얼굴 X)

- 정문 위 **부드러운 빛** (CSS radial gradient, 금색 `#f5e6b8`).
- 성모님 조각상 탭 시 **은은한 후광** 펄스 (1회).
- 배경음: 아주 낮은 종 + 새소리 (mute 버튼 필수).

### 4.4 Courtyard → Mass Quest 연결

- Courtyard에서 완료한 항목 → **작은 별 스티커** (localStorage).
- 성당 안 Mass Quest 시작 시 “오늘 성모님께 꽃을 드렸어요 ✓” 한 줄 격려.

---

## 5. 제작 순서 (권장 스프린트)

### Sprint 1 — 캐릭터 4쌍 + 환영

1. `child_girl` / `child_boy` front+back  
2. `celebrant` front+back (green chasuble 기본)  
3. `priest_welcome_front`, `nun_welcome_front` (또는 기존 표정 variant)  
4. `courtyard_font.png`, `courtyard_flowers.png`, `courtyard_sign.png`

### Sprint 2 — 미사 핵심 물품 8종

`item_chalice`, `item_patten`, `item_bread_loaf`, `item_wine_cruet`, `item_water_cruet`, `item_missal`, `item_lectionary`, `item_processional_cross`

### Sprint 3 — NPC + 시즌

`lector`, `altar_server`, `family_*`, chasuble 색 4종 스왑

---

## 6. 파일 배치 (repo)

```
public/games/tiny-priest/assets/
  characters/          # 기존 glb (미사용) — 유지
  mass/
    characters/        # 새 front/back PNG
    items/             # 512² 물품
    courtyard/         # 마당 배경·소품
    icons/             # 360² HUD
  manifest/
    asset-manifest.json   # ID → path, phase, massStepIds
```

일러스트 제출 시 **파일명 = manifest ID**를 맞추면 코드 연동이 빠릅니다.

---

## 7. 검수 체크리스트 (일러스트 납품 시)

- [ ] 투명 배경 PNG, 가장자리 halo 없음  
- [ ] front/back **발 위치** 동일 (바닥에서 3–5% 패딩)  
- [ ] 가로:세로 비율 **0.77 ± 0.02**  
- [ ] `priest_front.png`와 나란히 봤을 때 **머리 크기·선 굵기** 일치  
- [ ] 종교 물품은 교리적으로 부적절한 요소 없음 (호스트는 빵 형태, 십자가는 단순)  
- [ ] 512² 아이콘은 **실루엣만으로도** 구분 가능  

---

## 8. 다음 코드 작업 (에셋 준비 후)

1. `CHARACTER_CONFIG`에 `child_girl`, `child_boy`, `celebrant` 추가  
2. Courtyard HTML 레이어 (`#courtyard-screen`) entry와 정문 사이 삽입  
3. `asset-manifest.json` 로더 + Mass step → `item_*` / `pose_*` 매핑  
4. Participation lines와 stepIndex 브릿지 테이블  

---

*문서 버전: 2026-08-31 — operator & 일러스트 공유용*
