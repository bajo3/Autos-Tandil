import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const NAV_ROUTES = ['/', '/catalogo', '/favoritos', '/subastas'];

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

  return (
    <>
      <DesktopNav favCount={favs.length} />
      <Routes>
        <Route path="/" element={<Home favs={favs} onFav={toggle} recents={recents} cars={inventory.cars} />} />
        <Route path="/catalogo" element={<Catalogo favs={favs} onFav={toggle} cars={inventory.cars} loadingCars={inventory.loading} source={inventory.source} />} />
        <Route path="/auto/:id" element={<DetalleWrapper favs={favs} onFav={toggle} pushRecent={pushRecent} cars={inventory.cars} />} />
        <Route path="/favoritos" element={<Favoritos favs={favs} onFav={toggle} cars={inventory.cars} />} />
        <Route path="/vender" element={<Vender />} />
        <Route path="/subastas" element={<Subastas />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<Admin />} />
        <Route path="/admin/autos" element={<Admin />} />
        <Route path="*" element={<Home favs={favs} onFav={toggle} recents={recents} cars={inventory.cars} />} />
      </Routes>
      {showNav && <BottomNav favCount={favs.length} />}
    </>
  );
}
