import { createFileRoute, Outlet } from "@tanstack/react-router";

// The public list and tutorial detail pages render through this parent route.
export const Route = createFileRoute("/tutorials")({
  component: TutorialsLayout,
});

function TutorialsLayout() {
  return <Outlet />;
}
