# Best Practices for Naming i18n Keys

---

# Summary

1. **Use stable, descriptive, semantic IDs** (don’t tie keys to copy or layout). Organize by feature/domain and sub-group by function; avoid vague names.
2. **Namespace and nest** (2–3 levels is usually enough) so teams can find strings quickly and avoid collisions.
3. **Be consistent in casing and separators** (e.g., dot-separated segments, snake_case tokens; avoid spaces/special chars).
4. **Handle plurals, genders, and variables with message syntax** (ICU or equivalent), not with ad-hoc key explosions.

---

# The naming standard

## Contributor workflow

Before adding or editing copy:

1. **Pick the namespace.** Reuse an existing domain directory under `src/i18n/` whenever possible; propose a backlog story if a new domain is required.
2. **Add both locales.** Update the matching English and French JSON files in that namespace.
3. **Name the key.** Follow the `feature.section.purpose_optional` pattern with dot-separated, snake_case segments (≤3 levels deep).
4. **Author the message.** Use ICU for variables, plurals, and gendered copy so a single key captures the full context.

## 1) File & namespace layout

- **Namespace by feature/domain** (align with app architecture, not pages).
- Depth: **2–3 levels max**.

Example:

```
/locales/
  en/
    common.json
    auth.json
    checkout.json
  fr/
    common.json
    auth.json
    checkout.json
```

## 2) Key shape & casing

- **Format:** `namespace.section.purpose_optional`
- **Separators:** dot (`.`); **snake_case** within segments
- **Characters:** `[a-z0-9_.]` only

**Good**

- `auth.login.title`
- `checkout.payment_form.card_number.label`

**Avoid**

- `btn1`, `msg`
- `home.paragraph_1`
- `componentsLandingHomeH1`

## 3) Granularity

- Name the **purpose, not the widget** (`button_submit` > `blue_cta`).
- Don’t encode file paths unless meaningful.

## 4) Variables & interpolation

- Use ICU for variables. Don’t split fragments.

Example:

```
cart.items: "{count, plural, one {# item} other {# items}}"
cart.added: "{name} was added to your cart."
```

## 5) Plurals, gender, context

- Prefer ICU plural/select.
- If unavailable, suffixes like `.one/.other`.

## 6) Reuse vs. duplication

- Reuse only if **meaning identical**. Otherwise, distinct keys.

## 7) Error messages

- Organize predictably:  
  `errors.validation.email_required`  
  `errors.auth.invalid_credentials`

## 8) Consistency rules

- Always: dot-separated segments; snake_case tokens; English semantic words.
- Never: positional names, UI tokens, or copy-as-key.

## 9) Default messages

- Provide `defaultMessage` where supported.
- Semantic ID remains the stable reference.

## 10) Change management

- Keys are **stable IDs**. Copy edits ≠ key rename.
- If **meaning changes**, create new key, deprecate old one.

---

# Examples

**Auth**

- ✅ `auth.login.title`: “Sign in”
- ✅ `auth.login.button_submit`: “Sign in”
- ❌ `h1_signin`, `blueBigButton`

**Checkout**

- ✅ `checkout.summary.items`: “{count, plural, one {# item} other {# items}}”
- ❌ `checkout.items_one`, `checkout.items_more`

---

# Checklist (paste in repo)

- IDs: `feature.section.purpose_optional`
- Semantic, not layout-based
- Depth ≤3
- Characters: `[a-z0-9_.]`
- Variables: ICU (`{name}`, plural/select)
- Reuse only when identical
- Stable IDs: rename only if meaning changes
- Namespace files per feature
- DefaultMessage for dev readability

---

# Why this standard?

This approach balances **portability** (semantic IDs) and **developer ergonomics** (default messages). It follows the latest guidance on namespaces, shallow nesting, and domain alignment to reduce churn and improve clarity.
