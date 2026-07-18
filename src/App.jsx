//frontend/admin-dashboard/src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PublicRoute from "./pages/PublicRoute";
import ProtectedRoute from "./pages/ProtectedRoute";
import PermissionRoute from "./pages/PermissionRoute";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("./pages/Dashboards/MainDashboard.jsx"));


const PrimeProjectsPage = lazy(() => import("./pages/features/property/pages/PrimeProjects/PrimeProjectsPage"));

const FeaturedProjectsPage = lazy(() => import("./pages/features/property/pages/FeaturedProjects/FeaturedProjectsPage"));

const NormalProjectsPage = lazy(() => import("./pages/features/property/pages/NormalProjects/NormalProjectsPage"));

const SponsoredProjectsPage = lazy(() => import("./pages/features/property/pages/SponsoredProjects/SponsoredProjectsPage"));


const ProjectsDashboardPage = lazy(() =>
  import("./pages/features/property/components/shared/ProjectsDashboardPage")
);

const PropertiesDashboard = lazy(() =>
  import("./pages/Properties/PropertiesDashboard")
);

const FeaturedProperties = lazy(() =>
  import("./pages/FeaturedProperties/FeatureProperties")
);

//Land
const LandProperties = lazy(() => import("./pages/Land/Land.jsx"));
const LandPropertiesDetails = lazy(() =>
  import("./pages/Land/LandDetails")
);
const LandPropertyVerification = lazy(() =>
  import("./pages/Land/LandPropertyVerification")
);

const ProjectInDetilas = lazy(
  () => import("./pages/features/property/components/shared/IndetialsPage")
);

const PropertyInDetilas = lazy(
  () => import("./pages/UpsertProperties/components/UpsertIndetailsProject/PropertyIndetails")
);

const HighlightedProject = lazy(() =>
  import("./pages/HighlightProjects/HighlightProjectDetails")
);

const CreateFeaturedProject = lazy(() =>
  import("./pages/UpsertFeaturedProjects/CreateFeaturedProjects/CreateFeaturedWizard.jsx")
);

const PostProperty = lazy(() =>
  import("./pages/UpsertFeaturedProjects/EditFeaturedProjects/FeaturedPreviewPage.jsx")
);

const HighlightProjects = lazy(() =>
  import("./pages/HighlightProjects/HighlightProjects")
);

const HighlightProjectDetails = lazy(() =>
  import("./pages/HighlightProjects/HighlightProjectDetails")
);

// Users
const Partners = lazy(() => import("./pages/users/users/Users.jsx"));
const PropenuTeamMembers = lazy(() => import("./pages/users/propenuTeam/PropenuTeam.jsx"));
const Locations = lazy(() => import("./pages/Locations/LocationsPage.jsx"))
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./Auth/SignIn"));
const SignUP = lazy(() => import("./Auth/SignUp"));
const Profile = lazy(()=> import("./pages/profile/Profile"))
const AllAgents = lazy(() => import("./pages/users/AllUserInDetails/Agents.jsx"));
const Builders = lazy(() => import("./pages/users/AllUserInDetails/Builders.jsx"));
const Owners = lazy(() => import("./pages/users/AllUserInDetails/PropenuUser.jsx"));
const SalesAgent = lazy(() => import("./pages/users/AllUserInDetails/SalesAgent.jsx"));
const SalesManagers = lazy(() => import("./pages/users/AllUserInDetails/SalesManagers.jsx"));
const DigitalMarketing = lazy(() => import("./pages/users/AllUserInDetails/DigitalMarketing.jsx"));
const RelationshipManagers = lazy(() => import("./pages/users/AllUserInDetails/RelationshipManagers.jsx"));
const RegionalManagers = lazy(() => import("./pages/users/AllUserInDetails/RegionalManagers.jsx"));
const Accounts = lazy(() => import("./pages/users/AllUserInDetails/Accounts.jsx"));
const CustomerCare = lazy(() => import("./pages/users/AllUserInDetails/CustomerCare.jsx"));

// Agricultural
const Agricultural = lazy(() => import("./pages/Agricultural/Agricultural"));
const AgriculturalDetails = lazy(() =>
  import("./pages/Agricultural/AgriculturalDetails")
);

const AgriculturalPropertyVerification = lazy(() =>
  import("./pages/Agricultural/AgricuturalPropertyVerification")
);

// Commercial
const Commercial = lazy(() => import("./pages/Commercial/Commercial"));

const CommercialDetails = lazy(() =>
  import("./pages/Commercial/CommercialDetails")
);

const CommercialPropertyVerification = lazy(() =>
  import("./pages/Commercial/CommercialPropertyVerification")
);

const Residential = lazy(() =>
  import("./pages/Residential/Residential"));

const ResidentialDetails = lazy(() =>
  import("./pages/Residential/ResidentialDetails")
);

const ResidentialEdit = lazy(() =>
  import("./pages/Residential/ResidentialEdit/EditWizard.jsx")
);

const ResidentialPropertyVerification = lazy(() =>
  import("./pages/Residential/ResidentaialPropertyVerification")
);

const PropertyProgress = lazy(() =>
  import("./pages/PropertyProgress/PropertyProgress")
);

const AccountsSummary = lazy(() =>
  import("./pages/Accounts/AccountsSummary")
);
const PaymentsList = lazy(() =>
  import("./pages/Accounts/PaymentsList")
);

const ActiveSubscriptions = lazy(() =>
  import("./pages/Accounts/ActiveSubcriptions")
);

const SubscriptionHistory = lazy(() =>
  import("./pages/Accounts/SubscriptionHistory")
);

const RevenueByPlan = lazy(() =>
  import("./pages/Accounts/RevenueByPlan")
);

const BuilderPlans = lazy(() =>
  import("./pages/Accounts/BuilderPlans")
);

const TeamManagement = lazy(() =>
  import("./pages/users/AllUserInDetails/TeamManager.jsx")
);

import PostPropertyController from "./pages/Residential/PostResidentailProperty/PostPropertyControler";

const Payments = lazy(() => import("./pages/Payments/SubcriptionPayments/PricingSection.jsx"));

const SendPushNotification = lazy(() =>
  import("./pages/Pushnotipication/SendPushNotification.jsx")
);

const EmailNotifications = lazy(() =>
  import("./pages/EmailNotifications/EmailNotifications.jsx")
);

const WhatsAppNotifications = lazy(() =>
  import("./pages/WhatsAppNotifications/WhatsAppNotifications.jsx")
);

const AutomationsCompainings = lazy(() =>
  import("./pages/automations/Automations.jsx")
);




const UserDetailPage = lazy(() =>
  import("./pages/UserInformationCenter/UserDetailPage")
);


const WorkflowDashboard = lazy(() =>
  import("./pages/admin/WorkflowDashboard")
);

const RoleWorkflowPage = lazy(() =>
  import("./pages/admin/RoleWorkflowPage")
);

const TeamManagementPageTwo = lazy(() =>
  import("./pages/admin/TeamManagement")
);

const RoleUsersPage = lazy(() =>
  import("./pages/users/AllUserInDetails/RoleUsersPage")
);


const Blogs = lazy(() =>
  import("./pages/blogs/Blogs")
);

const TicketDashboard = lazy(() =>
  import("./pages/Tickets/TicketDashboard")
);
const LeadManagement = lazy(() => import("./pages/Leads/LeadManagement"));

const CreateRolePage = lazy(() =>
  import("./pages/accessControl/CreateRolePage")
);

const CreateCredentialPage = lazy(() =>
  import("./pages/accessControl/CreateCredentialPage")
);
const UserPermissionsPage = lazy(() =>
  import("./pages/accessControl/UserPermissionsPage")
);
const OperationsDashboard = lazy(() =>
  import("./pages/Dashboards/OperationsDashboard")
);



function App() {
  return (
    <Router>
      {/* <Toaster position="top-right" richColors /> */}
      <Toaster
        position="top-right"
        richColors
        expand={true}
        visibleToasts={10}
      />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* PUBLIC */}
            <Route element={<PublicRoute />}>
              <Route path="/signin" element={<SignIn />} />
            </Route>

            {/* PROTECTED */}
            <Route element={<ProtectedRoute />}>
              <Route path="/signup" element={<SignUP />} />
              <Route element={<Layout />}>
                {/* Admin Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/operations/reports" element={<PermissionRoute permission="dashboard:view_reports"><OperationsDashboard reportMode /></PermissionRoute>} />

                {/* Projects */}

                <Route path="/prime" element={<PrimeProjectsPage />} />
                <Route path="/featured" element={<FeaturedProjectsPage />} />
                <Route path="/sponsored" element={<SponsoredProjectsPage />} />
                <Route path="/normal" element={<NormalProjectsPage />} />

                <Route path="/projects" element={<PermissionRoute permission="project:view"><ProjectsDashboardPage /></PermissionRoute>} />
                <Route path="/properties" element={<PermissionRoute anyPermissions={["residential:view", "commercial:view", "land:view", "agricultural:view"]}><PropertiesDashboard /></PermissionRoute>} />

                {/* Featured Property */}
                <Route
                  path="/featured-properties"
                  element={<FeaturedProperties />}
                />
                <Route
                  path="/featured-project/:id"
                  element={<ProjectInDetilas />}
                />
                <Route
                  path="/property/:category/:id"
                  element={<PropertyInDetilas />}
                />

                <Route
                  path="highlight-property/:id"
                  element={<HighlightedProject />}
                />

                {/* Open Plots */}
                <Route path="/land" element={<LandProperties />} />
                <Route
                  path="/land-property-details/:id"
                  element={<LandPropertiesDetails />}
                />
                <Route
                  path="/land-property-verification/:id"
                  element={<LandPropertyVerification />}
                />

                <Route path="/post-property/:id" element={<PostProperty />} />
                <Route
                  path="/create-featured-project"
                  element={<CreateFeaturedProject />}
                />

                {/* Highlighted Properties */}
                <Route
                  path="/highlight-projects"
                  element={<HighlightProjects />}
                />
                <Route
                  path="/highlighted-project-details/:id"
                  element={<HighlightProjectDetails />}
                />

                {/* Users */}
                <Route path="/users" element={<Partners />} />
                <Route path="/propenu-team-members" element={<PermissionRoute anyPermissions={["team:view", "user:view"]}><PropenuTeamMembers /></PermissionRoute>} />

                <Route path="/locations" element={<Locations />} />

                <Route path="accounts" element={<PermissionRoute permission="user:view"><Accounts /></PermissionRoute>} />
                <Route path="customercare" element={<PermissionRoute permission="user:view"><CustomerCare /></PermissionRoute>} />
                <Route path="all-agents" element={<PermissionRoute permission="agent:view"><AllAgents /></PermissionRoute>} />
                <Route path="builders" element={<PermissionRoute permission="builder:view"><Builders /></PermissionRoute>} />
                <Route path="owners" element={<Owners role="user" />} />
                <Route path="sales-agents" element={<PermissionRoute permission="user:view"><SalesAgent /></PermissionRoute>} />
                <Route path="sales-managers" element={<PermissionRoute permission="user:view"><SalesManagers /></PermissionRoute>} />
                <Route path="digital-marketing" element={<PermissionRoute permission="user:view"><DigitalMarketing /></PermissionRoute>} />
                <Route path="relationship-managers" element={<PermissionRoute permission="user:view"><RelationshipManagers /></PermissionRoute>} />
                <Route path="regional-managers" element={<PermissionRoute permission="user:view"><RegionalManagers /></PermissionRoute>} />

                {/* Agricultural */}
                <Route path="/agricultural" element={<Agricultural />} />
                <Route
                  path="/agricultural/:id"
                  element={<AgriculturalDetails />}
                />
                <Route
                  path="/agricultural-property-verification/:id"
                  element={<AgriculturalPropertyVerification />}
                />
                {/* Commercial */}
                <Route path="/commercial" element={<Commercial />} />
                <Route path="/commercial/:id" element={<CommercialDetails />} />

                <Route
                  path="/commercial-property-verification/:id"
                  element={<CommercialPropertyVerification />}
                />
                {/* Residential */}
                <Route path="/residential" element={<Residential />} />
                <Route
                  path="/residential/:id"
                  element={<ResidentialDetails />}
                />
                <Route
                  path="/edit-property/:id"
                  element={<ResidentialEdit />}
                />
                <Route
                  path="/residential-property-verification/:id"
                  element={<ResidentialPropertyVerification />}
                />

                <Route
                  path="/post-property"
                  element={<PostPropertyController />}
                />

                <Route
                  path="/agent-project"
                  element={<PostPropertyController agentProject />}
                />

                <Route
                  path="/update-property/:id"
                  element={<PostPropertyController />}
                />
                {/* Property Progress */}
                <Route path="/property-progress" element={<PermissionRoute anyPermissions={["project:view", "residential:view", "commercial:view", "land:view", "agricultural:view"]}><PropertyProgress /></PermissionRoute>} />

                {/* Push Notification */}
                <Route
                  path="/push-notifications"
                  element={<SendPushNotification />}
                />

                {/* Email Notification */}
                <Route
                  path="/email-notifications"
                  element={<EmailNotifications />}
                />

                {/* WhatsApp Notification */}
                <Route
                  path="/whatsapp-notifications"
                  element={<WhatsAppNotifications />}
                />

                {/* Automations */}
                <Route
                  path="/automations"
                  element={<AutomationsCompainings />}
                />

                <Route
                  path="/agent-payments"
                  element={<Payments userType="agent" />}
                />

                <Route
                  path="/owner-rent-property"
                  element={<Payments userType="owner" category="rent" />}
                />

                <Route
                  path="/owner-sell-property"
                  element={<Payments userType="owner" category="sell" />}
                />

                <Route
                  path="/owner-rent-view"
                  element={<Payments userType="owner" category="rent_view" />}
                />

                <Route
                  path="/owner-buy-view"
                  element={<Payments userType="owner" category="buy" />}
                />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Accounts */}
                <Route path="/accounts-summary" element={<AccountsSummary />} />
                <Route path="/payments-list" element={<PaymentsList />} />
                <Route
                  path="/active-subscriptions"
                  element={<ActiveSubscriptions />}
                />
                <Route
                  path="/subscription-history"
                  element={<SubscriptionHistory />}
                />
                <Route path="/revenue-by-plan" element={<RevenueByPlan />} />
                <Route path="/builder-plans" element={<BuilderPlans />} />

                {/* User detail — navigated to on row click */}
                <Route
                  path="/dashboard/users/:userId"
                  element={<UserDetailPage />}
                />

                {/* Role work flow*/}
                <Route
                  path="/dashboard/workflow"
                  element={<WorkflowDashboard />}
                />

                {/* Team Leads */}
                <Route
                  path="/dashboard/workflow/:role"
                  element={<RoleWorkflowPage />}
                />

                {/* Team Members */}
                <Route path="/dashboard/team-management" element={<PermissionRoute permission="team:view"><TeamManagementPageTwo /></PermissionRoute>} />

                <Route
                  path="/dashboard/users/role/:role"
                  element={<RoleUsersPage />}
                />

                {/* Team Managers */}
                <Route path="/team-management" element={<TeamManagement />} />

                {/* Blogs */}
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/tickets" element={<TicketDashboard />} />
                <Route path="/leads" element={<PermissionRoute permission="lead:view"><LeadManagement /></PermissionRoute>} />
                <Route path="/access-control/roles/:roleId/permissions" element={<PermissionRoute permission="role:view"><CreateRolePage /></PermissionRoute>} />
                <Route path="/access-control/roles/new" element={<PermissionRoute permission="role:create"><CreateRolePage /></PermissionRoute>} />
                <Route path="/access-control/credentials/new" element={<PermissionRoute permission="user:create"><CreateCredentialPage /></PermissionRoute>} />
                <Route path="/access-control/users" element={<PermissionRoute permission="role:view"><UserPermissionsPage /></PermissionRoute>} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;

