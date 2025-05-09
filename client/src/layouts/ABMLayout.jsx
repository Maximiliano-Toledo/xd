import { Header } from './Header';
import { Footer } from './Footer';

export const ABMLayout = ({ children }) => {
  return (
    <div className="page-container">
      <Header />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};