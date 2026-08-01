#!/usr/bin/env python3
"""Merge parsed Season 4-5 pitches (from Wikipedia episode tables) into
data/pitches.json at schema v2. Inputs are produced by the ingestion parse
(s45_raw.json) and the description-drafting pass (desc_out_*.json) in the
session scratchpad. Every exclusion is explicit and logged - no silent drops.
"""
import json, re, sys, glob

SCRATCH = sys.argv[1] if len(sys.argv) > 1 else '.'
WIKI = {4: 'https://en.wikipedia.org/wiki/Shark_Tank_India_season_4',
        5: 'https://en.wikipedia.org/wiki/Shark_Tank_India_season_5'}

# Explicit editorial decisions (sourced during QA):
EXCLUDE = {
    '4|Off Mint': 'symbolic ask (Rs 10) - unscorable, same policy as Cocofit/Dharaksha',
}
PATCHES = {
    # Wikipedia cell holds a stray value; Sovrenn got no deal on air
    # (startuparticle.com/shark-tank-india/2026/01/did-ai-defeat-sovrenn-...)
    '5|Sovrenn': {'dealMade': False, 'dealAmount': None, 'dealEquity': None,
                  'debtAmountLakhs': None, 'sharks': [], 'royalty': False,
                  'advisory': False, 'conditional': False},
    # Split deal: Rs 1.5Cr/3% (Anupam) + Rs 1.5Cr/3% (others) = Rs 3Cr for 6%
    '5|Emori': {'dealAmount': 300.0, 'dealEquity': 6.0,
                'dealNote': 'Split deal: ₹1.5 Cr for 3% (one shark) + ₹1.5 Cr for 3% (others)'},
    # Multi-tranche with advisory equity: 1.25Cr/3.13% + 50L/1.25% cash, + advisory
    '4|Raheja Solar food processing': {
        'dealAmount': 175.0, 'dealEquity': 4.38,
        'dealNote': 'Two tranches; plus 2.63% advisory equity across sharks'},
    '4|BL Fabric': {'dealNote': 'Equity drops to 4% if revenue exceeds ₹15 Cr'},
}


def note_from_raw(raw, has_debt, royalty):
    parts = []
    if has_debt:
        m = re.search(r'@\s*([\d.]+)\s*%[^,+]*?(?:for\s*([\d.]+)\s*years?)?', raw)
        if m:
            n = f'Debt at {m.group(1)}% interest'
            if m.group(2):
                n += f' for {int(float(m.group(2)))} years'
            parts.append(n)
        else:
            parts.append('Includes a debt component')
    if royalty:
        m = re.search(r'([\d.]+)\s*%\s*royalty[^.]*?(?:till|until)\s*(₹?\s*[\d.,]+\s*\w+)[^.]*?recouped', raw, re.I)
        if m:
            parts.append(f'Plus {m.group(1)}% royalty until {m.group(2).strip()} is recouped')
        else:
            parts.append('Plus a royalty component')
    return '; '.join(parts) if parts else None


def main():
    raw = json.load(open(f'{SCRATCH}/s45_raw.json'))
    descs = {}
    for f in sorted(glob.glob(f'{SCRATCH}/desc_out_*.json')):
        for d in json.load(open(f)):
            descs[d['key']] = d
    pitches = json.load(open('data/pitches.json'))
    next_id = max(p['id'] for p in pitches) + 1
    added, excluded = [], []

    for r in raw:
        key = f"{r['season']}|{r['brand']}"
        if key in EXCLUDE:
            excluded.append((key, EXCLUDE[key]))
            continue
        patch = PATCHES.get(key, {})
        for k, v in patch.items():
            if k != 'dealNote':
                r[k] = v
        d = descs.get(key)
        if not d:
            excluded.append((key, 'NO DESCRIPTION DRAFTED - fix and rerun'))
            continue
        deal_made = r['dealMade']
        has_debt = bool(r.get('debtAmountLakhs'))
        note = patch.get('dealNote') or (note_from_raw(r['dealRaw'], has_debt, r.get('royalty')) if deal_made else None)
        exact = (deal_made and r['dealAmount'] == r['askAmount'] and r['dealEquity'] == r['askEquity'])
        rec = {
            'id': next_id,
            'season': r['season'],
            'episode': r['episode'],
            'industry': d['industry'],
            'city': 'India',
            'description': d['description'],
            'yearsInBusiness': None,
            'annualRevenue': 'Not disclosed',
            'profitMargin': 'N/A',
            'askAmount': r['askAmount'],
            'askEquity': r['askEquity'],
            'dealMade': deal_made,
            'dealAmount': r['dealAmount'] if deal_made else None,
            'dealEquity': r['dealEquity'] if deal_made else None,
            'investingSharks': r['sharks'] if deal_made else [],
            'companyName': r['brand'],
            'founderName': '',
            'productCategory': d['industry'],
            'salesChannel': None,
            'difficulty': 'hard' if not deal_made else ('easy' if exact else 'medium'),
            'dataSource': WIKI[r['season']],
            'verified': True,
        }
        if has_debt:
            rec['hasDebt'] = True
            rec['debtAmountLakhs'] = r['debtAmountLakhs']
        if note:
            rec['dealNote'] = note
        added.append(rec)
        next_id += 1

    # Reconciliation: parsed == added + excluded, and every exclusion has a reason
    assert len(raw) == len(added) + len(excluded), (len(raw), len(added), len(excluded))
    pitches.extend(added)
    json.dump(pitches, open('data/pitches.json', 'w'), ensure_ascii=False, indent=1)
    print(f'raw rows: {len(raw)} | added: {len(added)} | excluded: {len(excluded)}')
    for e in excluded:
        print('  EXCLUDED:', e[0], '->', e[1])
    print(f'dataset total: {len(pitches)}')


if __name__ == '__main__':
    main()
