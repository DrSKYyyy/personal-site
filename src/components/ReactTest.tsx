import { cn } from "../lib/utils";

export default function ReactTest() {
  return (
    <div className={cn(
      "mx-auto mt-8 max-w-md rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 text-center shadow-lg",
      "dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30"
    )}>
      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
        ✅ React + Tailwind 加载成功
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        现在的 React 组件可以和 Astro 组件共存
      </p>
    </div>
  );
}
