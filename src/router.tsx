import { createRootRoute, createRoute, createRouter, Outlet, Link } from "@tanstack/react-router";
import { MathGame } from "@/components/MathGame";
import { HistoryList } from "@/components/HistoryList";
import { HistoryDetail } from "@/components/HistoryDetail";

// ======== 根路由：全局布局（Header + 导航） ========

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            🧮 速算练习
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
            >
              练习
            </Link>
            <Link
              to="/history"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
            >
              历史
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

// ======== 子路由 ========

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MathGame,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryList,
});

const historyDetailRoute = createRoute({
  getParentRoute: () => historyRoute,
  path: "$id",
  component: HistoryDetail,
});

// ======== 路由树 + Router 实例 ========

export const routeTree = rootRoute.addChildren([
  indexRoute,
  historyRoute.addChildren([historyDetailRoute]),
]);

export const router = createRouter({ routeTree });

// 注册路由器类型（useParams / useNavigate 等方法自动推断类型）
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
