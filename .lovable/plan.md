

## Firecrawl + Hunter.io Enrichment with Bulk Email Button

### Overview

This plan adds three capabilities to the Prospects page:

1. **Firecrawl website scraping** -- a new per-prospect button that scrapes the prospect's website to find owner name, owner email, owner phone, and business email from About/Contact/Team pages
2. **Keep existing Hunter.io** -- the current Zap button stays as-is for quick email lookup
3. **Bulk Email Enrichment** -- a new button in the ProspectHeader that runs Hunter.io email lookup on all prospects missing emails at once

---

### Step 1: Connect Firecrawl

Firecrawl is available as a connector. We will link it to the project so the `FIRECRAWL_API_KEY` secret becomes available to edge functions.

### Step 2: Create new edge function `enrich-prospect-firecrawl`

**File: `supabase/functions/enrich-prospect-firecrawl/index.ts`**

This edge function will:
- Accept a `url` (the prospect's website)
- Use Firecrawl to scrape the website with `formats: ['markdown']` and `onlyMainContent: true`
- Also attempt to scrape common contact pages (`/about`, `/contact`, `/team`) by using Firecrawl's map feature to find those URLs first
- Parse the markdown content to extract:
  - Email addresses (regex)
  - Phone numbers (regex)
  - Owner/founder names (look for patterns like "Founded by", "Owner:", "CEO:", etc.)
- Return the extracted contact info

### Step 3: Create `useFirecrawlEnrichment` hook

**File: `src/hooks/useFirecrawlEnrichment.ts`**

- Accepts a prospect ID and website URL
- Calls the `enrich-prospect-firecrawl` edge function
- Updates the prospect record in Supabase with any found data (email, owner_name, owner_phone, owner_email)
- Tracks loading state per prospect ID

### Step 4: Update ProspectEmailCell with dual enrichment buttons

**File: `src/components/prospects/table/ProspectEmailCell.tsx`**

- Keep the existing Hunter.io Zap button
- Add a second button (Globe icon) for Firecrawl website scraping
- Firecrawl button only shows if the prospect has a website
- Both buttons shown when prospect has no email; Firecrawl also updates owner fields

### Step 5: Add Bulk Email Enrichment button

**File: `src/components/prospects/ProspectHeader.tsx`**

- Add a "Bulk Enrich Emails" button (with Zap icon) next to the existing Export button
- Shows count of prospects missing emails, e.g. "Enrich Emails (12)"
- On click, sequentially calls the existing `enrich-prospect-email` (Hunter.io) edge function for each prospect missing an email that has a website or business name
- Shows a progress toast as it processes
- Calls `onBulkUploadSuccess` (which triggers a refresh) when done

**File: `src/hooks/useBulkEmailEnrichment.ts`**

- New hook that manages bulk enrichment state
- Iterates through prospects missing emails
- Calls Hunter.io for each with a small delay to avoid rate limiting
- Tracks progress (processed count / total)
- Updates each prospect in the DB as emails are found

### Step 6: Update config.toml

Add JWT verification disabled for the new function:

```text
[functions.enrich-prospect-firecrawl]
verify_jwt = false
```

---

### Technical Details

**New files:**
- `supabase/functions/enrich-prospect-firecrawl/index.ts` -- Firecrawl scraping edge function
- `src/hooks/useFirecrawlEnrichment.ts` -- Hook for per-prospect Firecrawl enrichment
- `src/hooks/useBulkEmailEnrichment.ts` -- Hook for bulk Hunter.io enrichment

**Modified files:**
- `supabase/config.toml` -- Add function config
- `src/components/prospects/table/ProspectEmailCell.tsx` -- Add Firecrawl button alongside Hunter.io
- `src/components/prospects/ProspectHeader.tsx` -- Add "Bulk Enrich Emails" button
- `src/components/prospects/ProspectContent.tsx` -- Pass prospects to header (already done)

**Dependencies:** No new npm packages needed. Firecrawl is called via edge function.

**Connector:** Firecrawl connector will be linked to provide the `FIRECRAWL_API_KEY` environment variable to edge functions.

