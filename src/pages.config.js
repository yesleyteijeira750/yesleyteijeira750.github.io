import AboutUs from './pages/AboutUs';
import AdminPortal from './pages/AdminPortal';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import MyCard from './pages/MyCard';
import Reviews from './pages/Reviews';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminPortal": AdminPortal,
    "AnnouncementDetail": AnnouncementDetail,
    "Announcements": Announcements,
    "Contact": Contact,
    "MyCard": MyCard,
    "Reviews": Reviews,
}

export const pagesConfig = {
    mainPage: "Announcements",
    Pages: PAGES,
    Layout: __Layout,
};