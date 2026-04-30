# 차BTI 리맵 초안

기준일: 2026-04-30

## 1. Canonical 결과 8종

| canonical id | 표시명 | 기준 소스 |
|---|---|---|
| `green_tea_ujeon` | 녹차 (우전) | `tea_results.json`의 `green_tea_ujeon` |
| `white_tea_baihao_yinzhen` | 백차 (백호은침) | `white_tea_baihao_yinzhen` |
| `oolong_tea_dahongpao` | 청차 (대홍포) | `oolong_tea_dahongpao` |
| `oolong_tea_oriental_beauty` | 청차 (동방미인) | `oolong_tea_oriental_beauty` |
| `black_tea_darjeeling` | 홍차 (다즐링) | `black_tea_darjeeling` |
| `dark_tea_ripe_puer` | 흑차 (보이차 숙차) | `dark_tea_ripe_puer` |
| `herbal_tea_peppermint` | 페퍼민트 | `herbal_tea_peppermint` |
| `powdered_tea_matcha` | 말차 | `powdered_tea_matcha` |

## 2. 질문 텍스트 정규화 기준

질문 파일의 `related_teas`는 세 종류로 나눈다.

1. **정확한 차명/별칭**
   - 예: `우전`, `백호은침`, `동방미인`, `다즐링`, `대홍포`, `보이숙차`, `페퍼민트`, `말차`
   - 처리: 해당 canonical 결과에 **직접 차 보정 점수** 부여

2. **단일 결과로 수렴하는 넓은 분류명**
   - 예: `녹차`, `백차`, `홍차`, `허브차`, `보이차`
   - 처리: 해당 canonical 결과에 **약한 직접 보정** 또는 공통 그룹 점수 부여

3. **스타일/세부 계열 라벨**
   - 예: `우롱차`, `청향 우롱`, `농향 우롱`
   - 처리: 특정 결과 하나에 고정하지 않고 **공통 그룹 점수**로 처리

## 3. Alias 매핑표

| 입력 별칭/분류 | 매핑 방식 | 대상 |
|---|---|---|
| `우전` | exact | `green_tea_ujeon` |
| `녹차` | broad-single | `green_tea_ujeon` |
| `백호은침` | exact | `white_tea_baihao_yinzhen` |
| `백차` | broad-single | `white_tea_baihao_yinzhen` |
| `대홍포` | exact | `oolong_tea_dahongpao` |
| `농향 우롱` | style-group | `warmth`, `depth`, `craft` |
| `동방미인` | exact | `oolong_tea_oriental_beauty` |
| `팽풍차` | exact-alias | `oolong_tea_oriental_beauty` |
| `백호오룡` | exact-alias | `oolong_tea_oriental_beauty` |
| `오색차` | exact-alias | `oolong_tea_oriental_beauty` |
| `샴페인 우롱` | exact-alias | `oolong_tea_oriental_beauty` |
| `청향 우롱` | style-group | `clarity`, `brightness`, `adaptability` |
| `우롱차` | style-group | `adaptability`, `depth`, `craft` |
| `다즐링` | exact | `black_tea_darjeeling` |
| `홍차` | broad-single | `black_tea_darjeeling` |
| `보이숙차` | exact | `dark_tea_ripe_puer` |
| `보이차` | broad-single | `dark_tea_ripe_puer` |
| `페퍼민트` | exact | `herbal_tea_peppermint` |
| `허브차` | broad-single | `herbal_tea_peppermint` |
| `말차` | exact | `powdered_tea_matcha` |

## 4. 공통 그룹 체계

이번 버전에서는 질문이 성향 중심이라, 차 종류보다 **공통 정서/향미/공정 이미지**를 묶는 그룹이 중요하다.

| group id | 의미 |
|---|---|
| `clarity` | 맑음, 선명함, 빠른 판단 |
| `vitality` | 새싹 같은 생동감, 즉시성 |
| `naturalness` | 본연의 모습, 인위성 최소화 |
| `delicacy` | 섬세함, 여림, 슴슴함 |
| `brightness` | 화사함, 밝은 첫인상 |
| `elegance` | 세련됨, 우아함, 낭만 |
| `sweetness` | 꿀향, 부드러운 달콤함, 다정함 |
| `warmth` | 따뜻함, 몸을 감싸는 느낌 |
| `depth` | 묵직함, 깊이, 긴 여운 |
| `maturity` | 숙성, 내공, 성숙함 |
| `transformation` | 단련, 변화, 발효의 드라마 |
| `craft` | 장인정신, 손맛, 전통 공예성 |
| `focus` | 몰입, 집중, 밀도 |
| `directness` | 솔직함, 핵심, 주관 |
| `refreshment` | 시원함, 청량함, 리셋감 |
| `adaptability` | 유연함, 조율, 서서히 스며듦 |
| `landscape_mystique` | 압도적 자연, 이국적 풍경, 바위산/고산 |

## 5. 차별 그룹 배정

### `green_tea_ujeon`
- `clarity`
- `vitality`
- `naturalness`
- `delicacy`
- `craft`
- `focus`

### `white_tea_baihao_yinzhen`
- `naturalness`
- `delicacy`
- `sweetness`
- `elegance`
- `adaptability`
- `maturity`

### `oolong_tea_dahongpao`
- `depth`
- `maturity`
- `transformation`
- `craft`
- `warmth`
- `directness`
- `landscape_mystique`

### `oolong_tea_oriental_beauty`
- `brightness`
- `elegance`
- `sweetness`
- `transformation`
- `adaptability`

### `black_tea_darjeeling`
- `brightness`
- `elegance`
- `delicacy`
- `sweetness`
- `clarity`
- `landscape_mystique`

### `dark_tea_ripe_puer`
- `depth`
- `maturity`
- `warmth`
- `transformation`
- `adaptability`

### `herbal_tea_peppermint`
- `clarity`
- `refreshment`
- `directness`
- `naturalness`
- `delicacy`

### `powdered_tea_matcha`
- `focus`
- `craft`
- `directness`
- `transformation`
- `depth`
- `clarity`

## 6. 배점 원칙

- exact alias: `teas +2`
- broad-single category: `teas +1`
- style-group label: direct tea bonus 없이 `groups`만 부여
- 대부분의 선택지는 `groups 3~4개` + `teas 0~3개` 구조로 설계
- 특정 차가 너무 쉽게 확정되지 않도록, broad-single은 exact보다 약하게 준다.
- 우롱차 계열처럼 결과가 둘인 분기는 `style-group`으로 먼저 흔들고, exact alias가 있을 때만 직접 보정한다.
- `herbal_tea_peppermint`는 원천 데이터상 직접 호명 횟수가 적으므로, `Q09-A`, `Q11-A`에서 의도적으로 직접 보정을 강화한다.

## 7. 11문항 점수 초안

`Q07(선호하는 다구 스타일)`은 별도 문항으로 두지 않고, `Q11(도구에서 중요하게 생각하는 가치)`에 통합 반영한다.

표기 방식:
- `G:` 공통 그룹 점수
- `T:` 직접 차 보정 점수

### Q01 예상치 못한 문제에 부딪혔을 때

**A. 날카롭고 빠른 해결**
- `G: clarity +2, directness +1, focus +1`
- `T: green_tea_ujeon +1`

**B. 조율과 유연한 대처**
- `G: adaptability +2, depth +1, maturity +1`
- `T: dark_tea_ripe_puer +1`

### Q02 선호하는 성장의 이미지

**A. 새싹 같은 생동감**
- `G: vitality +2, brightness +1, naturalness +1`
- `T: green_tea_ujeon +2`

**B. 시간이 만든 깊이**
- `G: depth +2, maturity +2`
- `T: dark_tea_ripe_puer +1`

### Q03 가장 큰 매력

**A. 화사한 첫인상**
- `G: brightness +2, elegance +2`
- `T: oolong_tea_oriental_beauty +2, black_tea_darjeeling +2`

**B. 알수록 깊은 매력**
- `G: depth +2, maturity +1, warmth +1`
- `T: oolong_tea_dahongpao +2, dark_tea_ripe_puer +2`

### Q04 편안한 공간의 향기

**A. 꽃집의 싱그러움**
- `G: naturalness +1, brightness +1, clarity +1, delicacy +1`
- `T: green_tea_ujeon +2, white_tea_baihao_yinzhen +1`

**B. 카페와 벽난로의 구수함**
- `G: warmth +2, depth +1, craft +1`
- `T: oolong_tea_dahongpao +2, dark_tea_ripe_puer +2`

### Q05 인생 모토

**A. 본연의 모습**
- `G: naturalness +2, delicacy +1, adaptability +1`
- `T: white_tea_baihao_yinzhen +1, green_tea_ujeon +2`

**B. 단련으로 만든 가치**
- `G: transformation +2, craft +1, depth +1`
- `T: oolong_tea_oriental_beauty +2, oolong_tea_dahongpao +2, dark_tea_ripe_puer +1`

### Q06 친구와 대화할 때

**A. 부드러운 분위기 주도**
- `G: sweetness +2, elegance +1, adaptability +1`
- `T: oolong_tea_oriental_beauty +2, black_tea_darjeeling +2`

**B. 핵심과 주관**
- `G: directness +2, focus +1, depth +1`
- `T: oolong_tea_dahongpao +2, powdered_tea_matcha +2`

### Q08 내공의 원천

**A. 지식과 직관의 순발력**
- `G: vitality +1, clarity +1, focus +1`
- `T: green_tea_ujeon +2, white_tea_baihao_yinzhen +2`

**B. 경험과 시행착오의 깊이**
- `G: maturity +2, depth +1, transformation +1`
- `T: dark_tea_ripe_puer +2`

### Q09 새로운 환경에 처했을 때

**A. 빠르게 수용하고 정체성 고정**
- `G: clarity +1, focus +1, directness +1`
- `T: green_tea_ujeon +1, powdered_tea_matcha +2, herbal_tea_peppermint +2`

**B. 서서히 스며드는 변화**
- `G: adaptability +2, naturalness +1, sweetness +1`
- `T: white_tea_baihao_yinzhen +1, oolong_tea_oriental_beauty +2, oolong_tea_dahongpao +2, black_tea_darjeeling +3, dark_tea_ripe_puer +3`

### Q10 목표를 위해 강하게 밀어붙여야 한다면

**A. 페이스 유지와 스트레스 최소화**
- `G: naturalness +1, delicacy +1, adaptability +1, refreshment +1`
- `T: white_tea_baihao_yinzhen +1, green_tea_ujeon +2`

**B. 강한 단련으로 결과 만들기**
- `G: transformation +2, craft +1, focus +1, directness +1`
- `T: powdered_tea_matcha +2, oolong_tea_dahongpao +2, black_tea_darjeeling +1`

### Q11 도구에서 중요하게 생각하는 가치

`Q07(다구 스타일)`의 의도를 통합 반영한 문항으로 사용한다.

**A. 직관적이고 가벼운 스타일**
- `G: clarity +1, delicacy +1, refreshment +1, naturalness +1`
- `T: green_tea_ujeon +1, white_tea_baihao_yinzhen +1, herbal_tea_peppermint +2`

**B. 묵직하고 손때 묻는 스타일**
- `G: craft +2, warmth +1, depth +1, focus +1`
- `T: oolong_tea_dahongpao +2, dark_tea_ripe_puer +1, powdered_tea_matcha +2`

### Q12 가장 에너지를 얻는 풍경

**A. 가까운 산책로와 평온한 들판**
- `G: vitality +1, naturalness +1, delicacy +1`
- `T: green_tea_ujeon +2`

**B. 바위산과 고산지대**
- `G: landscape_mystique +2, depth +1, maturity +1`
- `T: oolong_tea_dahongpao +2, dark_tea_ripe_puer +1, black_tea_darjeeling +2`

## 8. 구현 시 체크 포인트

- `Q07`은 제거하고 `Q11`에 흡수한다. 구현 시 질문 수는 11개가 된다.
- `powdered_tea_matcha`는 `Q09-A`, `Q11-B`에서 후반 보정을 받도록 유지한다.
- `herbal_tea_peppermint`는 broad-single(`허브차`) 외에 `Q09-A`, `Q11-A`의 직접 보정이 핵심이다. 검증 시 도달성 확인이 특히 필요하다.
- `oolong_tea_dahongpao`와 `dark_tea_ripe_puer`는 동시에 강해질 가능성이 높으므로, 동점 시 priority와 bonus score 차이를 반드시 점검한다.
