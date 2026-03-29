# UI Design Rules

## Component Library

- **Always use shadcn/ui components first** — check `components/ui/` before creating custom ones
- Custom feature components: `components/features/<domain>/`
- Reusable layout components: `components/layouts/`

## Styling

- Use **Tailwind CSS utility classes** for all styling
- Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes:

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class")} />
```

- Never use inline `style={}` attributes
- Never create CSS modules — use `globals.css` for global styles only
- CSS variables defined in `globals.css` under `:root` and `.dark`

## Accessibility

- Interactive elements must have accessible labels
- Use semantic HTML (`<main>`, `<nav>`, `<section>`)
- Support keyboard navigation (visible focus rings)
- Respect `prefers-reduced-motion` for animations

## Icons

- Use **lucide-react** icons
- Standard: `h-4 w-4` inline, `h-5 w-5` headers

## Destructive Actions

- ALL delete/remove actions MUST use `AlertDialog` from shadcn/ui
- Apply `useDelayedConfirm` hook (500ms safety delay)
- Destructive buttons use `variant="destructive"`
