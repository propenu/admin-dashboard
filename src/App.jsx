//frontend/admin-dashboard/src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PublicRoute from "./pages/PublicRoute";
import ProtectedRoute from "./pages/ProtectedRoute";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("./pages/Dashboards/MainDashboard.jsx"));
const FeaturedProperties = lazy(() =>
  import("./pages/FeaturedProperties/FeatureProperties.jsx")
);

//Land
const LandProperties = lazy(() => import("./pages/Land/Land.jsx"));
const LandPropertiesDetails = lazy(() =>
  import("./pages/Land/LandDetails")
);
const LandPropertyVerification = lazy(() =>
  import("./pages/Land/LandPropertyVerification")
);


const PropertyDetails = lazy(() =>
  import("./pages/FeaturedProperties/FeaturedPropertyDetails.js")
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
const Users = lazy(() => import("./pages/users/users/Users.jsx"));
const Locations = lazy(() => import("./pages/Locations/LocationsPage.jsx"))
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./Auth/SignIn"));
const SignUP = lazy(() => import("./Auth/SignUp"));
const Profile = lazy(()=> import("./pages/profile/Profile"))
const AllAgents = lazy(() => import("./pages/users/AllUserInDetails/Agents.jsx"));
const Builders = lazy(() => import("./pages/users/AllUserInDetails/Builders.jsx"));
const SalesAgent = lazy(() => import("./pages/users/AllUserInDetails/SalesAgent.jsx"));
const SalesManagers = lazy(() => import("./pages/users/AllUserInDetails/SalesManagers.jsx"));
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

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
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

                {/* Featured Property */}
                <Route
                  path="/featured-properties"
                  element={<FeaturedProperties />}
                />
                <Route
                  path="/featured-property/:id"
                  element={<PropertyDetails />}
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
                <Route path="/users" element={<Users />} />
                
                <Route path="/locations" element={<Locations />} />

                <Route path="accounts" element={<Accounts />} />
                <Route path="customercare" element={<CustomerCare />} />
                <Route path="all-agents" element={<AllAgents />} />
                <Route path="builders" element={<Builders />} />
                <Route path="sales-agents" element={<SalesAgent />} />
                <Route path="sales-managers" element={<SalesManagers />} />

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
                  path="/update-property/:id"
                  element={<PostPropertyController />}
                />
                {/* Property Progress */}
                <Route
                  path="/property-progress"
                  element={<PropertyProgress />}
                />

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
                <Route path="/paymets-list" element={<PaymentsList />} />
                <Route
                  path="/active-subscriptions"
                  element={<ActiveSubscriptions />}
                />
                <Route
                  path="/subscription-history"
                  element={<SubscriptionHistory />}
                />
                <Route path="/revenue-by-plan" element={<RevenueByPlan />} />
                {/* Team Managers */}
                <Route path="/team-management" element={<TeamManagement />} />
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
