# 🚀 START HERE - Design System Documentation

## ⚡ Quick Start

**Need to create a form/modal NOW?**
→ Use `DESIGN_CHEATSHEET.md` - Copy-paste ready templates!

**Need detailed understanding?**
→ Read `DESIGN_SYSTEM_GUIDE.md` - Complete analysis

**Looking for quick imports/patterns?**
→ Check `QUICK-REFERENCE.md`

---

## 📚 Documentation Map

```
📁 .cursor/
├── 📄 START_HERE.md (this file) ← You are here
├── 📄 DESIGN_SYSTEM_GUIDE.md   ← Full detailed guide
├── 📄 DESIGN_CHEATSHEET.md     ← Quick templates
├── 📄 QUICK-REFERENCE.md       ← Import patterns
└── 📄 README.md                ← Structure overview

📁 Root/
├── 📄 .cursorrules             ← Main AI rules
└── 📄 README.md                ← Project overview
```

---

## ⚠️ CRITICAL RULES

### Before creating ANY form/modal:

1. **SEARCH** for existing forms in codebase
2. **PROPOSE** options to user:
   - Reuse existing?
   - Create new based on template?
   - Modify existing?
3. **USE** existing patterns:
   - Grid: `grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3`
   - Wrapper: `sticker-card-v2 p-4`
   - Modal: `max-w-6xl w-[95vw] max-h-[90vh]`
   - Buttons: Red cancel, Green save
4. **REFERENCE** guides for details

---

## 🎨 Existing Forms

Analyze these before creating new ones:

1. **ClientFormModal** - Clients with Individual/Company toggle
2. **SupplierFormModal** - Suppliers
3. **PartnerFormModal** - Partners
4. **InstallerFormModal** - Installers with Individual/IP/Company toggle

**Location:** `src/components/*-form-modal.tsx`

---

## 🎯 Design Philosophy

**Minimalist** - Clean, modern interface
**Consistent** - Single design system
**Reusable** - Compose, don't duplicate
**Accessible** - Semantic colors and components

**Colors:** ONLY Green (#10b981) and Red (#ef4444)
**Cards:** White with soft shadows, 16px radius
**Spacing:** Tailwind scale (2, 3, 4, 6)
**Typography:** Geist Sans system fonts

---

## ✅ Checklist

Before coding:

- [ ] Checked existing forms
- [ ] Proposed options to user
- [ ] Using components from `/ui/`
- [ ] Following established patterns
- [ ] Semantic colors only
- [ ] Proper spacing/grid
- [ ] Validation + error display
- [ ] Translations via `useLanguage()`

---

## 🔗 Quick Links

- [Main Guide](DESIGN_SYSTEM_GUIDE.md) - Complete documentation
- [Cheatsheet](DESIGN_CHEATSHEET.md) - Ready templates
- [Quick Ref](QUICK-REFERENCE.md) - Fast lookup
- [Structure](README.md) - File organization

---

**Remember:** Always analyze first, propose second, code third! 🎯
