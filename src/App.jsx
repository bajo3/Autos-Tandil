import { Routes, Route, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Splash } from './components/Splash';
import { useFavorites } from './hooks/useFavorites';
import { useRecents } from './hooks/useRecents';
import { useCars } from './hooks/useCars';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import Home from './screens/Home';
import Catalogo from './screens/Catalogo';
import Detalle from './screens/Detalle';
import Favoritos from './screens/Favoritos';
import Vender from './screens/Vender';
import Subastas from './screens/Subastas';
import Admin from './screens/Admin';
import { trackPageView } from './services/analyticsService';

const NAV_ROUTES = ['/', '/catalogo', '/favoritos', '/subastas'];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function AnalyticsTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageType = pathname.startsWith('/auto/') ? 'car_detail'
      : pathname.startsWith('/admin') ? 'admin'
        : pathname === '/' ? 'home'
          : pathname.split('/')[1] || 'page';
    trackPageView(pathname, pageType);
  }, [pathname]);

  return null;
}

function DetalleWrapper({ favs, onFav, pushRecent, cars }) {
  const { id } = useParams();
  useEffect(() => { if (id) pushRecent(id); }, [id, pushRecent]);
  return <Detalle favs={favs} onFav={onFav} cars={cars} />;
}

export default function App() {
  const { favs, toggle } = useFavorites();
  const { recents, push: pushRecent } = useRecents();
  const inventory = useCars();
  const { pathname } = useLocation();
  const showNav = NAV_ROUTES.includes(pathname);

  // Show splash only once per browser session
  const [splashDone, setSplashDone] = useState(() => {
    try {
      const shown = sessionStorage.getItem('at_splash');
      if (!shown) { sessionStorage.setItem('at_splash', '1'); return false; }
    } catch { /* ignore */ }
    return true;
  });
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <Splash onDone={handleSplashDone} />}
      <ScrollToTop />
      <AnalyticsTracker />
      <DesktopNav favCount={favs.length} />
      <Routes>
        <Route path="/" element={<Home favs={favs} onFav={toggle} recents={recents} cars={inventory.cars} />} />
        <Route path="/catalogo" element={<Catalogo favs={favs} onFav={toggle} cars={inventory.cars} loadingCars={inventory.loading} source={inventory.source} />} />
        <Route path="/auto/:id" element={<DetalleWrapper favs={favs} onFav={toggle} pushRecent={pushRecent} cars={inventory.cars} />} />
        <Route path="/favoritos" element={<Favoritos favs={favs} onFav={toggle} cars={inventory.cars} />} />
        <Route path="/vender" element={<Vender />} />
        <Route path="/subastas" element={<Subastas cars={inventory.cars} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<Admin />} />
        <Route path="/admin/autos" element={<Admin />} />
        <Route path="/admin/autos/nuevo" element={<Admin />} />
        <Route path="/admin/autos/:id/editar" element={<Admin />} />
        <Route path="/admin/subastas" element={<Admin />} />
        <Route path="/admin/analytics" element={<Admin />} />
        <Route path="*" element={<Home favs={favs} onFav={toggle} recents={recents} cars={inventory.cars} />} />
      </Routes>
      {showNav && <BottomNav favCount={favs.length} />}
    </>
  );
}
