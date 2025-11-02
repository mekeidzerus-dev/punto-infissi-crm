# 🎨 Design System - Punto Infissi CRM

**Version:** 1.1.0  
**Last Updated:** January 2025

This document serves as the complete design guide for the Punto Infissi CRM system. All UI development must follow these guidelines to ensure consistency and maintainability.

---

## 📋 Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Component Library](#component-library)
4. [Spacing System](#spacing-system)
5. [Layout Patterns](#layout-patterns)
6. [Usage Guidelines](#usage-guidelines)

---

## 🎨 Color Palette

### Design Philosophy

The system uses **OKLCH color space** for better perceptual uniformity and future-proof color management.

### Base Colors

#### Light Mode

| Token              | OKLCH Value                 | Usage                    |
| ------------------ | --------------------------- | ------------------------ |
| Background         | `oklch(1 0 0)`              | Main background          |
| Foreground         | `oklch(0.145 0 0)`          | Primary text (Black)     |
| Card               | `oklch(1 0 0)`              | Card background          |
| Card Foreground    | `oklch(0.145 0 0)`          | Card text                |
| Primary            | `oklch(0.205 0 0)`          | Primary actions, buttons |
| Primary Foreground | `oklch(0.985 0 0)`          | Text on primary          |
| Secondary          | `oklch(0.97 0 0)`           | Secondary elements       |
| Muted              | `oklch(0.97 0 0)`           | Subtle backgrounds       |
| Muted Foreground   | `oklch(0.556 0 0)`          | Secondary text           |
| Destructive        | `oklch(0.577 0.245 27.325)` | Delete, error actions    |
| Border             | `oklch(0.922 0 0)`          | Borders                  |
| Input              | `oklch(0.922 0 0)`          | Input backgrounds        |

#### Dark Mode

| Token       | OKLCH Value                 | Usage                |
| ----------- | --------------------------- | -------------------- |
| Background  | `oklch(0.145 0 0)`          | Dark background      |
| Foreground  | `oklch(0.985 0 0)`          | Light text           |
| Card        | `oklch(0.205 0 0)`          | Dark card            |
| Primary     | `oklch(0.922 0 0)`          | Primary in dark mode |
| Destructive | `oklch(0.704 0.191 22.216)` | Destructive in dark  |

### Chart Colors

- Chart 1: `oklch(0.646 0.222 41.116)` - Warm orange
- Chart 2: `oklch(0.6 0.118 184.704)` - Teal
- Chart 3: `oklch(0.398 0.07 227.392)` - Purple
- Chart 4: `oklch(0.828 0.189 84.429)` - Yellow
- Chart 5: `oklch(0.769 0.188 70.08)` - Green

### Sidebar Colors

- Sidebar: `oklch(0.985 0 0)` (Light) / `oklch(0.205 0 0)` (Dark)
- Sidebar Primary: `oklch(0.205 0 0)` (Light) / `oklch(0.488 0.243 264.376)` (Dark)
- Sidebar Accent: `oklch(0.97 0 0)` (Light) / `oklch(0.269 0 0)` (Dark)

---

## 🔤 Typography

### Font Families

```css
--font-sans: Geist Sans    /* Primary font */
--font-mono: Geist Mono    /* Code, numbers */
```

### Font Scale

| Element       | Class            | Size | Weight         | Line Height |
| ------------- | ---------------- | ---- | -------------- | ----------- |
| Page Heading  | `.text-2xl`      | 24px | Semibold (600) | 1.2         |
| Section Title | `.text-lg`       | 18px | Semibold (600) | 1.4         |
| Card Title    | `.font-semibold` | 16px | Semibold (600) | 1.5         |
| Body Text     | `.text-base`     | 16px | Regular (400)  | 1.5         |
| Small Text    | `.text-sm`       | 14px | Regular (400)  | 1.5         |
| Tiny Text     | `.text-xs`       | 12px | Medium (500)   | 1.4         |

### Usage Examples

```tsx
// Page title
<h1 className="text-2xl font-semibold leading-none">

// Section heading
<h2 className="text-lg leading-none font-semibold">

// Card title
<h3 className="font-semibold">Card Title</h3>

// Description text
<p className="text-sm text-muted-foreground">

// Body text
<p className="text-base">
```

---

## 🧩 Component Library

### 1. Button

**Location:** `src/components/ui/button.tsx`

**Variants:**

- `default` - Primary button (black)
- `destructive` - Delete, error actions (red)
- `outline` - Outlined button
- `secondary` - Secondary actions
- `ghost` - Minimal button
- `link` - Text link button

**Sizes:**

- `default` - 36px height
- `sm` - 32px height
- `lg` - 40px height
- `icon` - 36px square
- `icon-sm` - 32px square
- `icon-lg` - 40px square

**Usage:**

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">
  Click me
</Button>

<Button variant="outline" size="sm">
  Cancel
</Button>

<Button variant="destructive">
  Delete
</Button>
```

### 2. Card

**Location:** `src/components/ui/card.tsx`

**Components:**

- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Description
- `CardContent` - Main content
- `CardFooter` - Footer actions
- `CardAction` - Action area

**Usage:**

```tsx
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	CardAction,
} from '@/components/ui/card'
;<Card>
	<CardHeader>
		<CardTitle>Settings</CardTitle>
		<CardDescription>Manage your preferences</CardDescription>
		<CardAction>
			<Button variant='ghost'>Edit</Button>
		</CardAction>
	</CardHeader>
	<CardContent>{/* Content */}</CardContent>
	<CardFooter>
		<Button>Save</Button>
	</CardFooter>
</Card>
```

### 3. Dialog (Modal)

**Location:** `src/components/ui/dialog.tsx`

**Components:**

- `Dialog` - Root
- `DialogTrigger` - Trigger element
- `DialogContent` - Modal content
- `DialogHeader` - Header
- `DialogTitle` - Title
- `DialogDescription` - Description
- `DialogFooter` - Footer

**Usage:**

```tsx
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
;<Dialog>
	<DialogTrigger asChild>
		<Button>Open Modal</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Profile</DialogTitle>
			<DialogDescription>Make changes to your profile here.</DialogDescription>
		</DialogHeader>
		{/* Content */}
		<DialogFooter>
			<Button variant='outline'>Cancel</Button>
			<Button>Save Changes</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

### 4. Input

**Location:** `src/components/ui/input.tsx`

**Props:**

- Standard HTML input props
- `type` - Input type
- `placeholder` - Placeholder text

**Usage:**

```tsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Enter name..." />

<Input type="email" placeholder="email@example.com" />

<Input type="password" placeholder="Password" />
```

### 5. Select

**Location:** `src/components/ui/select.tsx`

**Components:**

- `Select` - Root
- `SelectTrigger` - Trigger
- `SelectValue` - Displayed value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option

**Sizes:**

- `default` - 36px height
- `sm` - 32px height

**Usage:**

```tsx
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'
;<Select>
	<SelectTrigger className='w-[180px]'>
		<SelectValue placeholder='Select a language' />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value='it'>Italiano</SelectItem>
		<SelectItem value='ru'>Русский</SelectItem>
	</SelectContent>
</Select>
```

### 6. Badge

**Location:** `src/components/ui/badge.tsx`

**Variants:**

- `default` - Primary badge
- `secondary` - Secondary badge
- `destructive` - Error/delete badge
- `outline` - Outlined badge

**Usage:**

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Deleted</Badge>
<Badge variant="outline">Pending</Badge>
```

### 7. Table

**Location:** `src/components/ui/table.tsx`

**Components:**

- `Table` - Table container
- `TableHeader` - Header row container
- `TableBody` - Body rows container
- `TableRow` - Row
- `TableHead` - Header cell
- `TableCell` - Data cell

**Usage:**

```tsx
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table'
;<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Name</TableHead>
			<TableHead>Email</TableHead>
			<TableHead>Status</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>John Doe</TableCell>
			<TableCell>john@example.com</TableCell>
			<TableCell>
				<Badge variant='default'>Active</Badge>
			</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

### 8. Checkbox

**Location:** `src/components/ui/checkbox.tsx`

```tsx
import { Checkbox } from '@/components/ui/checkbox'
;<Checkbox checked={checked} onCheckedChange={setChecked} />
```

### 9. Label

**Location:** `src/components/ui/label.tsx`

```tsx
import { Label } from '@/components/ui/label'
;<Label htmlFor='email'>Email Address</Label>
```

### 10. Separator

**Location:** `src/components/ui/separator.tsx`

```tsx
import { Separator } from '@/components/ui/separator'
;<Separator />
```

### 11. Tooltip

**Location:** `src/components/ui/tooltip.tsx`

```tsx
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip'
;<Tooltip>
	<TooltipTrigger>Hover me</TooltipTrigger>
	<TooltipContent>This is a tooltip</TooltipContent>
</Tooltip>
```

---

## 📏 Spacing System

Based on Tailwind's default spacing scale:

| Token       | Value | Usage                |
| ----------- | ----- | -------------------- |
| `space-y-2` | 8px   | Compact spacing      |
| `space-y-4` | 16px  | Default form spacing |
| `space-y-6` | 24px  | Large sections       |
| `gap-2`     | 8px   | Tight grouping       |
| `gap-4`     | 16px  | Default gaps         |
| `gap-6`     | 24px  | Large gaps           |

### Card Spacing

```tsx
// Standard card padding
<Card className="py-6">  // 24px vertical

// Card content padding
<CardHeader className="px-6 pb-6">  // 24px horizontal, 24px bottom
<CardContent className="px-6">  // 24px horizontal
<CardFooter className="px-6 pt-6">  // 24px horizontal, 24px top
```

### Form Spacing

```tsx
<form className='space-y-4'>
	<div className='space-y-2'>
		<Label>Field Name</Label>
		<Input />
	</div>
</form>
```

---

## 🎯 Layout Patterns

### Standard Page Layout

```tsx
<div className='container mx-auto px-4 py-6'>
	<div className='space-y-6'>
		<div>
			<h1 className='text-2xl font-semibold'>Page Title</h1>
			<p className='text-sm text-muted-foreground'>Description</p>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>Section Title</CardTitle>
			</CardHeader>
			<CardContent>{/* Content */}</CardContent>
		</Card>
	</div>
</div>
```

### Form Layout

```tsx
<Card>
	<CardHeader>
		<CardTitle>Form Title</CardTitle>
		<CardDescription>Form description</CardDescription>
	</CardHeader>
	<CardContent>
		<form className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='name'>Name</Label>
				<Input id='name' />
			</div>

			<div className='space-y-2'>
				<Label htmlFor='email'>Email</Label>
				<Input type='email' id='email' />
			</div>
		</form>
	</CardContent>
	<CardFooter>
		<Button variant='outline'>Cancel</Button>
		<Button>Save</Button>
	</CardFooter>
</Card>
```

### Dialog Form Layout

```tsx
<Dialog>
	<DialogTrigger asChild>
		<Button>Open</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Item</DialogTitle>
			<DialogDescription>Make changes to the item below.</DialogDescription>
		</DialogHeader>

		<form className='space-y-4'>
			<div className='space-y-2'>
				<Label>Field</Label>
				<Input />
			</div>
		</form>

		<DialogFooter>
			<Button variant='outline'>Cancel</Button>
			<Button type='submit'>Save</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

---

## 📐 Border Radius

| Token        | Value | Usage          |
| ------------ | ----- | -------------- |
| `rounded-md` | 6px   | Small elements |
| `rounded-lg` | 10px  | Cards, buttons |
| `rounded-xl` | 12px  | Large cards    |

### Custom Radius System

```css
--radius-sm: calc(var(--radius) - 4px)    /* 6px */
--radius-md: calc(var(--radius) - 2px)    /* 8px */
--radius-lg: var(--radius)                /* 10px */
--radius-xl: calc(var(--radius) + 4px)     /* 14px */
```

---

## 💡 Usage Guidelines

### Import Paths

Always use absolute imports:

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ❌ Wrong
import { Button } from '../components/ui/button'
```

### Component Composition

Build complex UIs by composing simple components:

```tsx
// ✅ Good - Composing components
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
		<Button>Save</Button>
	</CardFooter>
</Card>

// ❌ Bad - Creating one-off complex component
const SettingsCard = () => {
	// 100 lines of custom markup...
}
```

### Color Usage

```tsx
// ✅ Use semantic classes
<div className="bg-card text-card-foreground border border-border">

// ❌ Don't use arbitrary values
<div className="bg-[#ffffff] text-[#000000] border border-[#e0e0e0]">
```

### Responsive Design

```tsx
// Grid layouts
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'

// Typography
className = 'text-sm md:text-base lg:text-lg'

// Spacing
className = 'p-4 md:p-6 lg:p-8'
```

---

## 🚀 Quick Reference

### Common Patterns

```tsx
// Primary button
<Button>Action</Button>

// Outlined button
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Card with header
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Input field
<div className="space-y-2">
  <Label htmlFor="field">Field</Label>
  <Input id="field" />
</div>

// Modal
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 📝 File Structure

```
src/
├── components/
│   └── ui/              # Design system components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       └── ...
└── app/
    └── globals.css      # Design tokens
```

---

**Remember:** Always reference this document when building new features or components. Consistency is key to a great user experience.
