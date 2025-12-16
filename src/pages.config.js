import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Reviews from './pages/Reviews';
import AdminPortal from './pages/AdminPortal';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import MyCard from './pages/MyCard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Announcements": Announcements,
    "AnnouncementDetail": AnnouncementDetail,
    "Reviews": Reviews,
    "AdminPortal": AdminPortal,
    "AboutUs": AboutUs,
    "Contact": Contact,
    "MyCard": MyCard,
}

export const pagesConfig = {
    mainPage: "Announcements",
    Pages: PAGES,
    Layout: __Layout,
};