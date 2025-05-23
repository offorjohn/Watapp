import React, { useEffect, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import ContactsList from "./ContactsList";
import { useStateProvider } from "@/context/StateContext";
import Avatar from "../common/Avatar";
import { BsChatDots } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { LuCircleDotDashed } from "react-icons/lu";



export default function ChatList() {
  const [pageType, setPageType] = useState("default");
  
  const [{ userInfo }, dispatch] = useStateProvider();
  const [{ contactsPage }] = useStateProvider();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (contactsPage) {
      setPageType("all-contacts");
    } else {
      setPageType("default");
    }
  }, [contactsPage]);

  const toggleNav = () => {
    setNavOpen((prev) => !prev);
  };

  return (
    <div className="bg-panel-header-background flex flex-col max-h-screen z-20">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-500 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-[-30%]" : "-translate-x-[80%]"
        } w-64 z-30`}
      >
    
      </div>

      {/* Persistent Hamburger Button */}
      <button
        onClick={toggleNav}
        className="fixed top-4 left-2 z-40 p-2 text-xl text-white rounded focus:outline-none"
      >
        ☰
      </button>
<div className="fixed top-16 left-2 z-40 flex flex-col h-[calc(90vh-4rem)] text-white w-64">
  
  <button className="flex items-center space-x-2 p-2 hover:text-emerald-400"
  onClick={() => setPageType("default")}
  >
    
    <BsChatDots size={20}/>
    {navOpen && <span className="whitespace-nowrap">Chats</span>}
  </button>

<button className="flex items-center ml-[-1%] space-x-2 p-2 mt-4 hover:text-emerald-400">
  <LuCircleDotDashed size={24} className="text-blue-500" />
  {navOpen && <span className="whitespace-nowrap">Bots</span>}
</button>


   <div className="mt-80">
    <button className="flex items-center ml-[-2%] space-x-2 p-2 hover:text-emerald-400">
      <CiSettings size={33} />
      {navOpen && <span className="whitespace-nowrap">Settings</span>}
    </button>
  </div>
  <div className="mt-auto">
     <button className="flex items-center ml-[-4%] space-x-2 p-2 hover:text-emerald-400">
     
        <Avatar type="sm" image={userInfo?.profileImage} />
      {navOpen && <span className="whitespace-nowrap">Profile</span>}
       </button>
  </div>
  {/* Spacer to push Settings to bottom */}
 
</div>

      

        

      



      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-panel-header-background">
        <div className="flex items-center p-2 shadow-md bg-panel-header-background"></div>

        {pageType === "default" && (
          <div className="pl-14">
            <ChatListHeader />
            <SearchBar />
            <List />
          </div>
        )}

        {pageType === "all-contacts" && <ContactsList />}
      </div>
    </div>
  );
}
