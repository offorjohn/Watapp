import React, { useEffect, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import ContactsList from "./ContactsList";
import { useStateProvider } from "@/context/StateContext";
import Avatar from "../common/Avatar";
import { useRouter } from "next/router"; // ✅ Correct for Next.js Pages Router


import { FaRegCircle } from "react-icons/fa";
import { BsChatLeftText, BsChatText } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { IoIosPeople } from "react-icons/io";
import { TbChartDonut3 } from "react-icons/tb";

export default function ChatList() {
  const [pageType, setPageType] = useState("default");
  const [navOpen, setNavOpen] = useState(false);

  const [{ userInfo, contactsPage, totalUnreadMessages }] = useStateProvider();

  const router = useRouter(); // ✅ Must be declared inside the component


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
    <div className="flex h-screen bg-[#202c33] relative">
      {/* Sidebar */}
      <div
        className={`flex flex-col justify-between items-center transition-all duration-300 bg-[#202c33] h-full ${
          navOpen ? "w-64" : "w-16"
        } fixed z-30`}
      >
        {/* Top Navigation */}
        <div className="mt-4 flex flex-col items-center space-y-4 w-full">
     <button
            onClick={() => setPageType("default")}
  className="text-white p-2"
>
  <BsChatLeftText size={26} />
     {navOpen && <span>Contacts</span>}
</button>

          <button className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400">
            <TbChartDonut3 size={28} className="text-gray-300"/>
            {navOpen && <span>Chats</span>}
          </button>

          <button className="flex items-center w-full space-x-3 px-5 py-2 text-white hover:text-emerald-400">
            <BsChatText size={23} className="text-gray-300"/>
            {navOpen && <span>Bots</span>}
          </button>

          <button
            className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400"
          >
            <IoIosPeople size={29} className="text-gray-300"/>
       
          </button>

          <hr className="border-t border-gray-500 my-2 w-11" />

          <button className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400">
            <FaRegCircle size={24} className="text-indigo-500" />
            {navOpen && <span>Status</span>}
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col items-center space-y-3 mb-6 w-full">
          <hr className="border-t border-gray-500 w-11" />

      <button
  onClick={() => router.push("/settings")}  // <-- navigate to settings
  className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400"
>
  <CiSettings size={30} />
  {navOpen && <span>Settings</span>}
</button>


          <button className="flex items-center space-x-2 p-2 hover:text-emerald-400 -ml-2">
          <Avatar type="sm" image={userInfo?.profileImage} />
          {navOpen && <span className="whitespace-nowrap">Profile</span>}
        </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`bg-panel-header-background flex flex-col z-20 transition-all duration-300 ml-16 ${
          navOpen ? "ml-64" : "ml-16"
        } w-full`}
      >
       {pageType === "default" && (
  <>
    <ChatListHeader />
    <SearchBar />

<div className="flex space-x-2 px-4 py-2 mt-[-2%]" style={{ backgroundColor: '#141E24' }}>


<button className="px-4 py-1 text-sm font-semibold text-white rounded-full border border-emerald-400 bg-white/10  transition duration-200">

    All
  </button>
  <button className="px-4 py-1 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-emerald-400 hover:bg-white/10 transition duration-200">
    Unread
  </button>
  <button className="px-4 py-1 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-emerald-400 hover:bg-white/10 transition duration-200">
    Favourites
  </button>
  <button className="px-4 py-1 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-emerald-400 hover:bg-white/10 transition duration-200">
    Group
  </button>
</div>



    <List />
  </>
)}

      
        {pageType === "all-contacts" && <ContactsList />}
      </div>
    </div>
  );
}
