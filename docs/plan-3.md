# book-flip-showcase — v3 개발 기획

이 문서는 v2 CSS 플립 엔진을 기반으로, **종이책을 넘기는 듯한 커브 모션**과 **스프레드 중앙(책장) 그림자**를 한 단계 끌어올리고, 업계·학술·오픈소스에서 검증된 노하우를 바탕으로 **인터랙션 강화 백로그**를 정의한다.

- 선행 문서: [`plan-1.md`](./plan-1.md) (v1 제품 범위), [`plan-2.md`](./plan-2.md) (v1 동결 · v2 공존 아키텍처)
- 영문 버전: [`plan-3-en.md`](./plan-3-en.md)
- v2 현황 요약: [`v2-improvements-over-v1.md`](./v2-improvements-over-v1.md)
- 작성: **Cursor Agent**
- 상태: **보완 초안 (revised draft)** — v3 스캐폴딩 전 기술 검증 단계

---

## 1. 배경과 목표

### 1.1 v2에서 해결된 것 (v3의 출발점)

v2 M2.2(#71–#78)에서 다음이 `main`에 반영되었다.

| 영역 | v2 결과 |
| --- | --- |
| Classic 회전 | spine pivot, container `perspective`, Y축 단일 회전 |
| 핸드오프 | static/outgoing 레이어 분리, transition-end cleanup, spread mask |
| 경계 페이지 | 커버·마지막 spread/single reveal 지연 |
| spine overlay | spread 전용 1px gradient, `idle` / `active` phase |

v2는 **깜빡임·pop을 줄인 CSS rigid leaf** 수준이다. 페이지는 여전히 **평면(`rotateY`)** 이고, curl은 시각적 skew에 가깝다.

### 1.2 v3 핵심 목표

1. **자연스러운 커브 모션** — 평면 회전이 아니라, 원통(cylinder) 또는 다분할 mesh를 따라 휘어지는 종이 넘김.
2. **책장 중앙 그림자의 연속성** — 2페이지 spread의 gutter shadow가 phase 경계에서 **깜빡이지 않고** flip progress에 따라 부드럽게 변화.
3. **인터랙션 강화** — 클릭/버튼 외 **드래그·코너 grab·진행률 연동 피드백** 등 실제 리더 앱 수준의 조작감.

### 1.3 성공 지표

“자연스럽다”를 주관적 감상으로만 판단하지 않고 아래 지표를 함께 사용한다.

| 영역 | v3 목표 |
| --- | --- |
| 시각 연속성 | gutter/leaf opacity 및 width가 시작·중간·종료 프레임에서 불연속적으로 점프하지 않음 |
| 입력 반응 | pointer 이동 후 다음 시각 프레임에 curl progress 반영 |
| 성능 | 기준 데스크톱 p95 frame time ≤ 16.7ms, 기준 모바일 p95 ≤ 33.3ms |
| 안정성 | forward/backward 20회 연속 flip 후 DOM/GPU 리소스와 표시 페이지가 정상 |
| 접근성 | `prefers-reduced-motion: reduce`에서 커브·parallax 제거, 짧은 fade/즉시 전환 제공 |
| 호환성 | WebGL 미지원·context loss 시 CSS renderer로 자동 전환 |

### 1.4 Non-goals (v3 1차 범위 밖)

- EPUB 파싱, DRM, 사용자 계정, CMS
- SSR / API
- v1·v2 코드 직접 수정 (v3는 `src/v3/**` 신규 트리)
- 상용 flipbook 전체 기능 복제 (검색, TOC, 오디오 북 등)
- 실제 종이의 유한요소 해석 수준 물리 시뮬레이션

---

## 2. v2 한계 분석 (v3가 풀어야 할 문제)

### 2.1 커브 모션이 부족한 이유

현재 `flip-presets.ts` Classic/Curl 모두 **단일 DOM leaf + CSS transform** 이다.

```ts
// v2 classic — rigid plane rotation only
transform: 'rotateY(-180deg)'
```

- 페이지 두께·굴곡이 없어 **카드 뒤집기**에 가깝다.
- Curl preset도 spread 모드에서 `rotateY(-178deg)` 수준이며, **실제 cylindrical deformation** 이 아니다.
- `plan-1` §3.3에 명시된 “drag a page corner” 는 v1/v2 모두 **미구현** (반쪽 클릭 + 버튼만).

**물리적 모델 (리서치 공통점)**

페이지 curl은 **curl axis(접힘선)** 를 기준으로 한 **원통 변형**으로 모델링한다. fragment/vertex shader 또는 subdivided mesh가 각 픽셀/정점을 (1) 평면 outgoing, (2) 원통 표면, (3) incoming 평면, (4) 그림자 영역으로 분류한다.
참고: [Page Curl Shader Breakdown](https://andrewhungblog.wordpress.com/2018/04/29/page-curl-shader-breakdown/), [fullPage Book Flip / InvertedPageCurl](https://alvarotrigo.com/fullPage/page-flip-effect/), [TurnGL cylindrical vertex math](https://github.com/oguzhanT/turngl).

### 2.2 책장 그림자가 여전히 깜빡이는 이유

v2 spine (`PageFlip.tsx` L216–227):

- **1px 고정 gradient** + `data-flip-phase` 이 `idle` ↔ `active` 로만 전환
- leaf shadow는 #73 이후 spread에서 **상수** — gutter 깊이 변화가 overlay phase에만 의존
- 애니메이션은 **double-RAF `initial` → `final` 2단계** — 중간 progress가 없어 연속 조명 불가
- static layer mask 전환, outgoing mount/unmount 시점과 spine이 **동기화되지 않으면** 1프레임 flash 발생

사용자 체감 “깜빡임”은 pop(#73) 완화 이후에도 **이산 phase + 단일 overlay** 한계에서 온다.

### 2.3 인터랙션 갭

| plan-1 목표 | v2 상태 |
| --- | --- |
| 페이지 코너 드래그 | 없음 |
| 스와이프 넘김 | 없음 (반쪽 tap만) |
| scrubber | 있음 (페이지 점프, curl 미리보기 없음) |
| 키보드 | 있음 |

---

## 3. 기둥 A — 자연스러운 커브 모션

### 3.1 품질 단계 (Tier) 전략

한 번에 WebGL로 가지 않고, **측정 가능한 단계**로 올린다.

| Tier | 기술 | 커브 품질 | 번들/복잡도 | 권장 마일스톤 |
| --- | --- | --- | --- | --- |
| **T1** | CSS multi-strip (8–16 vertical segments, 각 strip `rotateY` + `translateZ`) | 준-커브 | 낮음 | fallback 후보 |
| **T2** | Canvas 2D + CPU mesh / page curl | 중간 | 중간 | M3.0 비교 후 보류/탈락 결정 |
| **T3** | WebGL/Three.js subdivided `PlaneGeometry` + cylindrical vertex displacement | 높음 | 높음 | v3 기본 목표 |
| **T4** | Fragment shader page curl (dual texture, `uProgress`) | 최고 | 높음 | v3.1 이후 선택 |

**권장 기본 경로:** T1으로 빠르게 체감 개선 → T3를 `classic+` / `curl` preset의 기본 엔진으로 승격.

참고 OSS: [TurnGL](https://github.com/oguzhanT/turngl) (`segments`, `LEAD` factor), [mantine-book `rounded`](https://github.com/gfazioli/mantine-book) (WebGL + flat fallback).

**M3.0 1차 결정 (#81):**

- T3 WebGL/Three.js를 기본 품질 경로로 채택한다.
- T1 CSS segmented renderer를 reduced-capability fallback으로 유지한다.
- T2 Canvas 2D CPU mesh는 DOM/CSS fallback보다 복잡하면서 T3의 법선 기반 조명·GPU 변형 이점을 제공하지 못하므로 보류한다.
- 모든 renderer는 `src/v3/lib/curl-model.ts`의 endpoint, lead, 방향 대칭, gutter-lighting 불변 조건을 공유한다.
- 실제 브라우저 frame-time과 시각 품질 비교는 M3.2c에서 최종 채택 게이트로 다시 검증한다.

### 3.2 커브 모션 설계 원칙

1. **Spine 고정** — 변형 pivot은 항상 gutter(spine) 쪽; spread forward는 `transform-origin: left center`.
2. **LEAD factor** — 바깥 가장자리가 spine보다 먼저 들리도록 progress에 비선형 가중 (TurnGL 패턴).
3. **Back face** — 회전 leaf 뒷면은 종이 톤(`#f5f0e8` 등) + 약한 노이즈; 이미지 뒷면과 구분.
4. **Thickness cue** — 페이지 측면 1–2px gradient strip (fore-edge)로 책 두께 암시.
5. **Hardcover** — 커버/뒷표지는 curl 없이 rigid rotate (mantine-book `withCover` 패턴).
6. **Reduced motion** — curl 비활성, v2와 동일한 cross-fade fallback.

### 3.3 권장 곡률 모델

v3 MVP는 완전한 종이 물리 시뮬레이션 대신 **developable surface(늘어나지 않고 휘는 표면)** 를 근사한다. 원통·원뿔·평면은 대표적인 developable surface이며, 페이지 넘김은 이를 조합한 모델로 충분히 설득력 있게 표현할 수 있다.

각 정점의 원래 가로 위치를 `x`, spine에서 free edge까지 정규화한 값을 `u ∈ [0, 1]`, 진행률을 `p ∈ [0, 1]`로 둔다.

```text
angle(u, p)  = direction * PI * ease(p) * lead(u)
radius(p)    = mix(R_MAX, R_MIN, sin(PI * p))
lift(u, p)   = sin(PI * u) * sin(PI * p) * LIFT_MAX
```

- `lead(u)`는 free edge가 먼저 반응하도록 `u^γ` 또는 조절 가능한 곡선을 사용한다.
- `radius(p)`는 시작/종료에서 크게, 중간에서 작게 하여 중앙 구간의 curl을 강조한다.
- 중간 진행률에서만 약한 `lift`를 적용하고 시작·종료에는 정확히 0으로 수렴시킨다.
- 정점 위치뿐 아니라 **법선(normal)** 을 매 프레임 재계산하거나 shader에서 도출해야 하이라이트와 그림자가 곡률을 따라 움직인다.

**채택 결정:** M3.2a의 CSS segmented renderer는 UX 검증용 fallback으로 유지하고, v3 기본 품질 목표는 T3 `PlaneGeometry(widthSegments ≥ 24)` + vertex displacement로 둔다. Three.js `PlaneGeometry`는 가로/세로 segment 수를 직접 지정할 수 있고, `ShaderMaterial` uniform으로 하나의 `uProgress`를 기하와 조명에 공유할 수 있다.

### 3.4 `FlipEngine` 추상화 (v3)

v2 `PageFlip` + `flip-presets` 를 **진행률 기반 엔진**으로 교체한다.

```ts
interface IFlipEngine {
  /** 0 = rest, 1 = turn complete */
  progress: number
  direction: 'forward' | 'backward'
  mode: 'single' | 'spread'
  render(): void
}

interface IFlipRenderer {
  supportsProgressiveDrag: boolean
  setProgress(p: number): void
  setTextures(front: TextureSource, back: TextureSource): void
  resize(viewport: IFlipViewport): void
  dispose(): void
}
```

- **명령형 flip** (버튼/키보드): `requestAnimationFrame` 또는 spring으로 `0→1` 보간.
- **드래그형 flip**: pointer X/Y가 curl axis / radius에 매핑.
- `progress`는 leaf geometry, shadow, static mask, ARIA 상태의 **유일한 source of truth**로 사용한다.
- 시간 기반 자동 flip은 Web Animations의 timing model처럼 elapsed time을 progress로 변환하되, drag 중에는 pointer 기반 progress를 직접 사용한다.

### 3.5 Renderer 선택 게이트

| 조건 | 선택 |
| --- | --- |
| reduced motion 요청 | Fade/instant renderer |
| WebGL 2 생성 실패 또는 context loss | CSS segmented renderer |
| 기준 모바일에서 p95 frame time > 33.3ms | segment 수/그림자 품질 하향 후에도 실패하면 CSS fallback |
| 정상 환경 | WebGL curl renderer |

WebGL renderer는 route-level lazy import하며, 실패는 사용자 오류로 노출하지 않고 자연스럽게 fallback한다.

---

## 4. 기둥 B — 책장 중앙 그림자 개선

### 4.1 목표 체감

- gutter가 **항상 어두운 선**이 아니라, leaf lift에 따라 **깊이·너비·불투명도**가 변함.
- flip 시작/종료/leaf mount 시 **1프레임도 튀지 않음**.
- forward/backward, cover leaf, spread leaf **모든 케이스에서 동일 progress 함수** 사용.

### 4.2 제안: Progress-driven multi-layer gutter

v2 단일 `page-flip-spine` span을 다음 레이어로 분해한다.

| 레이어 | 역할 | progress 함수 예시 |
| --- | --- | --- |
| **G0 — static crease** | 펼친 책의 기본 gutter AO | `base = 0.25` (상수) |
| **G1 — dynamic wedge** | 넘기는 leaf가 가리는 영역의 가변 그라데이션 | `0.25 + 0.45 * sin(π * p)` |
| **G2 — cast shadow** | incoming page 위에 떨어지는 leaf 그림자 (shader 또는 blurred div) | `opacity ∝ (1 - p) * lift` |
| **G3 — specular ridge** | curl bend 하이라이트 (WebGL tier에서만) | normal · light |

**핵심 구현 규칙**

1. `--flip-progress` CSS variable (0–1)을 engine이 **매 프레임** 갱신 — `idle`/`active` 이분법 제거.
2. spine overlay width를 `w-px` 고정이 아닌 `calc(4px * var(--gutter-width))` 등으로 가변.
3. static mask 전환 시점에 G1을 **이전 spread 값으로 1프레임 hold** (v2 #78 패턴 재사용).
4. Playwright: 6× slow-mo에서 spine opacity 샘플링 — 프레임 간 delta &lt; ε.

### 4.3 그림자 함수와 렌더링 원칙

조명은 “중간에 가장 진해진다”는 단일 규칙만 쓰지 않고, 역할별 함수로 분리한다.

```text
creaseAO(p)     = AO_BASE + AO_RANGE * sin(PI * p)
castOpacity(p)  = CAST_MAX * sin(PI * p)^0.7
castWidth(p)    = mix(W_MIN, W_MAX, sin(PI * p))
ridgeLight(p)   = max(0, dot(normal(p), lightDirection)) * RIDGE_MAX
```

- G0 static crease는 leaf mount/unmount와 무관하게 항상 존재한다.
- G1/G2는 동일 `progress`를 읽으며, React state 변경 대신 CSS custom property 또는 shader uniform으로 갱신한다.
- shadow 방향은 forward/backward에서 대칭 반전하며, incoming page 위 cast shadow와 spine AO를 별도 레이어로 유지한다.
- blur/gradient width를 DOM layout 속성으로 매 프레임 변경하지 않는다. CSS fallback은 `transform: scaleX()`와 `opacity`, WebGL은 shader uniform을 사용한다.
- transparent layer 정렬 문제를 피하도록 WebGL의 draw order와 depth 정책을 명시하고, 불필요한 다중 투명 pass를 제한한다.

### 4.4 v2 대비 검증 시나리오

1. spread classic, 2→4 forward — gutter가 점진적으로 깊어졌다 얕아짐.
2. backward 4→2 — symmetric curve, 좌우 pivot 전환 시 shadow jump 없음.
3. coverMode=single, 0→1 — 왼쪽 blank + 오른쪽만 가변 shadow.
4. 연속 10회 flip — 누적 drift / flash 없음.

### 4.5 정량 판정 기준

| 측정 | 통과 기준 |
| --- | --- |
| Spine luminance sample | 인접 샘플 간 변화량이 설정한 easing curve 범위 내; mount/unmount 시 단발성 spike 없음 |
| Layout shift | flip 중 reader surface의 layout shift 0 |
| Long task | 단일 flip 중 50ms 이상 main-thread task 없음 |
| Handoff | `progress=1` 직전/직후의 표시 페이지 및 gutter crop이 동일한 콘텐츠 상태 유지 |

---

## 5. 기둥 C — 인터랙션 강화 백로그 (리서치 기반)

업계·오픈소스·셰이더 문서에서 반복되는 패턴을 **우선순위 백로그**로 정리한다.

### 5.1 P0 — v3 MVP에 포함 권장

| # | 항목 | 근거 / 참고 | 기대 효과 |
| --- | --- | --- | --- |
| P0-1 | **Progress-unified animation** — phase 이분법 제거, 단일 `progress` | #73 잔여 flicker 원인 | spine·leaf·static 동기화 |
| P0-2 | **Pointer drag flip** — free edge 아무 점에서 드래그 | mantine-book perpendicular-bisector fold | plan-1 “drag corner” 충족 |
| P0-3 | **CSS segmented curl (T1)** 또는 WebGL curl (T3) | freefrontend segmented strips; TurnGL | rigid leaf 탈피 |
| P0-4 | **Progress-driven gutter shadow** (§4.2) | fullPage cylinder shadow; WebVfx `seeThroughWithShadow` | 책장 깜빡임 해소 |
| P0-5 | **Renderer fallback chain** | mantine-book `rounded → flat`; PremiumFlipBook `auto` | 저사양·WebGL 실패 대응 |

### 5.2 P1 — v3.1 polish

| # | 항목 | 근거 / 참고 |
| --- | --- | --- |
| P1-1 | **Cast shadow on incoming page** — curl 아래 soft shadow | Page Curl Shader scenario “behind surface” |
| P1-2 | **Spring release** — drag 놓을 때 임계치 넘으면 완료, 아니면 되돌림 | iOS Books, mantine-book |
| P1-3 | **Scrubber riffle preview** — scrub 중 저해상도 curl 또는 fade stack | FlippingBook auto-flip |
| P1-4 | **Fore-edge thickness stack** — 페이지 수에 비례한 측면 gradient | FlippingBook “life-like thickness” |
| P1-5 | **Cover/back rigid board** — curl 없는 하드커버 | mantine-book `withCover` |
| P1-6 | **Mouse-look subtle tilt** — 포인터 위치에 책 전체 1–2° 기울임 | TurnGL `mouseLook` |

### 5.3 P2 — 차별화 / delight

| # | 항목 | 근거 / 참고 |
| --- | --- | --- |
| P2-1 | **Specular ridge** on curl (WebGL) | mantine-book `rounded` variant |
| P2-2 | **Page edge AA** — curl 경계 anti-alias blend | WebVfx `antiAlias()` |
| P2-3 | **Optional page-turn SFX** — mute 기본 | PremiumFlipBook sound |
| P2-4 | **Haptic tick** on completion (mobile `navigator.vibrate`) | 네이티브 리더 UX |
| P2-5 | **GPU texture cache** — 인접 spread 사전 업로드 | TurnGL CanvasTexture |
| P2-6 | **Auto-play spread** — 데모/쇼케이스 모드 | FlippingBook autoplay |

### 5.4 P3 — 연구 스파이크 (채택 보류)

| # | 항목 | 메모 |
| --- | --- | --- |
| P3-1 | Full-screen WebGL shader curl (dual texture) | 품질 최고, 유지보수 비용 큼 |
| P3-2 | Physics engine (cannon.js) 종이 시뮬레이션 | 오버킬 가능성 |
| P3-3 | PDF.js + TurnGL 통합 | plan-2 M2.4 EPUB/PDF와 연계 시 |

### 5.5 전문가 노하우를 반영한 추가 설계 원칙

1. **입력과 자동 애니메이션을 같은 progress 모델로 통합한다.** 드래그 중 `p`를 직접 조절하고, release 후 현재 위치·속도에서 0 또는 1로 이어서 보간한다. 별도 CSS transition을 새로 시작하면 release 순간 속도가 끊겨 보인다.
2. **완료 임계치는 거리만 보지 않는다.** `progress`, release velocity, 방향을 함께 평가해 짧고 빠른 flick도 자연스럽게 완료한다.
3. **pointer capture를 사용한다.** 사용자가 surface 밖으로 드래그해도 같은 pointer stream을 유지한다.
4. **스크롤과 page drag를 조정한다.** 모바일에서 reader surface 전체에 무조건 `touch-action: none`을 적용하지 말고, 실제 grab 영역과 제품 의도에 따라 `pan-y` 또는 제한된 capture 전략을 검증한다.
5. **복수 포인터는 취소한다.** pinch/두 손가락 입력이 시작되면 flip gesture를 취소하거나 viewport zoom 정책으로 넘긴다.
6. **곡률보다 타이밍이 먼저다.** 시작 구간의 lift, 중앙 통과 속도, 착지 감속이 어색하면 고해상도 mesh도 카드처럼 느껴진다. CSS Easing의 progress 함수와 spring 후보를 side-by-side로 비교한다.
7. **시작·종료 상태를 정확히 평면으로 수렴시킨다.** `p=0/1`에서 잔여 `translateZ`, normal 오차, shadow opacity가 남으면 handoff가 튄다.
8. **그림자와 페이지 콘텐츠의 해상도를 분리한다.** 페이지 texture는 선명도를 유지하고, shadow는 저해상도/blur pass 또는 analytic shader로 계산해 비용을 제한한다.
9. **GPU 자원을 수명주기에 맞춰 해제한다.** page texture, geometry, material을 book 변경/route unmount/context loss에서 dispose하고, renderer 통계를 개발 모드에서 관찰한다.
10. **시각 비교 기준을 고정한다.** 동일 책·동일 spread·동일 viewport에서 v2/v3를 나란히 녹화하고, “더 화려함”보다 curl silhouette, spine continuity, landing stability를 평가한다.

### 5.6 드래그 상태 머신

```text
idle
  -> armed        pointerdown on valid free-edge/grab zone
  -> dragging     movement threshold exceeded; pointer captured
  -> settling     pointerup; spring/easing continues to 0 or 1
  -> committed    page index changes exactly once
  -> idle

armed/dragging -> cancelled  pointercancel, second pointer, route change
cancelled      -> settling   return to progress 0
```

**불변 조건**

- 페이지 인덱스는 drag 중 바뀌지 않고 `committed`에서 한 번만 변경한다.
- `settling` 중 새 입력 정책은 “무시” 또는 “현재 animation 인계” 중 하나로 명시하며, MVP는 무시를 권장한다.
- keyboard/button flip도 `settling` 경로를 사용해 shadow와 handoff 로직을 공유한다.

---

## 6. 아키텍처 (v2 → v3 공존)

`plan-2` 패턴을 그대로 확장한다.

### 6.1 라우트

| Route | 버전 | 비고 |
| --- | --- | --- |
| `/v3` | v3 | Gallery |
| `/v3/book/:id` | v3 | Reader (new flip engine) |
| `/v3/*` | v3 | NotFound |

VersionHub 카드 추가: **v3 — “Paper curl preview”**.

### 6.2 소스 트리 (초안)

```
src/
  v3/
    components/
      reader/
        PageFlipEngine.tsx      # progress orchestrator
        renderers/
          css-segmented.ts
          webgl-curl.ts         # Three.js or raw WebGL
        gutter/
          SpineLighting.tsx     # G0–G2 layers
        flip-presets.ts         # v3 preset registry
    pages/
      Reader.tsx
    data/
      books.ts                  # v2 fork 후 확장
```

### 6.3 import 규칙

| 규칙 | 이유 |
| --- | --- |
| `v3/` 는 `@v1/`, `@v2/` import 금지 | 버전 격리 |
| `v3/` 는 `@shared/` 만 허용 | 공통 유틸 |
| v2 hotfix는 `maint/v2` 에서 독립 진행 | v3 병렬 개발 |

### 6.4 브랜치 전략

`plan-2`의 maint → main → release 흐름을 v3에도 적용한다.

```text
feat/v3-* -> maint/v3 -> main -> release -> GitHub Pages
```

- `maint/v3`는 `main`의 v3 scaffold 시점에서 생성한다.
- v3 기능 PR은 기본적으로 `maint/v3`를 대상으로 하고, 마일스톤 단위로 `main`에 통합한다.
- `main`은 `/v1`, `/v2`, `/v3` 전체가 빌드·테스트 가능한 상태만 허용한다.
- Pages 배포는 기존과 동일하게 `release` push로만 수행한다.

### 6.5 의존성 후보

| 패키지 | 용도 | 채택 조건 |
| --- | --- | --- |
| `three` | WebGL curl mesh | T3 채택 시; lazy import |
| (없음) | CSS T1 only | 번들 ≤ 200 KB 유지 시 |

번들 예산: v3 Reader chunk **≤ 350 KB gz** (Three 포함 시); CSS-only path **≤ 220 KB**.

### 6.6 renderer 계약 초안

| 책임 | Engine | Renderer |
| --- | --- | --- |
| page index/방향/gesture 상태 | O | X |
| `progress` 계산 및 commit | O | X |
| geometry/texture/shader | X | O |
| gutter lighting 입력값 생성 | O | O (실제 draw) |
| reduced-motion/fallback 선택 | O | X |
| GPU 리소스 dispose | 호출 | 수행 |

---

## 7. 마일스톤 (M3.x)

| 마일스톤 | 내용 | 완료 기준 |
| --- | --- | --- |
| **M3.0 — Technical spike** | T1/T2/T3 prototype, 동일 입력·페이지로 품질/성능 비교 | renderer 결정 기록 + 기준 프레임/trace |
| **M3.1 — Shell** | VersionHub, `/v3` routes, `src/v3` scaffold, e2e smoke | `/v3/book/:id` stub render |
| **M3.2a — Segmented CSS curl** | T1 renderer, progress API, 버튼 flip | v2 대비 커브 체감 side-by-side GIF |
| **M3.2b — Gutter lighting v1** | `--flip-progress` 기반 G0–G2, flicker regression tests | 6× slow-mo 수동 + Playwright spine sampling |
| **M3.2c — WebGL curl** | T3 renderer, fallback to T1 | 저사양 자동 degrade |
| **M3.3 — Drag interaction** | pointer drag + spring release | e2e drag scenario |
| **M3.4 — Polish** | P1 백로그, a11y, reduced-motion | WCAG spot check |
| **M3.5 — Release** | `v3.0.0` tag, plan-3 갱신, demo media | `main → release` |

**권장 이슈 분할 (GitHub)**

1. `research(v3-reader): compare css, canvas, and webgl curl renderers` — M3.0
2. `feat(v3): scaffold routes and reader shell` — M3.1
3. `feat(v3-reader): progress-based flip engine` — M3.2a 선행
4. `feat(v3-reader): progress-driven spine lighting` — M3.2b
5. `feat(v3-reader): webgl curl renderer with fallback` — M3.2c
6. `feat(v3-reader): pointer drag page turn` — M3.3

---

## 8. 테스트 전략

| 계층 | v3 추가 시나리오 |
| --- | --- |
| **Vitest** | progress clamp/easing, gesture state machine, commit 1회, gutter 함수, mask hold, renderer fallback |
| **Playwright** | drag/flick/cancel, 20연속 flip, spine stability, WebGL off/context loss → CSS path |
| **시각 회귀** | `p=0/0.25/0.5/0.75/1` 고정 프레임의 leaf silhouette + spine crop snapshot |
| **성능** | Chromium Performance trace로 frame time, long task, layout shift, texture/renderer 통계 확인 |
| **수동** | DevTools 6× slowdown, forward/back/cover/last spread, mouse/touch/trackpad |

### 8.1 테스트 훅

프로덕션 동작을 왜곡하지 않는 범위에서 개발·테스트 모드에 아래 훅을 제공한다.

```ts
interface IFlipDebugSnapshot {
  progress: number
  state: 'idle' | 'armed' | 'dragging' | 'settling'
  renderer: 'webgl' | 'css' | 'reduced-motion'
  frameTimeMs: number
}
```

- `data-flip-progress`는 소수점 3자리로 노출해 E2E에서 단조 증가/감소를 검증한다.
- renderer 내부 progress를 강제로 고정할 수 있는 test-only API로 시각 회귀 프레임을 안정화한다.
- screenshot만으로 flicker를 판정하지 않고 중앙 gutter의 픽셀 luminance 시계열을 함께 검사한다.

---

## 9. 리스크와 트레이드오프

| 리스크 | 완화 |
| --- | --- |
| WebGL 기기 호환 | T1 fallback 필수; feature detect |
| 드래그 vs 스크롤 충돌 | grab 영역 + `touch-action: pan-y`/pointer capture 정책을 기기별 검증 |
| 번들 크기 | Three lazy + route-level code split |
| v2/v3 이중 유지보수 | v3 안정 후 v2 freeze 검토 (plan-2 §8 이후) |
| 투명 레이어/깊이 정렬 오류 | draw order/depth 정책 고정, pass 수 제한 |
| WebGL context loss | context loss 감지 후 CSS fallback, 복구는 후속 범위 |
| 고해상도 texture 메모리 | 인접 페이지만 GPU cache, route unmount 시 dispose |
| progress 매 프레임 React render | mutable engine/ref + CSS variable/uniform 사용 |

---

## 10. 미결정 사항 (Open Questions)

1. M3.0 측정 결과가 **WebGL 기본 + CSS fallback** 결정을 지지하는가?
2. Three.js를 사용할 것인가, 필요한 최소 WebGL renderer를 직접 구현할 것인가?
3. v2 `#78` mask 로직을 v3 engine에 **그대로 이식**할 것인가, progress 기반으로 재설계할 것인가?
4. drag flip 시 **왼쪽 페이지 backward**도 코너 grab을 지원할 것인가?
5. v3 안정화 시 VersionHub 기본 링크를 `/v3`로 전환할 시점은 언제인가?

---

## 11. 참고 자료

### 11.1 표준·공식 문서

| 자료 | v3 적용 시사점 |
| --- | --- |
| [W3C CSS Transforms Level 2](https://www.w3.org/TR/css-transforms-2/) | `perspective`, `transform-style`, `backface-visibility`, 3D stacking context의 표준 동작 |
| [W3C Web Animations](https://www.w3.org/TR/web-animations-1/) | 시간·easing·effect progress를 분리한 단일 timing model |
| [W3C CSS Easing Functions Level 2](https://www.w3.org/TR/css-easing-2/) | input progress → output progress의 순수 함수 모델; piecewise `linear()`/Bezier 비교 근거 |
| [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/) | pointer capture, pointer cancel, `touch-action`을 고려한 직접 조작 설계 |
| [W3C Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) | 비필수 motion을 제거·대체하는 reduced-motion 요구 |
| [Three.js PlaneGeometry](https://threejs.org/docs/pages/PlaneGeometry.html) | 가로/세로 segment를 가진 page mesh 생성 |
| [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) | `uProgress`, texture, light uniform을 공유하는 vertex/fragment shader 경로 |
| [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) | WebGL 2 전제, capability/context/resource 관찰 및 투명 정렬 유의점 |
| [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance) | frame time, long task, layout/paint/composite 병목 측정 |

### 11.2 학술 근거

| 자료 | v3 적용 시사점 |
| --- | --- |
| [Non-smooth developable geometry for interactively animating paper](https://inria.hal.science/hal-01202571/file/paper_v31.pdf) | 가상 종이를 interactive rate에서 time-coherent하게 변형하는 developable surface 접근 |
| [Interactive Curved Fold Modeling using a Handle Curve](https://www.cad-journal.net/files/vol_20/CAD_20%282%29_2023_275-289.pdf) | crease/handle curve와 quad-strip을 통한 직관적 curved-fold 제어 |
| [Flexible Developable Surfaces](https://www.cs.columbia.edu/cg/pdfs/1366386647-discrete_developables.pdf) | 늘어나지 않는 종이 표면의 이산 근사와 부드러운 변형 배경 |

### 11.3 구현 사례·탐색 자료

아래 자료는 아이디어 탐색과 prototype 비교에 사용하며, 제품 요구사항의 권위 있는 근거로 단독 채택하지 않는다.

| 자료 | 시사점 |
| --- | --- |
| [Page Curl Shader Breakdown (Andrew Hung)](https://andrewhungblog.wordpress.com/2018/04/29/page-curl-shader-breakdown/) | cylinder 모델, curl axis, shadow |
| [fullPage Book Flip / InvertedPageCurl](https://alvarotrigo.com/fullPage/page-flip-effect/) | dual texture, progress uniform |
| [TurnGL](https://github.com/oguzhanT/turngl) | segmented mesh, LEAD, drag |
| [mantine-book](https://github.com/gfazioli/mantine-book) | flat vs rounded, drag any edge, withCover |
| [WebVfx pagecurl shader](https://mltframework.org/doxygen/webvfx/examples_2transition-shader-pagecurl_8html-example.html) | behind-surface shadow, AA |
| v2 issues [#73](issues/73.md), [#78](issues/78.md) | spine pop·static mask 교훈 |

---

## 12. Definition of Done — v3 1.0 (초안)

- [ ] `/v3/book/:id`에서 T3 커브 renderer와 T1 fallback 동작
- [ ] spread gutter shadow가 progress 기반으로 연속 변화 (깜빡임 회귀 없음)
- [ ] pointer drag flip 동작
- [ ] `prefers-reduced-motion` fallback
- [ ] WebGL 실패/context loss 시 CSS fallback
- [ ] 기준 환경 frame-time 예산 및 20회 연속 flip 안정성 통과
- [ ] `p=0/0.25/0.5/0.75/1` 시각 회귀 기준 이미지 승인
- [ ] v1/v2 미변경; Vitest + Playwright v3 green; `pnpm lint` clean
- [ ] `docs/issues/{id}.md` + PR squash merge

---

*문서 버전: 2026-06-12 · 작성: Cursor Agent · Status: revised draft · 다음 단계: M3.0 기술 스파이크로 CSS/Canvas/WebGL curl 품질·성능 비교 후 M3.1 scaffold 착수*
