"""웹앱에서 쓰는 데이터 파일(JSON)을 원자료에서 만들어 냅니다.

사용법
    python scripts/build_data.py path/to/owid-co2-data.csv

- owid-co2-data.csv : https://github.com/owid/co2-data (Our World in Data, CC BY 4.0)
- data/raw/hadcrut5_1850_2025_rebased.json : HadCRUT5 5.1.0.0 전 지구 연평균 기온 편차
  (1850–1900 평균 = 0 으로 기준 재계산한 값)

결과물은 worksheet/frontend/data/ 에 저장되며, 학생 화면의 그래프가 이 파일을 읽습니다.
"""
import json
import sys
from pathlib import Path

import pandas as pd
import pycountry
from babel import Locale

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "worksheet" / "frontend" / "data"
KO = Locale("ko")

# CLDR 이름이 초등학생에게 낯선 경우만 손봅니다.
NAME_FIX = {
    "KOR": "대한민국", "PRK": "북한", "GBR": "영국", "USA": "미국", "RUS": "러시아",
    "TWN": "대만", "HKG": "홍콩", "MAC": "마카오", "PSE": "팔레스타인",
    "BOL": "볼리비아", "VEN": "베네수엘라", "IRN": "이란", "SYR": "시리아",
    "LAO": "라오스", "VNM": "베트남", "TZA": "탄자니아", "COD": "콩고민주공화국",
    "COG": "콩고", "CIV": "코트디부아르", "CZE": "체코", "MDA": "몰도바",
    "MKD": "북마케도니아", "FSM": "미크로네시아", "KNA": "세인트키츠 네비스",
    "VCT": "세인트빈센트 그레나딘", "TTO": "트리니다드 토바고", "BIH": "보스니아 헤르체고비나",
}


def ko_name(iso3: str, fallback: str) -> str:
    if iso3 in NAME_FIX:
        return NAME_FIX[iso3]
    c = pycountry.countries.get(alpha_3=iso3)
    if c is not None and c.alpha_2 in KO.territories:
        return KO.territories[c.alpha_2]
    return fallback


def r(x, n=2):
    return None if pd.isna(x) else round(float(x), n)


def main(csv_path: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(csv_path)
    countries = df[df.iso_code.notna() & ~df.iso_code.str.startswith("OWID", na=False)]

    # 1) 세계 CO2 배출량 (연료별), 1850–최신
    w = df[(df.country == "World") & (df.year >= 1850)].sort_values("year")
    other = w[["cement_co2", "flaring_co2", "other_industry_co2"]].fillna(0).sum(axis=1)
    world = {
        "unit": "억 톤",
        "years": w.year.astype(int).tolist(),
        # 백만 톤 → 억 톤 (÷100): 초등학생이 읽기 쉬운 단위
        "total": [r(v / 100, 1) for v in w.co2],
        "coal": [r(v / 100, 1) for v in w.coal_co2.fillna(0)],
        "oil": [r(v / 100, 1) for v in w.oil_co2.fillna(0)],
        "gas": [r(v / 100, 1) for v in w.gas_co2.fillna(0)],
        "other": [r(v / 100, 1) for v in other],
    }
    (OUT / "world_co2.json").write_text(json.dumps(world, ensure_ascii=False))

    # 2) 나라별 1인당 CO2 (1800–최신)와 총배출량 (1950–최신)
    names, pop, per_capita, total = {}, {}, {}, {}
    latest = int(countries.year.max())
    for iso, g in countries.groupby("iso_code"):
        g = g.set_index("year").sort_index()
        names[iso] = ko_name(iso, g.country.iloc[0])
        p = g.population.get(latest)
        pop[iso] = None if p is None or pd.isna(p) else int(p)
        pc = g.co2_per_capita.reindex(range(1800, latest + 1))
        if pc.notna().any():
            per_capita[iso] = [r(v) for v in pc]
        tot = g.co2.reindex(range(1950, latest + 1))
        if tot.notna().any():
            total[iso] = [r(v, 1) for v in tot]

    (OUT / "countries.json").write_text(json.dumps(
        {"latest": latest, "names": names, "population": pop}, ensure_ascii=False))
    (OUT / "co2_per_capita.json").write_text(json.dumps(
        {"start": 1800, "unit": "톤/명", "series": per_capita}, ensure_ascii=False))
    (OUT / "co2_total.json").write_text(json.dumps(
        {"start": 1950, "unit": "백만 톤", "series": total}, ensure_ascii=False))

    # 3) 기온 편차 (HadCRUT5)
    temp = json.loads((ROOT / "data" / "raw" / "hadcrut5_1850_2025_rebased.json").read_text())
    (OUT / "temperature.json").write_text(json.dumps(
        {"years": [y for y, _ in temp], "anomaly": [round(v, 3) for _, v in temp]}))

    for f in sorted(OUT.glob("*.json")):
        print(f"{f.name:22s} {f.stat().st_size / 1024:7.1f} KB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "owid-co2-data.csv")
