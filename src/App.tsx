import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import { siteConfig } from "./config/siteConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="Personal-Blog">
        <Routes>
          {/* If maintenance mode is enabled, show maintenance page at root */}
          <Route
            path="/"
            element={siteConfig.maintenanceMode ? <Maintenance /> : <Index />}
          />

          {/* If maintenance mode is enabled, redirect all other routes to maintenance page */}
          {siteConfig.maintenanceMode ? (
            <>
              <Route
                path="/blog"
                element={<Navigate to="/maintenance" replace />}
              />
              <Route
                path="/blog/:slug"
                element={<Navigate to="/maintenance" replace />}
              />
              <Route
                path="/projects"
                element={<Navigate to="/maintenance" replace />}
              />
              <Route
                path="/about"
                element={<Navigate to="/maintenance" replace />}
              />
              <Route
                path="/contact"
                element={<Navigate to="/maintenance" replace />}
              />
            </>
          ) : (
            <>
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </>
          )}

          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
