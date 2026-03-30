# Senior Engineer Review Comment Example

## Output Format

### 🤖 Senior Engineer Auto-Review

Thank you for this PR. I've reviewed the implementation thoroughly.
Overall the architecture follows our established patterns well, but I have a few concerns regarding security and performance.

### ⚠️ Must Fix

**1. Missing error boundary in `src/api/handler.ts`**
```typescript
try {
  await processData(input);
} catch (e) {
  console.log(e); // 🚨 Silent failure
}
```
Logging the error without propagating it means the caller assumes success. Either re-throw or return an appropriate error response (e.g., HTTP 500).

### 💡 Suggestion

**2. Potential N+1 query in `src/services/user.ts`**
`getUserDetail(id)` is called inside a loop. Consider collecting IDs and using a batch query like `getUsersByIds(ids)` to dramatically reduce database round-trips.

```typescript
// Before (N+1)
for (const id of userIds) {
  const user = await getUserDetail(id);
}

// After (batch)
const users = await getUsersByIds(userIds);
```

### 📝 Question

- `const MAX_RETRY = 3;` — What is the rationale for this value? Given the external API's rate limits, exponential backoff might be worth considering.

### 👍 Praise

- The use of `createSafeAction` for consistent auth + error handling is clean and well-designed. Good adherence to the project's architectural patterns.
