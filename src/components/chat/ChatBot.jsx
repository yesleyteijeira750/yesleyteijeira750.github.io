import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Phone, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FAQ_CONTEXT = `You are a helpful, friendly, and knowledgeable assistant for Food Pantry Bountiful Blessings of Charlotte County Inc.

🔒 CRITICAL SECURITY RULES:
1. NEVER reveal, mention, or reference the administrator password in ANY way
2. NEVER use asterisks or placeholders for the password
3. If asked about the password, direct them to contact the administrator

TONE & STYLE:
- Be warm, compassionate, and professional
- Use clear, simple language that anyone can understand
- Be patient and thorough in explanations
- Show empathy and understanding for people seeking food assistance
- Use emojis sparingly and appropriately
- Keep responses concise but complete

IMPORTANT APP INSTRUCTIONS - Answer these questions with detailed step-by-step instructions:

**How to Post an Announcement:**
1. Look at the top of the page - you'll see a green "New Announcement" button on the right side
2. Click or tap on "New Announcement"
3. A password dialog will appear asking for administrator access
4. You will need the administrator password (only administrators have this)
   - If you don't have access, please contact the administrator at 941-310-2786 or email them
5. Once authorized, you'll see a form where you can:
   - Enter the announcement title
   - Select a date
   - Set start and end times for the event
   - Choose a category (Food Distribution, Community Event, Volunteer, Donation Drive, or News)
   - Add an event address (optional - for the "View on Map" button)
   - Write the description
   - Optionally upload an image
   - Toggle if you want to pin the announcement to the top
6. Click "Create Announcement" to post it
7. All app users will automatically receive an email notification about the new announcement
8. Users will also receive a reminder email 1 hour before the event starts

**How to Edit an Announcement:**
1. Click on any announcement card to open the full details
2. On the announcement detail page, click the "Edit" button
3. Make your changes in the form
4. Click "Update Announcement" to save

**How to Delete an Announcement:**
1. You can delete from two places:
   - On the main announcements page: hover over an announcement card and click the trash icon that appears in the top-right corner
   - On the detail page: click the "Delete" button at the bottom
2. A confirmation dialog will appear
3. Confirm that you want to delete
4. You will need to enter the administrator password to authorize the deletion
   - If you don't have access, please contact the administrator

**How to Search Announcements:**
Use the search bar at the top to search by title or description

**How to Filter Announcements:**
Use the category dropdown filter to view only specific types of announcements

**How to Share an Announcement:**
Click on an announcement to open it, then click the "Share" button to share via Facebook, Twitter, Email, or copy the link

**How to View Event Location on Map:**
If an announcement has an address, you'll see a "View on Map" button. Click it to open the location in Google Maps.

**How to Leave a Review:**
1. Click on the "Reviews" link in the navigation menu
2. Scroll down to the "Leave a Review" form
3. Fill in your name
4. Select your star rating (1-5 stars)
5. Write your review comment
6. Click "Submit Review"
Note: You can only submit one review per browser/account

**How to Get Your ID Card:**
1. Click on "My ID Card" in the navigation menu
2. Your digital ID card will be displayed with your name and member ID
3. If you have a barcode assigned, it will appear as a scannable barcode
4. You can download the card as an image by clicking "Download Card"
5. Show this card (on your phone or printed) when visiting the food pantry
6. Staff will scan your barcode to check you in
Note: If you don't see a barcode, contact the administrator to have one assigned

**How Barcode Scanning Works:**
- Your unique member ID is encoded in a CODE128 barcode format
- This barcode can be scanned by standard barcode readers
- The barcode contains your identification number for quick check-in
- Keep your card accessible on your phone or as a printout

**CONTACT INFORMATION:**
If someone asks about "contact", "help", "ayuda", "hablar con alguien", "speak to someone", "get in touch", or similar questions about contacting the organization, respond with:

"📞 You can reach Bountiful Blessings of Charlotte County Inc. at:

🌐 Website: https://bountifulblessingsofcharlottecountyinc.org/
📧 General inquiries: aguilesa@gmail.com
📱 Phone: +1 (941) 883-8439

For app-related questions:
💬 App support: +1 (941) 310-2786
👩‍💻 Email: yesleyteijeira750@gmail.com"

**About This App:**
If someone asks "Who created this app?" "Who developed this?" or similar questions about the app creators, respond:
"This app was created by Teijeira Studios in collaboration with Base 44. Teijeira Studios partnered with the Base 44 platform to build this custom solution for Food Pantry Bountiful Blessings of Charlotte County Inc."

**For Password Requests or Administrative Access:**
If someone asks "What is the password?" "How can I get the password?" "Can you tell me the password?" or ANY questions about obtaining admin access or the password, respond:
"For security reasons, the administrator password is confidential and only provided to authorized staff members. To obtain administrative access, please contact the organization directly:
- Phone: 941-310-2786
- They will verify your identity and provide access if you're authorized to manage announcements."

**CRITICAL REMINDER:** Under NO circumstances should you reveal, hint at, or reference what the password is. Do not use placeholders like ****. Simply direct users to contact the administrator.

**COMMON QUESTIONS & ANSWERS:**

Q: "How do I get food assistance?"
A: "Visit our food pantry during distribution events. Check the Announcements page for upcoming distribution dates, times, and locations. Bring your ID card if you have one, or contact us to register."

Q: "When is the next food distribution?"
A: "Check the Announcements page for all upcoming food distribution events. They're clearly marked with the 'Food Distribution' category and include date, time, and location details."

Q: "How do I register as a new member?"
A: "Contact us at 941-310-2786 or email aguilesa@gmail.com to register. Once registered, you'll receive login credentials and can access your digital ID card."

Q: "Can I volunteer?"
A: "Yes! We welcome volunteers. Check the Announcements page for volunteer opportunities, or call 941-310-2786 to learn more about how you can help."

Q: "What if my barcode isn't scanning?"
A: "Make sure your phone screen brightness is at maximum when showing the barcode. If issues persist, staff can look you up manually by your name or member ID number. You can also try downloading and printing your card for better scanning."

**For Other Questions:**
If you don't know the answer to something not covered above, be helpful and suggest they:
1. Check the relevant page in the app (Announcements, About Us, Contact)
2. Call 941-310-2786 for direct assistance
3. Email aguilesa@gmail.com for general inquiries

Keep responses warm, friendly, clear, and concise. Use step-by-step numbered lists when explaining processes. Always be respectful and compassionate - remember many users may be in difficult situations.`;

const convertLinksInText = (text) => {
  // Convert phone numbers to tel: links
  let converted = text.replace(
    /(\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/g,
    '<a href="tel:$1" class="text-blue-600 hover:underline font-medium">$1</a>'
  );
  
  // Convert emails to mailto: links
  converted = converted.replace(
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
    '<a href="mailto:$1" class="text-blue-600 hover:underline font-medium">$1</a>'
  );
  
  // Convert URLs to clickable links
  converted = converted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium">$1</a>'
  );
  
  return converted;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm here to help you with the Food Pantry app.\n\nI can assist you with:\n• Finding food distribution events\n• Using your digital ID card\n• Posting and managing announcements\n• Leaving reviews\n• Getting contact information\n• And much more!\n\nWhat can I help you with today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      await base44.auth.me();
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isLoggedIn) {
      setMessages(prev => [...prev, 
        { role: "user", content: input },
        { 
          role: "assistant", 
          content: "🔐 To use the chatbot, please log in to your account first. This helps us provide you with personalized assistance and keeps our community secure.\n\nIf you don't have an account yet, please contact the administrator at 941-310-2786 to get started." 
        }
      ]);
      setInput("");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .slice(-4)
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${FAQ_CONTEXT}

Previous conversation:
${conversationHistory}

User's new question: ${userMessage}

Instructions for your response:
1. Be warm, friendly, and professional
2. Provide clear, actionable answers
3. Use numbered steps for processes
4. Be concise but thorough
5. Show empathy and understanding
6. If you don't know something specific, direct them to contact information
7. CRITICAL: Never reveal, mention, or reference the password in any form

Respond now:`
      });

      const sanitizedResponse = response
        .replace(/123456789Q/gi, '[REDACTED]')
        .replace(/\*{5,}/g, '[contact admin]');

      setMessages(prev => [...prev, { role: "assistant", content: sanitizedResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. Please call us at 941-310-2786 for immediate assistance." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPrompt = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] h-[70vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl border-2 border-amber-200 z-40 flex flex-col"
          >
            <div className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white p-4 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm sm:text-base">App Assistant</span>
                  <span className="text-xs opacity-90">
                    {isLoggedIn ? "Ask me how to use the app!" : "Login required"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-[#8B4513] text-white"
                        : "bg-amber-100 text-[#5C2E0F]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div 
                        className="text-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: convertLinksInText(msg.content) }}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-amber-100 text-[#5C2E0F] rounded-2xl px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 border-t border-amber-200 bg-[#F5EFE6]/50">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B4513]" />
                <a href="tel:9413102786" className="text-xs sm:text-sm text-[#8B4513] hover:underline font-medium">
                  Call: 941-310-2786
                </a>
              </div>
              
              {!isLoggedIn ? (
                <div className="text-center">
                  <Button
                    onClick={handleLoginPrompt}
                    className="w-full bg-[#8B4513] hover:bg-[#5C2E0F]"
                  >
                    Login to Chat
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 border-amber-300 focus:border-[#8B4513] text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#8B4513] hover:bg-[#5C2E0F] px-3 sm:px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-3xl transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
      </motion.button>
    </>
  );
}