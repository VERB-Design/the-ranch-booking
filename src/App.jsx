import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BookingProvider, D, useBooking } from './store.jsx';
import { ConfigProvider, upsellOn, useConfig } from './config.jsx';
import { SkipLink } from './components/Chrome.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Location from './pages/Location.jsx';
import Program from './pages/Program.jsx';
import Rooms from './pages/Rooms.jsx';
import RoomDetail from './pages/RoomDetail.jsx';
import Upgrade from './pages/Upgrade.jsx';
import AddOns from './pages/AddOns.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';

/* React Router keeps the previous scroll position across navigations, so a
   new page can open mid-way down. Start every route at the top — unless the
   URL carries a hash, in which case the target page anchors itself. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/* Switching a feature off has to unwind any state that feature created,
   or the flow keeps carrying a second room, an upgrade, or an add-on that
   nothing on screen can now explain or remove. */
function ConfigSync() {
  const config = useConfig();
  const { state, set } = useBooking();

  useEffect(() => {
    const patch = {};
    let rooms = state.rooms || [];

    if (!config.multiProperty && state.property && state.property !== D.propertyList[0]) {
      patch.property = D.propertyList[0];
      rooms = rooms.map((r) => ({ ...r, roomId: null, upgradedFrom: null }));
      patch.rooms = rooms;
    }

    if (!config.multiRoom && rooms.length > 1) {
      rooms = rooms.slice(0, 1);
      patch.rooms = rooms;
      patch.editRoom = null;
    }

    if (!config.showUpgrades && rooms.some((r) => r.upgradedFrom)) {
      patch.rooms = rooms.map((r) => (r.upgradedFrom ? { ...r, roomId: r.upgradedFrom, upgradedFrom: null } : r));
    }

    if (!config.extensions && state.extension) {
      patch.extension = null;
    }

    if (!config.showAmenities && (state.addons || []).length) {
      patch.addons = [];
    }

    if (Object.keys(patch).length) set(patch);
  }, [config, state, set]);

  return null;
}

function FlowRoutes() {
  const config = useConfig();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        {/* A single-property build has no property picker at all — the
            route does not exist, rather than existing and being hidden. */}
        {config.multiProperty && <Route path="/location" element={<Location />} />}
        <Route path="/program" element={<Program />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        {upsellOn(config, 'upgrades', 'page') && <Route path="/upgrade" element={<Upgrade />} />}
        {upsellOn(config, 'amenities', 'page') && <Route path="/add-ons" element={<AddOns />} />}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Route>
      {/* unknown paths (incl. the Pages 404 fallback) return to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    /* basename tracks Vite's base so the app works at / in dev and at
       a sub-path in a static deploy */
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ConfigProvider>
        <BookingProvider>
          <ConfigSync />
          <ScrollToTop />
          {/* First focusable element on every route, independent of which
              page's own header renders — every page's <main> carries
              id="main-content" for it to target. */}
          <SkipLink />
          <FlowRoutes />
        </BookingProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
