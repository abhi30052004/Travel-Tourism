import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProposalPage from './pages/ProposalPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import QuizPage from './pages/QuizPage';
import DiscoverDetailPage from './pages/DiscoverDetailPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/request-proposal" element={<ProposalPage />} />
                <Route path="/destination/:id" element={<DestinationDetailPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/discover/:id" element={<DiscoverDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </>
          }
        />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
