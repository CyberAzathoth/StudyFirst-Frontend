import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Outlet />
    </div>
  );
}
