import DashboardLayout from "@/pages/Dashboard/Layout/DashboardLayout.vue";
import AuthLayout from "@/pages/Dashboard/Pages/AuthLayout.vue";
import AuthService from "@/services/auth";

// Dashboard pages
import Dashboard from "@/pages/Dashboard/Dashboard.vue";

// Clients pages
import Clients from "@/pages/Dashboard/Clients.vue";
import Parts from "@/pages/Dashboard/Parts.vue";
import Services from "@/pages/Dashboard/ServiceOrders.vue";
import Vehicles from "@/pages/Dashboard/Vehicles.vue";
import QuotationList from "@/pages/Quotations/List.vue";
import QuotationCreate from "@/pages/Quotations/Create.vue";
import QuotationEdit from "@/pages/Quotations/Edit.vue";
import ServiceOrders from "@/pages/Dashboard/ServiceOrders.vue"

// Pages
import User from "@/pages/Dashboard/Pages/UserProfile.vue";
import TimeLine from "@/pages/Dashboard/Pages/TimeLinePage.vue";
import RtlSupport from "@/pages/Dashboard/Pages/RtlSupport.vue";
import Login from "@/pages/Dashboard/Pages/Login.vue";
import Register from "@/pages/Dashboard/Pages/Register.vue";

// Components pages
import Buttons from "@/pages/Dashboard/Components/Buttons.vue";
import GridSystem from "@/pages/Dashboard/Components/GridSystem.vue";
import Panels from "@/pages/Dashboard/Components/Panels.vue";
import SweetAlert from "@/pages/Dashboard/Components/SweetAlert.vue";
import Notifications from "@/pages/Dashboard/Components/Notifications.vue";
import Icons from "@/pages/Dashboard/Components/Icons.vue";
import Typography from "@/pages/Dashboard/Components/Typography.vue";

// Forms pages
import RegularForms from "@/pages/Dashboard/Forms/RegularForms.vue";
import ExtendedForms from "@/pages/Dashboard/Forms/ExtendedForms.vue";
import ValidationForms from "@/pages/Dashboard/Forms/ValidationForms.vue";
import Wizard from "@/pages/Dashboard/Forms/Wizard.vue";

// TableList pages
import RegularTables from "@/pages/Dashboard/Tables/RegularTables.vue";
import ExtendedTables from "@/pages/Dashboard/Tables/ExtendedTables.vue";
// import PaginatedTables from "@/pages/Dashboard/Tables/PaginatedTables.vue";

// Maps pages
import GoogleMaps from "@/pages/Dashboard/Maps/GoogleMaps.vue";
import FullScreenMap from "@/pages/Dashboard/Maps/FullScreenMap.vue";
import VectorMaps from "@/pages/Dashboard/Maps/VectorMaps.vue";

// Calendar
import Calendar from "@/pages/Dashboard/Calendar.vue";
// Charts
import Charts from "@/pages/Dashboard/Charts.vue";
import Widgets from "@/pages/Dashboard/Widgets.vue";
import RepairServices from "@/services/repair-services";

let componentsMenu = {
  path: "/components",
  component: DashboardLayout,
  redirect: "/components/buttons",
  name: "Components",
  meta: { requiresAuth: true },
  children: [
    {
      path: "buttons",
      name: "Buttons",
      components: { default: Buttons },
      meta: { requiresAuth: true },
    },
    {
      path: "grid-system",
      name: "Grid System",
      components: { default: GridSystem },
      meta: { requiresAuth: true },
    },
    {
      path: "panels",
      name: "Panels",
      components: { default: Panels },
      meta: { requiresAuth: true },
    },
    {
      path: "sweet-alert",
      name: "Sweet Alert",
      components: { default: SweetAlert },
      meta: { requiresAuth: true },
    },
    {
      path: "notifications",
      name: "Notifications",
      components: { default: Notifications },
      meta: { requiresAuth: true },
    },
    {
      path: "icons",
      name: "Icons",
      components: { default: Icons },
      meta: { requiresAuth: true },
    },
    {
      path: "typography",
      name: "Typography",
      components: { default: Typography },
      meta: { requiresAuth: true },
    },
  ],
};
let formsMenu = {
  path: "/forms",
  component: DashboardLayout,
  redirect: "/forms/regular",
  name: "Forms",
  meta: { requiresAuth: true },
  children: [
    {
      path: "regular",
      name: "Regular Forms",
      components: { default: RegularForms },
      meta: { requiresAuth: true },
    },
    {
      path: "extended",
      name: "Extended Forms",
      components: { default: ExtendedForms },
      meta: { requiresAuth: true },
    },
    {
      path: "validation",
      name: "Validation Forms",
      components: { default: ValidationForms },
      meta: { requiresAuth: true },
    },
    {
      path: "wizard",
      name: "Wizard",
      components: { default: Wizard },
      meta: { requiresAuth: true },
    },
  ],
};

let tablesMenu = {
  path: "/table-list",
  component: DashboardLayout,
  redirect: "/table-list/regular",
  name: "Tables",
  meta: { requiresAuth: true },
  children: [
    {
      path: "regular",
      name: "Regular Tables",
      components: { default: RegularTables },
      meta: { requiresAuth: true },
    },
    {
      path: "extended",
      name: "Extended Tables",
      components: { default: ExtendedTables },
      meta: { requiresAuth: true },
    },
    // {
    //   path: "paginated",
    //   name: "Pagianted Tables",
    //   components: { default: PaginatedTables },
    //   meta: { requiresAuth: true },
    // },
  ],
};

let mapsMenu = {
  path: "/maps",
  component: DashboardLayout,
  name: "Maps",
  redirect: "/maps/google",
  meta: { requiresAuth: true },
  children: [
    {
      path: "google",
      name: "Google Maps",
      components: { default: GoogleMaps },
      meta: { requiresAuth: true },
    },
    {
      path: "full-screen",
      name: "Full Screen Map",
      meta: {
        hideContent: true,
        hideFooter: true,
        navbarAbsolute: true,
        requiresAuth: true,
      },
      components: { default: FullScreenMap },
    },
    {
      path: "vector-map",
      name: "Vector Map",
      components: { default: VectorMaps },
      meta: { requiresAuth: true },
    },
  ],
};

let pagesMenu = {
  path: "/pages",
  component: DashboardLayout,
  name: "Pages",
  redirect: "/pages/user",
  meta: { requiresAuth: true },
  children: [
    {
      path: "timeline",
      name: "Timeline Page",
      components: { default: TimeLine },
      meta: { requiresAuth: true },
    },
    {
      path: "rtl",
      name: "وحة القيادة",
      meta: {
        rtlActive: true,
        requiresAuth: true,
      },
      components: { default: RtlSupport },
    },
  ],
};

let authPages = {
  path: "/",
  component: AuthLayout,
  name: "Authentication",
  children: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { name: "Login", },
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
      meta: { name: "Cadastro", },
    },
  ],
};

let profile = {
  path: "/",
  component: DashboardLayout,
  name: "Perfil1",
  redirect: "/profile",
  meta: { requiresAuth: true },
  children: [
     {
      path: "profile",
      name: "Perfil",
      components: { default: User },
      meta: { requiresAuth: true },
    },
  ],
};

   

const routes = [
  {
    path: "/",
    redirect: (to) => {
      // Se não estiver autenticado, redirecionar para login
      if (!AuthService.isAuthenticated()) {
        return "/login";
      }
      // Se estiver autenticado, redirecionar para dashboard
      return "/dashboard";
    },
    name: "Home",
  },
  componentsMenu,
  formsMenu,
  tablesMenu,
  mapsMenu,
  pagesMenu,
  authPages,
  profile,
  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        components: { default: Dashboard },
        meta: { requiresAuth: true },
      },
        {
            path: "clients",
            name: "Clientes",
            components: { default: Clients },
            meta: { requiresAuth: true },
        },
        {
            path: "parts",
            name: "Peças",
            components: { default: Parts },
            meta: { requiresAuth: true },
        },
        {
            path: "services",
            name: "Serviços",
            components: { default: Services },
            meta: { requiresAuth: true },
        },
      {
        path: "vehicles",
        name: "Veículos",
        components: { default: Vehicles },
        meta: { requiresAuth: true },
      },
      {
        path: "quotations",
        name: "Orçamentos",
        components: { default: QuotationList },
        meta: { requiresAuth: true },
      },

        {
            path: "quotations/new",
            name: "QuotationCreate",
            meta: { title: "Novo Orçamento" },
            component: QuotationCreate,
        },
        {
            path: "/quotations/:id/edit",
            name: "QuotationEdit",
            component: QuotationEdit,
            props: true,
        },
      {
        path: "service-orders",
        name: "Ordens de Serviço",
        components: ServiceOrders,
        meta: { requiresAuth: true },
      },
      {
        path: "calendar",
        name: "Agenda",
        components: Calendar,
        meta: { requiresAuth: true },
      },
      {
        path: "charts",
        name: "Charts",
        components: { default: Charts },
        meta: { requiresAuth: true },
      },
      {
        path: "widgets",
        name: "Widgets",
        components: Widgets,
        meta: { requiresAuth: true },
      },
    ],
  },
];

export default routes;