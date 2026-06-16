# Pre-cutover SEO QA — Doctor listing pages

Run after deploying to staging (devweb) and before www cutover.

## Staging (devweb.marham.pk)

- [ ] No `noindex` meta tag on listing pages
- [ ] `X-Robots-Tag: index, follow` (or absent) — not `noindex` from Cloudflare
- [ ] `robots.txt` allows `/` and links sitemap
- [ ] Sitemap returns URLs at devweb host
- [ ] OG + Twitter tags present on `/doctors/lahore/pediatrician`
- [ ] JSON-LD blocks present (Organization, BreadcrumbList, MedicalWebPage, FAQPage, ItemList, Physician)
- [ ] H1 count matches API `meta.total` (dev DB count is OK — e.g. 167)
- [ ] FAQ doctor lists match top ranked cards on page
- [ ] Breadcrumb: Marham › Doctors in Lahore › Pediatrician

## Production (www.marham.pk) — before DNS cutover

- [ ] `NEXT_PUBLIC_SITE_URL=https://www.marham.pk`
- [ ] `NEXT_PUBLIC_IS_STAGING` unset or `false`
- [ ] Canonical URL is `https://www.marham.pk/doctors/{city}/{speciality}`
- [ ] No `noindex` on listing pages
- [ ] `npm run build && npm run check:devweb-links` passes
- [ ] H1 count matches legacy www page for same city+speciality (prod DB)
- [ ] Title contains secondary keyword (e.g. "Child Specialist" for pediatrician)
- [ ] Zero `devweb.marham.pk` in page source link hrefs

## Doctor count parity

Compare legacy www H1 vs new app `meta.total` on **production database**:

```sql
-- Example: verify on_panel filter matches legacy (adjust as needed)
SELECT COUNT(DISTINCT doctor.dlID) FROM doctors doctor
INNER JOIN doclisting listing_filter ON listing_filter.dlID = doctor.dlID
WHERE doctor.hidden_at IS NULL AND doctor.active_at IS NOT NULL
  AND listing_filter.hospitalCity = 'Lahore'
  AND doctor.on_panel = 1;
```

If counts differ, review `isOnPanelOnly` in `lib/services/doctors.ts` — do not hardcode totals.
