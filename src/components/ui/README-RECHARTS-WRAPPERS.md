# Recharts Wrapper Components

## Overview

This directory contains wrapper components for Recharts to fix React 18 warnings about `defaultProps` being deprecated in function components. These wrappers use JavaScript default parameters instead of `defaultProps` to provide default values.

## Problem

In React 18, using `defaultProps` on function components triggers warnings:

```
Warning: YAxis: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.
```

## Solution

We've created wrapper components for the commonly used Recharts components that:

1. Import the original Recharts components
2. Define the same props with default values using JavaScript default parameters
3. Pass all props to the original components

## Usage

Instead of importing components directly from 'recharts', import them from this wrapper file:

```jsx
// BEFORE
import { YAxis, XAxis, Line } from 'recharts';

// AFTER
import { YAxis, XAxis, Line } from './ui/recharts-wrappers';
```

## Components Included

- `YAxis` - Wrapper for Recharts YAxis
- `XAxis` - Wrapper for Recharts XAxis
- `Legend` - Wrapper for Recharts Legend
- `Tooltip` - Wrapper for Recharts Tooltip
- `CartesianGrid` - Wrapper for Recharts CartesianGrid
- `Line` - Wrapper for Recharts Line

## Adding More Components

If you encounter warnings for other Recharts components, follow this pattern to add more wrappers:

1. Import the component from 'recharts'
2. Create a wrapper function component with default parameters
3. Pass all props to the original component

Example:

```jsx
import { SomeComponent as RechartsSomeComponent, SomeComponentProps } from 'recharts';

export const SomeComponent = ({
  // Default parameters
  defaultProp1 = 'defaultValue1',
  defaultProp2 = 'defaultValue2',
  ...props
}: SomeComponentProps) => {
  return (
    <RechartsSomeComponent
      defaultProp1={defaultProp1}
      defaultProp2={defaultProp2}
      {...props}
    />
  );
};
```
