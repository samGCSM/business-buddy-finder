

## Fix: Enrich Emails Count Not Reflecting Selection or "N/A" Emails

### Root Cause

Prospects in the database have `email: "N/A"` instead of `null` or empty string. The enrichable filter uses `!p.email` which only catches falsy values (`null`, `""`, `undefined`). The string `"N/A"` is truthy, so those prospects are excluded from the enrichable count -- giving a small "random" number that doesn't change with selection because the same few null-email prospects are counted either way.

### Fix

Update the enrichable filter in two places to treat `"N/A"` (case-insensitive) as "no email":

**File 1: `src/components/prospects/ProspectHeader.tsx` (line 70)**

Change:
```
const enrichableCount = actionProspects.filter(p => !p.email && (p.website || p.business_name)).length;
```
To:
```
const enrichableCount = actionProspects.filter(p => (!p.email || p.email.toLowerCase() === 'n/a') && (p.website && p.website.toLowerCase() !== 'n/a' || p.business_name)).length;
```

**File 2: `src/hooks/useBulkEmailEnrichment.ts` (line 24)**

Change:
```
const enrichable = prospects.filter((p) => !p.email && (p.website || p.business_name));
```
To:
```
const enrichable = prospects.filter((p) => (!p.email || p.email.toLowerCase() === 'n/a') && (p.website && p.website.toLowerCase() !== 'n/a' || p.business_name));
```

This ensures:
- Prospects with `"N/A"` email are treated as needing enrichment
- Prospects with `"N/A"` website are not sent to Hunter.io (only business_name would be used)
- The count updates correctly when selecting/deselecting prospects
