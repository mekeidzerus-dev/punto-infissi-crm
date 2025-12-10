# 🤖 AI Instructions for MODOCRM

## How Cursor AI Should Use This Project

This document provides clear instructions for AI assistants working on this codebase.

---

## 📁 Project Structure

```
modocrm/
├── .cursorrules                    # ⭐ Primary AI instructions (START HERE)
├── README-AI.md                    # This file - project overview for AI
├── .cursor/                        # 📁 Cursor AI documentation folder
│   ├── README.md                   # Documentation structure
│   ├── DESIGN_SYSTEM.md           # Complete brand book & design guide
│   └── QUICK-REFERENCE.md         # Quick reference card
├── src/
│   ├── components/
│   │   └── ui/                    # ⭐ Design system components (USE ONLY THESE)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── badge.tsx
│   │       ├── table.tsx
│   │       └── ...
│   ├── app/
│   │   └── globals.css           # Design tokens (colors, spacing, typography)
│   └── lib/
│       └── utils.ts              # Utility functions
```

---

## 🎯 Primary Rules

### 1. **Component Usage**

- ✅ **ONLY** use components from `/src/components/ui/`
- ✅ **NEVER** create custom buttons, cards, inputs, etc.
- ✅ **ALWAYS** check existing `/ui` components first

### 2. **Import Paths**

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ❌ Wrong
import { Button } from '../components/ui/button'
```

### 3. **Color System**

```tsx
// ✅ Use semantic classes
<div className="bg-card text-card-foreground border border-border">

// ❌ Don't use arbitrary values
<div className="bg-[#ffffff] text-[#000000]">
```

### 4. **Component Composition**

Build complex UIs by composing simple components:

```tsx
// ✅ Good
;<Card>
	<CardHeader>
		<CardTitle>Settings</CardTitle>
	</CardHeader>
	<CardContent>
		<form className='space-y-4'>
			<div className='space-y-2'>
				<Label>Name</Label>
				<Input />
			</div>
		</form>
	</CardContent>
	<CardFooter>
		<Button variant='outline'>Cancel</Button>
		<Button>Save</Button>
	</CardFooter>
</Card>

// ❌ Bad - Don't create monolithic components
const ComplexComponent = () => {
	return <div className='...many lines of custom styling...'>...</div>
}
```

---

## 📚 Documentation Files

### `.cursorrules` (ROOT - READ FIRST!)

- **Purpose:** Primary AI instructions file
- **Contains:** Component usage, patterns, do's and don'ts
- **When to read:** Always - this is the main guide

### `.cursor/DESIGN_SYSTEM.md`

- **Purpose:** Complete brand book
- **Contains:** Colors, typography, spacing, component reference
- **When to read:** When building UI components or designing layouts

### `.cursor/QUICK-REFERENCE.md`

- **Purpose:** Quick lookup
- **Contains:** Import statements, common patterns
- **When to read:** Need quick reference without reading full docs

---

## 🚀 Common Tasks & Patterns

### Creating a Form Page

```tsx
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
	return (
		<div className='container mx-auto px-4 py-6'>
			<Card>
				<CardHeader>
					<CardTitle>Settings</CardTitle>
				</CardHeader>
				<CardContent>
					<form className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input type='email' id='email' />
						</div>
					</form>
				</CardContent>
				<CardFooter>
					<Button>Save</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
```

### Adding a Delete Modal

```tsx
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
;<Dialog>
	<DialogTrigger asChild>
		<Button variant='destructive'>Delete</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Item</DialogTitle>
		</DialogHeader>
		<p>Are you sure you want to delete this item?</p>
		<DialogFooter>
			<Button variant='outline'>Cancel</Button>
			<Button variant='destructive'>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

### Creating a Data Table

```tsx
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
;<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Name</TableHead>
			<TableHead>Email</TableHead>
			<TableHead>Status</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{items.map(item => (
			<TableRow key={item.id}>
				<TableCell>{item.name}</TableCell>
				<TableCell>{item.email}</TableCell>
				<TableCell>
					<Badge variant='default'>{item.status}</Badge>
				</TableCell>
			</TableRow>
		))}
	</TableBody>
</Table>
```

---

## ✅ Checklist Before Creating UI

Before adding any UI element, ask:

1. ✅ Does `/src/components/ui/` have a component for this?
2. ✅ Can I compose existing `/ui` components?
3. ✅ Am I using the correct import path (`@/components/ui/`)?
4. ✅ Am I using semantic color classes (not arbitrary values)?
5. ✅ Am I following the established spacing system?
6. ✅ Does my component match the existing design patterns?

---

## 🔧 When You Need a New Component

If you absolutely need a new UI component:

1. ✅ Check if Radix UI has a primitive
2. ✅ Follow patterns in existing `/ui` components
3. ✅ Use CVA (class-variance-authority) for variants
4. ✅ Add to `/src/components/ui/`
5. ✅ Document in `.cursor/DESIGN_SYSTEM.md`
6. ✅ Update this file

---

## 📖 Key Files to Reference

| File                         | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `.cursorrules`               | **START HERE** - Main AI instructions |
| `.cursor/DESIGN_SYSTEM.md`   | Complete design reference             |
| `.cursor/QUICK-REFERENCE.md` | Quick reference card                  |
| `src/components/ui/*.tsx`    | Component implementation              |
| `src/app/globals.css`        | Design tokens (colors, spacing)       |

---

**Remember:** Consistency, reusability, and following established patterns are the core principles of this project.
