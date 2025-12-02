# Error Handler Usage Guide

This guide shows how to use the error handling utilities in your components.

## Automatic Error Handling

All API calls through `apiClient` automatically show toast notifications on errors. No additional code needed!

```typescript
import { apiClient } from '@/lib/api/client';

// Errors are automatically shown to users via toast
const data = await apiClient.get('/chains');
```

## Manual Toast Notifications

### Show Error Toast

```typescript
import { showErrorToast } from '@/lib/utils/error-handler';

try {
  await someOperation();
} catch (error) {
  showErrorToast(error, 'Failed to complete operation');
}
```

### Show Success Toast

```typescript
import { showSuccessToast } from '@/lib/utils/error-handler';

showSuccessToast('Chain created successfully!');
```

### Show Info/Warning Toast

```typescript
import { showInfoToast, showWarningToast } from '@/lib/utils/error-handler';

showInfoToast('Processing your request...');
showWarningToast('This action cannot be undone');
```

## Error Handler Wrappers

### withErrorHandler (safe, returns null on error)

Use when you want to handle errors gracefully without throwing:

```typescript
import { withErrorHandler } from '@/lib/utils/error-handler';

// Returns null if error occurs, shows toast automatically
const result = await withErrorHandler(
  async () => {
    return await apiClient.post('/chains', data);
  },
  {
    errorMessage: 'Failed to create chain',
    successMessage: 'Chain created successfully!',
    showSuccess: true,
  }
);

if (result) {
  // Success handling
  console.log('Chain created:', result);
} else {
  // Error was handled, show fallback UI
}
```

### withErrorToast (throws error after showing toast)

Use when you need to handle the error in calling code:

```typescript
import { withErrorToast } from '@/lib/utils/error-handler';

try {
  const result = await withErrorToast(
    async () => {
      return await apiClient.post('/chains', data);
    },
    'Failed to create chain'
  );
  
  // Success handling
  console.log('Chain created:', result);
} catch (error) {
  // Toast already shown, handle error state
  setIsError(true);
}
```

## Complete Component Example

```typescript
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { withErrorHandler, showSuccessToast } from '@/lib/utils/error-handler';

export function CreateChainForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    
    // Errors are automatically shown via toast, returns null on error
    const result = await withErrorHandler(
      async () => {
        return await apiClient.post('/chains', data);
      },
      {
        errorMessage: 'Failed to create chain',
        successMessage: 'Chain created successfully!',
        showSuccess: true,
      }
    );
    
    setLoading(false);
    
    if (result) {
      // Success - redirect or update UI
      router.push(`/chains/${result.data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Error Boundary

The entire app is wrapped in an `ErrorBoundary` component that:
- Catches all JavaScript errors in the component tree
- Prevents the app from crashing
- Shows a fallback UI with a refresh button
- Displays toast notifications for errors

No additional setup needed - it's already configured in the root layout!

## Disable Auto Toast for Specific API Calls

If you want to handle errors manually for a specific API call:

```typescript
import { apiClient } from '@/lib/api/client';

try {
  const response = await apiClient.getAxiosInstance().get('/endpoint', {
    skipErrorToast: true, // Disable auto toast for this call
  });
} catch (error) {
  // Handle error manually
  console.log('Custom error handling');
}
```

