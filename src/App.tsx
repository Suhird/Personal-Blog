import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import TechBlog from "./pages/TechBlog";
import BeyondCode from "./pages/BeyondCode";
import BlogPost from "./pages/BlogPost";
import LegacyPostRedirect from "./pages/LegacyPostRedirect";
import Series from "./pages/Series";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import { ThemeModeProvider } from "@/components/theme-mode-provider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeModeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tech-blog" element={<TechBlog />} />
                <Route path="/tech-blog/:slug" element={<BlogPost />} />
                <Route path="/beyond-code" element={<BeyondCode />} />
                <Route path="/beyond-code/:slug" element={<BlogPost />} />
                <Route path="/blog" element={<Navigate to="/tech-blog" replace />} />
                <Route path="/blog/:slug" element={<LegacyPostRedirect />} />
                <Route path="/series" element={<Series />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeModeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
