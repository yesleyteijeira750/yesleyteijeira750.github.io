/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
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
    "Settings": Settings,
    "Profile": Profile,
    "PrivacyPolicy": PrivacyPolicy,
}

export const pagesConfig = {
    mainPage: "Announcements",
    Pages: PAGES,
    Layout: __Layout,
};