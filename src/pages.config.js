import AboutUs from './pages/AboutUs';
import AdminPortal from './pages/AdminPortal';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import MyCard from './pages/MyCard';
import Reviews from './pages/Reviews';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import Volunteers from './pages/Volunteers';
import Resources from './pages/Resources';
import Gallery from './pages/Gallery';
import Stories from './pages/Stories';
import CheckInSystem from './pages/CheckInSystem';
import Analytics from './pages/Analytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminPortal": AdminPortal,
    "AnnouncementDetail": AnnouncementDetail,
    "Announcements": Announcements,
    "Contact": Contact,
    "MyCard": MyCard,
    "Reviews": Reviews,
    "Calendar": Calendar,
    "Dashboard": Dashboard,
    "Volunteers": Volunteers,
    "Resources": Resources,
    "Gallery": Gallery,
    "Stories": Stories,
    "CheckInSystem": CheckInSystem,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "Announcements",
    Pages: PAGES,
    Layout: __Layout,
};