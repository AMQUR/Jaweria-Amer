"use client";

import {
  cloneElement,
  isValidElement,
  type FocusEvent,
  type FocusEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
} from "react";
import { preloadSecurePdfDesktopChunk, prefetchViewResource } from "@/lib/prefetch-view-resource-client";

/**
 * Merges hover/focus prefetch onto any `<Link>` that opens `/resources/view/:id`.
 */
export function PrefetchResourceViewAction({
  resourceId,
  children,
}: {
  resourceId: string;
  children: ReactElement<{
    onMouseEnter?: MouseEventHandler<Element>;
    onFocus?: FocusEventHandler<Element>;
  }>;
}) {
  const warm = () => {
    prefetchViewResource(resourceId);
    preloadSecurePdfDesktopChunk();
  };

  if (!isValidElement(children)) return children;

  return cloneElement(children, {
    onMouseEnter: (e: MouseEvent) => {
      warm();
      children.props.onMouseEnter?.(e);
    },
    onFocus: (e: FocusEvent) => {
      warm();
      children.props.onFocus?.(e);
    },
  });
}
