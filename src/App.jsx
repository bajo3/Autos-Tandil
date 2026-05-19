import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
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
import { trackEvent, trackPageView } from './services/analyticsService';

const Vender = lazy(() => import('./screens/Vender'));
const SubastasPanel = lazy(() => import('./screens/SubastasPanel'));
const Admin = lazy(() => import('./screens/Admin'));

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
  const inventory = useCars({ includeSold: true });
  const { pathname } = useLocation();
  const showNav = NAV_ROUTES.includes(pathname);
  const availableCars = useMemo(() => inventory.cars.filter(car => !['sold', 'reserved', 'draft'].includes(car.status)), [inventory.cars]);
  const publicCars = availableCars.length ? availableCars : inventory.cars;
  const soldCars = useMemo(() => inventory.cars.filter(car => ['sold', 'reserved'].includes(car.status)), [inventory.cars]);

  // Show splash only once per browser session
  const [splashDone, setSplashDone] = useState(() => {
    try {
      const shown = sessionStorage.getItem('at_splash');
      if (!shown) { sessionStorage.setItem('at_splash', '1'); return false; }
    } catch { /* ignore */ }
    return true;
  });
  const handleSplashDone = useCallback(() => setSplashDone(true), []);
  const handleFavorite = useCallback((id) => {
    const car = inventory.cars.find(item => item.id === id);
    trackEvent(favs.includes(id) ? 'favorite_removed' : 'favorite_added', { source: pathname, car });
    toggle(id);
  }, [favs, inventory.cars, pathname, toggle]);

  return (
    <>
      {!splashDone && <Splash onDone={handleSplashDone} />}
      <ScrollToTop />
      <AnalyticsTracker />
      <DesktopNav favCount={favs.length} />
      <Suspense fallback={<div className="skel" style={{ height: 3 }} />}>
        <Routes>
          <Route path="/" element={<Home favs={favs} onFav={handleFavorite} recents={recents} cars={publicCars} soldCars={soldCars} />} />
          <Route path="/catalogo" element={<Catalogo favs={favs} onFav={handleFavorite} cars={publicCars} loadingCars={inventory.loading} source={inventory.source} />} />
          <Route path="/auto/:id" element={<DetalleWrapper favs={favs} onFav={handleFavorite} pushRecent={pushRecent} cars={inventory.cars} />} />
          <Route path="/favoritos" element={<Favoritos favs={favs} onFav={handleFavorite} cars={inventory.cars} />} />
          <Route path="/vender" element={<Vender />} />
          <Route path="/subastas" element={<SubastasPanel />} />
          <Route path="/subastas/panel" element={<SubastasPanel />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<Admin />} />
          <Route path="/admin/autos" element={<Admin />} />
          <Route path="/admin/autos/nuevo" element={<Admin />} />
          <Route path="/admin/autos/:id/editar" element={<Admin />} />
          <Route path="/admin/subastas" element={<Admin />} />
          <Route path="/admin/analytics" element={<Admin />} />
          <Route path="/admin/leads" element={<Admin />} />
          <Route path="*" element={<Home favs={favs} onFav={handleFavorite} recents={recents} cars={publicCars} soldCars={soldCars} />} />
        </Routes>
      </Suspense>
      {showNav && <BottomNav favCount={favs.length} />}
    </>
  );
}
