import AboutUs from './pages/AboutUs';
import AdminPortal from './pages/AdminPortal';
import Analytics from './pages/Analytics';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Announcements from './pages/Announcements';
import Calendar from './pages/Calendar';
import CheckInSystem from './pages/CheckInSystem';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Resources from './pages/Resources';
import Reviews from './pages/Reviews';
import Stories from './pages/Stories';
import Volunteers from './pages/Volunteers';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminPortal": AdminPortal,
    "Analytics": Analytics,
    "AnnouncementDetail": AnnouncementDetail,
    "Announcements": Announcements,
    "Calendar": Calendar,
    "CheckInSystem": CheckInSystem,
    "Contact": Contact,
    "Gallery": Gallery,
    "Resources": Resources,
    "Reviews": Reviews,
    "Stories": Stories,
    "Volunteers": Volunteers,
}

export const pagesConfig = {
    mainPage: "Announcements",
    Pages: PAGES,
    Layout: __Layout,
};