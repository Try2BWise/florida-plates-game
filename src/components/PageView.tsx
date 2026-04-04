import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface PageViewProps {
  title: string;
  onBack: () => void;
  tabs?: ReactNode;
  children: ReactNode;
}

export function PageView({ title, onBack, tabs, children }: PageViewProps) {
  return (
    <div className="page-view">
      <div className="page-view__header">
        <button type="button" className="page-view__back" onClick={onBack}>
          <Icon name="chevron-left" size={28} />
        </button>
        <h1 className="page-view__title">{title}</h1>
      </div>
      {tabs ? <div className="page-view__tabs">{tabs}</div> : null}
      <div className="page-view__content">{children}</div>
    </div>
  );
}
