# Exhaustive innerHTML Codebase Audit

Generated mechanically via `git grep -n "innerHTML"`.
Total verified lines: **217** across all non-minified application source files.

### Per-File Distribution Summary

| Source File | innerHTML Occurrences | Status |
| :--- | :---: | :---: |
| `assets/js/app.js` | 66 | Verified 100% |
| `assets/js/categories.js` | 5 | Verified 100% |
| `assets/js/expenses-p3a-v1.js` | 13 | Verified 100% |
| `assets/js/expenses.js` | 13 | Verified 100% |
| `assets/js/goals.js` | 8 | Verified 100% |
| `assets/js/income.js` | 6 | Verified 100% |
| `assets/js/landing-alive-b7-v1.js` | 1 | Verified 100% |
| `assets/js/landing-b3-v2.js` | 24 | Verified 100% |
| `assets/js/landing-demo-b8-v1.js` | 1 | Verified 100% |
| `assets/js/landing-mobile-b3-v1.js` | 18 | Verified 100% |
| `assets/js/landing-mobile.js` | 18 | Verified 100% |
| `assets/js/landing.js` | 20 | Verified 100% |
| `assets/js/loans.js` | 9 | Verified 100% |
| `assets/js/pwa-installer.js` | 7 | Verified 100% |
| `assets/js/vault.js` | 8 | Verified 100% |

---

### Full Audit Table

| # | `file:line` | Target Element | Interpolated / Dynamic Expressions | Origin of Values | Sanitization / Escaping | Static? |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| 1 | `assets/js/app.js:776` | `btn` | `${count > 0 ? `Offline (${count}` | Queue length and dead-letter length numeric counts | Numeric integer count | No |
| 2 | `assets/js/app.js:780` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 3 | `assets/js/app.js:784` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 4 | `assets/js/app.js:789` | `btn` | `${count > 0 ? `Syncing (${count}` | Queue length and dead-letter length numeric counts | Numeric integer count | No |
| 5 | `assets/js/app.js:793` | `btn` | `${deadLetter.length}`<br>`${deadLetter.length > 1 ? 's' : ''}` | Queue length and dead-letter length numeric counts | Numeric integer count | No |
| 6 | `assets/js/app.js:798` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 7 | `assets/js/app.js:802` | `netStatusEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 8 | `assets/js/app.js:806` | `cloudStatusEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 9 | `assets/js/app.js:2124` | `queueListEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 10 | `assets/js/app.js:2130` | `queueListEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 11 | `assets/js/app.js:2147` | `dlListEl` | `${idx}` | Dead-letter sync items (item name, note, person, amounts, technical error messages) | `escapeHtml(itemName)`, `escapeHtml(amountText)`, `escapeHtml(action)`, `escapeHtml(table)`, `escapeHtml(targetLabel)`, `escapeHtml(timeLabel)`, `escapeHtml(errText)` | No |
| 12 | `assets/js/app.js:2207` | `dlListEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 13 | `assets/js/app.js:2215` | `subtitle` | `${escapeHtml(firstName)}` | Profile greeting user first name (profiles table / session user metadata) | `escapeHtml(firstName)` | No |
| 14 | `assets/js/app.js:2336` | `authBadgeEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 15 | `assets/js/app.js:2512` | `authBadgeEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 16 | `assets/js/app.js:2697` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 17 | `assets/js/app.js:2707` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 18 | `assets/js/app.js:2723` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 19 | `assets/js/app.js:2731` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 20 | `assets/js/app.js:2739` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 21 | `assets/js/app.js:2749` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 22 | `assets/js/app.js:2758` | `feedback` | `${escapeHtml(newEmail)}` | User new email input from account modal | `escapeHtml(newEmail)` | No |
| 23 | `assets/js/app.js:2765` | `feedback` | `${escapeHtml(errMsg)}` | Server auth error message returned by Supabase Auth API | `escapeHtml(errMsg)` / `escapeHtml(msg)` | No |
| 24 | `assets/js/app.js:2773` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 25 | `assets/js/app.js:2781` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 26 | `assets/js/app.js:2787` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 27 | `assets/js/app.js:2803` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 28 | `assets/js/app.js:2809` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 29 | `assets/js/app.js:2817` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 30 | `assets/js/app.js:2829` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 31 | `assets/js/app.js:2838` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 32 | `assets/js/app.js:2847` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 33 | `assets/js/app.js:2856` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 34 | `assets/js/app.js:2864` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 35 | `assets/js/app.js:2878` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 36 | `assets/js/app.js:2883` | `feedback` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 37 | `assets/js/app.js:2890` | `feedback` | `${escapeHtml(msg)}` | Server auth error message returned by Supabase Auth API | `escapeHtml(errMsg)` / `escapeHtml(msg)` | No |
| 38 | `assets/js/app.js:2901` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 39 | `assets/js/app.js:2913` | `subtitleEl` | `${escapeHtml(oldCur)}`<br>`${escapeHtml(newCur)}` | Old currency and new currency codes from currency switch select | `escapeHtml(oldCur)`, `escapeHtml(newCur)` | No |
| 40 | `assets/js/app.js:2919` | `incomeEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 41 | `assets/js/app.js:3246` | `incomeEl` | `${incColor}` | Calculated savings rate and expense rate percentages & CSS color variables | Numeric integer / percentage (`savingsRateVal%`, `spendPctOfIncome%`) & CSS color variables | No |
| 42 | `assets/js/app.js:3552` | `incomeEl` | `${incColor}`<br>`${savingsRateVal}` | Calculated savings rate and expense rate percentages & CSS color variables | Numeric integer / percentage (`savingsRateVal%`, `spendPctOfIncome%`) & CSS color variables | No |
| 43 | `assets/js/app.js:3556` | `lifetimeEl` | `${qualifier}` | Sub-line qualifier text and formatted total earned / total spent lifetime figures | Predefined qualifier string literals & `escapeHtml(earnedFormatted)`, `escapeHtml(spentFormatted)` | No |
| 44 | `assets/js/app.js:3561` | `lifetimeEl` | `${qualifier}`<br>`${escapeHtml(earnedFormatted)}` | Sub-line qualifier text and formatted total earned / total spent lifetime figures | Predefined qualifier string literals & `escapeHtml(earnedFormatted)`, `escapeHtml(spentFormatted)` | No |
| 45 | `assets/js/app.js:3594` | `lifetimeEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 46 | `assets/js/app.js:3597` | `expensesEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 47 | `assets/js/app.js:3603` | `expensesEl` | `${expColorVar}` | Calculated savings rate and expense rate percentages & CSS color variables | Numeric integer / percentage (`savingsRateVal%`, `spendPctOfIncome%`) & CSS color variables | No |
| 48 | `assets/js/app.js:3640` | `expensesEl` | `${expColorVar}`<br>`${spendPctOfIncome}` | Calculated savings rate and expense rate percentages & CSS color variables | Numeric integer / percentage (`savingsRateVal%`, `spendPctOfIncome%`) & CSS color variables | No |
| 49 | `assets/js/app.js:3643` | `spendPctEl` | `${qualifier}` | Sub-line qualifier text and formatted total earned / total spent lifetime figures | Predefined qualifier string literals & `escapeHtml(earnedFormatted)`, `escapeHtml(spentFormatted)` | No |
| 50 | `assets/js/app.js:3648` | `spendPctEl` | `${qualifier}`<br>`${escapeHtml(spentFormatted)}` | Sub-line qualifier text and formatted total earned / total spent lifetime figures | Predefined qualifier string literals & `escapeHtml(earnedFormatted)`, `escapeHtml(spentFormatted)` | No |
| 51 | `assets/js/app.js:3675` | `spendPctEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 52 | `assets/js/app.js:3678` | `listEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 53 | `assets/js/app.js:3684` | `el` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 54 | `assets/js/app.js:5092` | `catFilter` | `${allOpts}` | Filter dropdown options (categories, distinct expense months, cycle reset days) | `escapeHtml(m)` for dates, `escapeHtml(c.name)` for categories, integer loop for cycle days | No |
| 55 | `assets/js/app.js:5168` | `moFilter` | `${escapeHtml(m)}`<br>`${escapeHtml(m)}` | Filter dropdown options (categories, distinct expense months, cycle reset days) | `escapeHtml(m)` for dates, `escapeHtml(c.name)` for categories, integer loop for cycle days | No |
| 56 | `assets/js/app.js:5202` | `cycleSelect` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 57 | `assets/js/app.js:5203` | `recurringDaySelect` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 58 | `assets/js/app.js:5373` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 59 | `assets/js/app.js:5470` | `platformContainer` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 60 | `assets/js/app.js:5494` | `platformContainer` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 61 | `assets/js/app.js:6303` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 62 | `assets/js/app.js:6305` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 63 | `assets/js/app.js:6988` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 64 | `assets/js/app.js:6993` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 65 | `assets/js/app.js:7010` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 66 | `assets/js/app.js:7015` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 67 | `assets/js/categories.js:361` | `el` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 68 | `assets/js/categories.js:375` | `catFilter` | `${allOpts}` | Built-in categories & user custom categories from state | `categoriesBridge.escapeHtml(c.name)` for values & labels, `categoriesBridge.escapeHtml(k)` | No |
| 69 | `assets/js/categories.js:394` | `container` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 70 | `assets/js/categories.js:398` | `container` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 71 | `assets/js/categories.js:644` | `select` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 72 | `assets/js/expenses-p3a-v1.js:470` | `editBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 73 | `assets/js/expenses-p3a-v1.js:476` | `delBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 74 | `assets/js/expenses-p3a-v1.js:545` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 75 | `assets/js/expenses-p3a-v1.js:552` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 76 | `assets/js/expenses-p3a-v1.js:565` | `icon` | `${expensesBridge.sanitizeIcon(cat.icon, 'fa-tag')}` | Expense item category icon | `expensesBridge.sanitizeIcon(cat.icon, 'fa-tag')` | No |
| 77 | `assets/js/expenses-p3a-v1.js:626` | `tbody` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 78 | `assets/js/expenses-p3a-v1.js:629` | `tbody` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 79 | `assets/js/expenses-p3a-v1.js:688` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 80 | `assets/js/expenses-p3a-v1.js:694` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 81 | `assets/js/expenses-p3a-v1.js:723` | `title` | `${safeCatIcon}`<br>`${safeCatColor}`<br>`${expensesBridge.escapeHtml(cat.label)}` | Budget item category label, icon, and color | `expensesBridge.escapeHtml(cat.label)`, `sanitizeIcon()`, `sanitizeColor()` | No |
| 82 | `assets/js/expenses-p3a-v1.js:730` | `amounts` | `${expensesBridge.formatCurrency(spent)}`<br>`${expensesBridge.formatCurrency(limit)}` | Budget amounts (spent, limit, remaining) & percentages | Numeric integer / percentage & `formatCurrency()` | No |
| 83 | `assets/js/expenses-p3a-v1.js:737` | `delBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 84 | `assets/js/expenses-p3a-v1.js:761` | `footer` | `${pct}`<br>`${expensesBridge.formatCurrency(Math.max(0, limit - spent))}` | Budget amounts (spent, limit, remaining) & percentages | Numeric integer / percentage & `formatCurrency()` | No |
| 85 | `assets/js/expenses.js:470` | `editBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 86 | `assets/js/expenses.js:476` | `delBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 87 | `assets/js/expenses.js:545` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 88 | `assets/js/expenses.js:552` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 89 | `assets/js/expenses.js:565` | `icon` | `${expensesBridge.sanitizeIcon(cat.icon, 'fa-tag')}` | Expense item category icon | `expensesBridge.sanitizeIcon(cat.icon, 'fa-tag')` | No |
| 90 | `assets/js/expenses.js:624` | `tbody` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 91 | `assets/js/expenses.js:627` | `tbody` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 92 | `assets/js/expenses.js:676` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 93 | `assets/js/expenses.js:682` | `list` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 94 | `assets/js/expenses.js:711` | `title` | `${safeCatIcon}`<br>`${safeCatColor}`<br>`${expensesBridge.escapeHtml(cat.label)}` | Budget item category label, icon, and color | `expensesBridge.escapeHtml(cat.label)`, `sanitizeIcon()`, `sanitizeColor()` | No |
| 95 | `assets/js/expenses.js:718` | `amounts` | `${expensesBridge.formatCurrency(spent)}`<br>`${expensesBridge.formatCurrency(limit)}` | Budget amounts (spent, limit, remaining) & percentages | Numeric integer / percentage & `formatCurrency()` | No |
| 96 | `assets/js/expenses.js:725` | `delBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 97 | `assets/js/expenses.js:749` | `footer` | `${pct}`<br>`${expensesBridge.formatCurrency(Math.max(0, limit - spent))}` | Budget amounts (spent, limit, remaining) & percentages | Numeric integer / percentage & `formatCurrency()` | No |
| 98 | `assets/js/goals.js:207` | `grid` | `${state.goals.length === 0 ? 'No savings goals yet' : 'No goals match this filter'}`<br>`${goalsBridge.escapeHtml(emptyDesc)}` | Goals filter state & empty description string | `goalsBridge.escapeHtml(emptyDesc)` | No |
| 99 | `assets/js/goals.js:223` | `grid` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 100 | `assets/js/goals.js:685` | `titleEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 101 | `assets/js/goals.js:709` | `titleEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 102 | `assets/js/goals.js:792` | `historyList` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 103 | `assets/js/goals.js:794` | `historyList` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 104 | `assets/js/goals.js:843` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 105 | `assets/js/goals.js:850` | `submitBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 106 | `assets/js/income.js:555` | `listEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 107 | `assets/js/income.js:637` | `listEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 108 | `assets/js/income.js:675` | `previewBox` | `${isStealth ? 'stealth-masked' : ''}`<br>`${incomeBridge.formatCurrency(resultingTotal)}` | Income adjustment / balance preview amounts & colors | Numeric `formatCurrency()`, constant CSS variables, `sign` literal | No |
| 109 | `assets/js/income.js:687` | `previewBox` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 110 | `assets/js/income.js:693` | `previewBox` | `${isStealth ? 'stealth-masked' : ''}`<br>`${deltaColor}`<br>`${sign}`<br>`${deltaFormatted}` | Income adjustment / balance preview amounts & colors | Numeric `formatCurrency()`, constant CSS variables, `sign` literal | No |
| 111 | `assets/js/income.js:742` | `previewBox` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 112 | `assets/js/landing-alive-b7-v1.js:97` | `railContainer` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 113 | `assets/js/landing-b3-v2.js:838` | `snaps` | `${el.innerHTML}` | Initial DOM element innerHTML snapshot | Inherently safe DOM snapshot read | Yes |
| 114 | `assets/js/landing-b3-v2.js:866` | `el` | `${v.h}` | Initial DOM element innerHTML snapshot restore | Inherently safe DOM snapshot restore | Yes |
| 115 | `assets/js/landing-b3-v2.js:897` | `row` | `${html}` | Prepend row helper with static string literals | Static string literal from caller | Yes |
| 116 | `assets/js/landing-b3-v2.js:930` | `badge` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 117 | `assets/js/landing-b3-v2.js:1345` | `row` | `${item.badge}`<br>`${item.cat}`<br>`${item.desc}`<br>`${amtClass}`<br>`${amtFormatted}` | Live demo feed transaction item | Hardcoded constant demo item pool | No |
| 118 | `assets/js/landing-b3-v2.js:1558` | `s1Tag` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 119 | `assets/js/landing-b3-v2.js:1587` | `s1Tag` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 120 | `assets/js/landing-b3-v2.js:1610` | `newRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 121 | `assets/js/landing-b3-v2.js:1700` | `dRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 122 | `assets/js/landing-b3-v2.js:1747` | `s4Settle` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 123 | `assets/js/landing-b3-v2.js:1748` | `s4Inc` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 124 | `assets/js/landing-b3-v2.js:1777` | `hRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 125 | `assets/js/landing-b3-v2.js:1803` | `s4Settle` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 126 | `assets/js/landing-b3-v2.js:1806` | `s4Inc` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 127 | `assets/js/landing-b3-v2.js:1971` | `recentList` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 128 | `assets/js/landing-b3-v2.js:1975` | `row` | `${r.note}`<br>`${r.amt}` | Category breakdown demo transaction rows | Hardcoded mock category data | No |
| 129 | `assets/js/landing-b3-v2.js:2066` | `row` | `${dotHtml}`<br>`${cat}`<br>`${sData.pct}` | Reports donut legend item | Hardcoded data-cat attribute and numeric percentage | No |
| 130 | `assets/js/landing-b3-v2.js:2177` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 131 | `assets/js/landing-b3-v2.js:2179` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 132 | `assets/js/landing-b3-v2.js:2181` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 133 | `assets/js/landing-b3-v2.js:2295` | `row` | `${dateStr}`<br>`${escapeHtml(note)}`<br>`${escapeHtml(cat)}`<br>`${amt.toLocaleString()}`<br>`${iconClass}` | Pull-the-plug interactive demo transaction | `escapeHtml(note)`, `escapeHtml(cat)`, numeric format | No |
| 134 | `assets/js/landing-b3-v2.js:2631` | `pillText` | `${ver}` | Release version text | Hardcoded application version constant | No |
| 135 | `assets/js/landing-b3-v2.js:2762` | `h2` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 136 | `assets/js/landing-b3-v2.js:2783` | `span` | `${node.innerHTML}` | Heading word streamer element child clone | Static heading DOM markup from static HTML | Yes |
| 137 | `assets/js/landing-demo-b8-v1.js:56` | `root` | `${slices}`<br>`${legend}`<br>`${grid}`<br>`${bars}` | Reports walkthrough interactive SVG visualization | Hardcoded constant chapters, categories, and trends arrays | No |
| 138 | `assets/js/landing-mobile-b3-v1.js:291` | `syncPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 139 | `assets/js/landing-mobile-b3-v1.js:294` | `syncPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 140 | `assets/js/landing-mobile-b3-v1.js:306` | `row` | `${item.badgeClass}`<br>`${item.cat}`<br>`${item.name}`<br>`${amtFormatted}`<br>`${amtClass}` | Live mobile feed transaction item | Hardcoded constant demo item pool | No |
| 141 | `assets/js/landing-mobile-b3-v1.js:410` | `hint` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 142 | `assets/js/landing-mobile-b3-v1.js:612` | `row` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 143 | `assets/js/landing-mobile-b3-v1.js:650` | `row` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 144 | `assets/js/landing-mobile-b3-v1.js:676` | `depRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 145 | `assets/js/landing-mobile-b3-v1.js:1061` | `vaultOverlay` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 146 | `assets/js/landing-mobile-b3-v1.js:1064` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 147 | `assets/js/landing-mobile-b3-v1.js:1076` | `vaultOverlay` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 148 | `assets/js/landing-mobile-b3-v1.js:1079` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 149 | `assets/js/landing-mobile-b3-v1.js:1087` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 150 | `assets/js/landing-mobile-b3-v1.js:1202` | `catExpensesList` | `${item.name}`<br>`${item.amt}` | Mobile category drawer expense rows | Hardcoded mock expense data | No |
| 151 | `assets/js/landing-mobile-b3-v1.js:1351` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 152 | `assets/js/landing-mobile-b3-v1.js:1356` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 153 | `assets/js/landing-mobile-b3-v1.js:1360` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 154 | `assets/js/landing-mobile-b3-v1.js:1407` | `row` | `${escapeHtml(cat)}`<br>`${escapeHtml(note)}`<br>`${amt.toLocaleString()}`<br>`${statusIcon}` | Mobile pull-the-plug interactive demo | `escapeHtml(cat)`, `escapeHtml(note)`, numeric format | No |
| 155 | `assets/js/landing-mobile-b3-v1.js:1449` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 156 | `assets/js/landing-mobile.js:290` | `syncPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 157 | `assets/js/landing-mobile.js:293` | `syncPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 158 | `assets/js/landing-mobile.js:305` | `row` | `${item.badgeClass}`<br>`${item.cat}`<br>`${item.name}`<br>`${amtFormatted}`<br>`${amtClass}` | Live mobile feed transaction item | Hardcoded constant demo item pool | No |
| 159 | `assets/js/landing-mobile.js:409` | `hint` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 160 | `assets/js/landing-mobile.js:611` | `row` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 161 | `assets/js/landing-mobile.js:649` | `row` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 162 | `assets/js/landing-mobile.js:675` | `depRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 163 | `assets/js/landing-mobile.js:1058` | `vaultOverlay` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 164 | `assets/js/landing-mobile.js:1061` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 165 | `assets/js/landing-mobile.js:1073` | `vaultOverlay` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 166 | `assets/js/landing-mobile.js:1076` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 167 | `assets/js/landing-mobile.js:1084` | `vaultRing` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 168 | `assets/js/landing-mobile.js:1199` | `catExpensesList` | `${item.name}`<br>`${item.amt}` | Mobile category drawer expense rows | Hardcoded mock expense data | No |
| 169 | `assets/js/landing-mobile.js:1348` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 170 | `assets/js/landing-mobile.js:1353` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 171 | `assets/js/landing-mobile.js:1357` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 172 | `assets/js/landing-mobile.js:1404` | `row` | `${escapeHtml(cat)}`<br>`${escapeHtml(note)}`<br>`${amt.toLocaleString()}`<br>`${statusIcon}` | Mobile pull-the-plug interactive demo | `escapeHtml(cat)`, `escapeHtml(note)`, numeric format | No |
| 173 | `assets/js/landing-mobile.js:1446` | `plugPill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 174 | `assets/js/landing.js:1158` | `row` | `${item.badge}`<br>`${item.cat}`<br>`${item.desc}`<br>`${amtClass}`<br>`${amtFormatted}` | Live demo feed transaction item | Hardcoded constant demo item pool | No |
| 175 | `assets/js/landing.js:1371` | `s1Tag` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 176 | `assets/js/landing.js:1400` | `s1Tag` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 177 | `assets/js/landing.js:1423` | `newRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 178 | `assets/js/landing.js:1513` | `dRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 179 | `assets/js/landing.js:1560` | `s4Settle` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 180 | `assets/js/landing.js:1561` | `s4Inc` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 181 | `assets/js/landing.js:1590` | `hRow` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 182 | `assets/js/landing.js:1616` | `s4Settle` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 183 | `assets/js/landing.js:1619` | `s4Inc` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 184 | `assets/js/landing.js:1784` | `recentList` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 185 | `assets/js/landing.js:1788` | `row` | `${r.note}`<br>`${r.amt}` | Category breakdown demo transaction rows | Hardcoded mock category data | No |
| 186 | `assets/js/landing.js:1879` | `row` | `${dotHtml}`<br>`${cat}`<br>`${sData.pct}` | Reports donut legend item | Hardcoded data-cat attribute and numeric percentage | No |
| 187 | `assets/js/landing.js:1990` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 188 | `assets/js/landing.js:1992` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 189 | `assets/js/landing.js:1994` | `hintEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 190 | `assets/js/landing.js:2120` | `row` | `${dateStr}`<br>`${escapeHtml(note)}`<br>`${escapeHtml(cat)}`<br>`${amt.toLocaleString()}`<br>`${iconClass}` | Pull-the-plug interactive demo transaction | `escapeHtml(note)`, `escapeHtml(cat)`, numeric format | No |
| 191 | `assets/js/landing.js:2509` | `pillText` | `${ver}` | Release version text | Hardcoded application version constant | No |
| 192 | `assets/js/landing.js:2640` | `h2` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 193 | `assets/js/landing.js:2661` | `span` | `${node.innerHTML}` | Heading word streamer element child clone | Static heading DOM markup from static HTML | Yes |
| 194 | `assets/js/loans.js:112` | `datalist` | `${escapeHtml(n)}` | Unique person names from loans state | `escapeHtml(n)` | No |
| 195 | `assets/js/loans.js:370` | `container` | `${state.loans.length === 0 ? 'No loans or debts yet' : 'No records found'}`<br>`${escapeHtml(emptyDesc)}` | Loans state count & activeLoansFilter text | Ternary string & `escapeHtml(emptyDesc)` | No |
| 196 | `assets/js/loans.js:385` | `container` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 197 | `assets/js/loans.js:419` | `titleEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 198 | `assets/js/loans.js:439` | `titleEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 199 | `assets/js/loans.js:1066` | `titleEl` | `${escapeHtml(loan.person_name)}` | Selected loan record person_name | `escapeHtml(loan.person_name)` | No |
| 200 | `assets/js/loans.js:1073` | `subtitleEl` | `${dirText}`<br>`${stealth ? 'stealth-masked' : ''}`<br>`${escapeHtml(pStr)}`<br>`${stealth ? 'stealth-masked' : ''}`<br>`${escapeHtml(oStr)}` | Loan direction text & principal / outstanding strings | Direction literal & `escapeHtml(pStr)`, `escapeHtml(oStr)` via `formatCurrency()` | No |
| 201 | `assets/js/loans.js:1082` | `listEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 202 | `assets/js/loans.js:1084` | `listEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 203 | `assets/js/pwa-installer.js:40` | `pill` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 204 | `assets/js/pwa-installer.js:397` | `modal` | `${guideContent}` | Static button markup | Static markup (inherently safe) | No |
| 205 | `assets/js/pwa-installer.js:470` | `element` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 206 | `assets/js/pwa-installer.js:472` | `clickedBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 207 | `assets/js/pwa-installer.js:492` | `clickedBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 208 | `assets/js/pwa-installer.js:557` | `offlineIndicator` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 209 | `assets/js/pwa-installer.js:561` | `offlineIndicator` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 210 | `assets/js/vault.js:356` | `badge` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 211 | `assets/js/vault.js:361` | `badge` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 212 | `assets/js/vault.js:393` | `stealthBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 213 | `assets/js/vault.js:397` | `stealthBtn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 214 | `assets/js/vault.js:610` | `title` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 215 | `assets/js/vault.js:760` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 216 | `assets/js/vault.js:764` | `btn` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
| 217 | `assets/js/vault.js:962` | `noteEl` | (None - static string) | Hardcoded markup string | Static markup (inherently safe) | Yes |
