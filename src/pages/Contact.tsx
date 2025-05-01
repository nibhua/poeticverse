
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you shortly.",
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gradient-subtle">Get in Touch</h1>
        <p className="mt-4 text-gray-600">We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <motion.div 
          className="md:col-span-2 space-y-6"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" />
              Email Us
            </h2>
            <p className="text-gray-600">contact@poeticverse.com</p>
            <p className="text-gray-600">support@poeticverse.com</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="mr-2 h-5 w-5 text-primary" />
              Call Us
            </h2>
            <p className="text-gray-600">+1 (555) 123-4567</p>
            <p className="text-gray-600">Mon-Fri, 9AM-5PM EST</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Visit Us
            </h2>
            <p className="text-gray-600">123 Poetry Lane</p>
            <p className="text-gray-600">New York, NY 10001</p>
            <p className="text-gray-600">United States</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Follow Us
            </h2>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.89 7.5h-1.95c-.67 0-1.04.35-1.2.65-.16.3-.13.59-.13.59v1.59h3.18s-.24 2.16-.38 2.29H13.6v6.11h-3.18v-6.11H8.02v-2.29h2.4v-2.15c0-2.5 1.5-3.9 3.7-3.9 1.54 0 2.7.59 2.7.59v2.62z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"></path>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="md:col-span-3"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center mb-6">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-2xl font-semibold">Send us a message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help you?"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Your Message</label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="btn-gradient w-full rounded-full py-6 h-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-12 glass-card p-6 rounded-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Feedback & Suggestions</h2>
          <p>
            Have ideas on how we can improve Poeticverse? We're always looking to make our platform better!
            Email your suggestions to <a href="mailto:feedback@poeticverse.com" className="text-primary hover:underline">feedback@poeticverse.com</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
