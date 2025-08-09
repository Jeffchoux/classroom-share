import * as React from "react";
export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm", className].join(" ")} {...props} />
);
export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["mb-3 flex items-center justify-between", className].join(" ")} {...props} />
);
export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["space-y-3", className].join(" ")} {...props} />
);
