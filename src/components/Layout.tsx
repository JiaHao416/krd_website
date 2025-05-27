import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import SideMenu from "./SideMenu";

interface LayoutProps {
  children: ReactNode;
  showSideMenu?: boolean;
  title?: string;
}

const Layout = ({ children, showSideMenu = false, title }: LayoutProps) => {
  const MainContent = () => {
    if (showSideMenu) {
      return (
        <div className="flex-1 flex">
          <div className="max-w-7xl mx-auto w-full flex">
            <SideMenu title={title} />
            <main className="flex-1 min-h-screen">{children}</main>
          </div>
        </div>
      );
    }

    return <main className="flex-1">{children}</main>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavBar />
      <MainContent />
      <Footer />
    </div>
  );
};

export default Layout;
