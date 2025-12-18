import { Header } from './Header';
import './Layout.css';

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

