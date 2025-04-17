import React from 'react';
import {
  YAxis as RechartsYAxis,
  YAxisProps,
  XAxis as RechartsXAxis,
  XAxisProps,
  Legend as RechartsLegend,
  LegendProps,
  Tooltip as RechartsTooltip,
  TooltipProps,
  CartesianGrid as RechartsCartesianGrid,
  CartesianGridProps,
  Line as RechartsLine,
  LineProps
} from 'recharts';

/**
 * A wrapper for the Recharts YAxis component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const YAxis = ({
  // Define default parameters here
  allowDecimals = true,
  allowDataOverflow = false,
  allowDuplicatedCategory = true,
  hide = false,
  orientation = 'left',
  width = 60,
  height = 0,
  mirror = false,
  yAxisId = 0,
  tickCount = 5,
  ...props
}: YAxisProps) => {
  return (
    <RechartsYAxis
      allowDecimals={allowDecimals}
      allowDataOverflow={allowDataOverflow}
      allowDuplicatedCategory={allowDuplicatedCategory}
      hide={hide}
      orientation={orientation}
      width={width}
      height={height}
      mirror={mirror}
      yAxisId={yAxisId}
      tickCount={tickCount}
      {...props}
    />
  );
};

/**
 * A wrapper for the Recharts XAxis component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const XAxis = ({
  // Define default parameters here
  allowDecimals = true,
  allowDataOverflow = false,
  allowDuplicatedCategory = true,
  hide = false,
  orientation = 'bottom',
  width = 0,
  height = 30,
  mirror = false,
  xAxisId = 0,
  tickCount = 5,
  ...props
}: XAxisProps) => {
  return (
    <RechartsXAxis
      allowDecimals={allowDecimals}
      allowDataOverflow={allowDataOverflow}
      allowDuplicatedCategory={allowDuplicatedCategory}
      hide={hide}
      orientation={orientation}
      width={width}
      height={height}
      mirror={mirror}
      xAxisId={xAxisId}
      tickCount={tickCount}
      {...props}
    />
  );
};

/**
 * A wrapper for the Recharts Legend component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const Legend = ({
  iconSize = 14,
  iconType = 'rect',
  align = 'center',
  verticalAlign = 'bottom',
  layout = 'horizontal',
  ...props
}: LegendProps) => {
  return (
    <RechartsLegend
      iconSize={iconSize}
      iconType={iconType}
      align={align}
      verticalAlign={verticalAlign}
      layout={layout}
      {...props}
    />
  );
};

/**
 * A wrapper for the Recharts Tooltip component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const Tooltip = ({
  active = false,
  allowEscapeViewBox = { x: false, y: false },
  offset = 10,
  viewBox = { x: 0, y: 0, width: 0, height: 0 },
  ...props
}: TooltipProps<any, any>) => {
  return (
    <RechartsTooltip
      active={active}
      allowEscapeViewBox={allowEscapeViewBox}
      offset={offset}
      viewBox={viewBox}
      {...props}
    />
  );
};

/**
 * A wrapper for the Recharts CartesianGrid component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const CartesianGrid = ({
  horizontal = true,
  vertical = true,
  horizontalPoints = [],
  verticalPoints = [],
  ...props
}: CartesianGridProps) => {
  return (
    <RechartsCartesianGrid
      horizontal={horizontal}
      vertical={vertical}
      horizontalPoints={horizontalPoints}
      verticalPoints={verticalPoints}
      {...props}
    />
  );
};

/**
 * A wrapper for the Recharts Line component that uses default parameters
 * instead of defaultProps to avoid React warnings.
 */
export const Line = ({
  type = 'linear',
  points = [],
  isAnimationActive = true,
  animationBegin = 0,
  animationDuration = 1500,
  animationEasing = 'ease',
  ...props
}: LineProps) => {
  return (
    <RechartsLine
      type={type}
      points={points}
      isAnimationActive={isAnimationActive}
      animationBegin={animationBegin}
      animationDuration={animationDuration}
      animationEasing={animationEasing}
      {...props}
    />
  );
};