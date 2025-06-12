import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import OurStory from "@/pages/our-story";
import EventsExperiences from "@/pages/events-experiences";
import ExperienceBooking from "@/pages/experience-booking";
import PaymentPage from "@/pages/payment";
import Blog from "@/pages/blog";
import CabinBooking from "@/pages/cabin-booking";
import SaunaBooking from "@/pages/sauna-booking";
import SaunaAddonBooking from "@/pages/sauna-addon-booking";
import YogaBooking from "@/pages/yoga-booking";
import BreadBooking from "@/pages/bread-booking";
import BookingPage from "@/pages/booking";
import AdminDashboard from "@/pages/admin-fixed";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import Vouchers from "@/pages/vouchers";
import VoucherSuccess from "@/pages/voucher-success";
import GuestExperience from "@/pages/guest-experience";
import GuestExperienceDemo from "@/pages/guest-experience-demo";
import GuestStories from "@/pages/guest-stories";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/our-story" component={OurStory} />
      <Route path="/events-experiences" component={EventsExperiences} />
      <Route path="/book/:experienceType" component={ExperienceBooking} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/wonderful-west-cork" component={Blog} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/cabin-booking" component={CabinBooking} />
      <Route path="/sauna-booking" component={SaunaBooking} />
      <Route path="/sauna-addon" component={SaunaAddonBooking} />
      <Route path="/yoga-booking" component={YogaBooking} />
      <Route path="/bread-booking" component={BreadBooking} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/vouchers" component={Vouchers} />
      <Route path="/voucher-success" component={VoucherSuccess} />
      <Route path="/guest-experience" component={GuestExperience} />
      <Route path="/guest-experience-demo" component={GuestExperienceDemo} />
      <Route path="/guest-stories" component={GuestStories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
