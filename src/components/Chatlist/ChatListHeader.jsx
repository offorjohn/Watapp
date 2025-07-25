import React, { useState } from "react";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";
import axios from "axios";
import { toast } from "react-toastify";
import { faker } from "@faker-js/faker";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";

import "react-toastify/dist/ReactToastify.css";

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();

  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [botCount, setBotCount] = useState(8);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");
  const [previewNumbers, setPreviewNumbers] = useState([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const refetchContacts = async () => {
  try {
    const {
      data: { users, onlineUsers },
    } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
    dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
    dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
  } catch (err) {
    console.error("❌ Failed to refresh contacts:", err);
  }
};



const handleBroadcastToAll = async () => {
  if (sending) return;

  if (!broadcastMessage.trim()) {
    toast.error("Please enter a message to broadcast.");
    return;
  }

  try {
    setSending(true);

    // Get the user ID and bot count from localStorage
    const userId = parseInt(localStorage.getItem("userId"));
    const latestBotCount = parseInt(localStorage.getItem("botCount") || "1", 10);

    // Retrieve the imported number count from localStorage
    const numberCount = parseInt(localStorage.getItem('importedNumberCount') || '0', 10);

    // Dynamically adjust polling settings based on the imported number count
    let pollCount = 0;
    let pollInterval = 5000;  // Default: 5 seconds between polling
    let maxPollCount = 30;    // Default max polling attempts

    // Adjust polling based on the number of imported contacts (numberCount)
   if (numberCount > 1000) {
  pollInterval = 4800;  // 4.8 seconds for each poll
  maxPollCount = 50;    // 50 polls

    } else if (numberCount > 500) {
      pollInterval = 5000;    // 7 seconds for 500-1000 numbers
      maxPollCount = 50;      // Poll up to 60 times
    }

    console.log(`Polling set for ${maxPollCount} times with ${pollInterval}ms interval`);

    // Start polling process
    const pollIntervalId = setInterval(async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userId}`);
        dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
        dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
        console.log(`📡 Polling #${pollCount + 1}...`);
      } catch (err) {
        console.error("Polling error:", err);
      }

      pollCount++;
      if (pollCount >= maxPollCount) {
        clearInterval(pollIntervalId);
        console.log("✅ Finished polling.");
      }
    }, pollInterval); // Adjusted polling interval

   const botStartId = 9;  // Starting bot ID (1, 2, 3, etc.)
const botDelays = Array.from({ length: latestBotCount }, (_, i) => {
  const botId = botStartId + i;  // This will generate bot IDs from 1, 2, 3, ..., etc.
  const delayKey = `delay_${botId}`;  // Accessing the delay based on bot ID (e.g., delay_1, delay_10)
  const delay = localStorage.getItem(delayKey);  // Getting delay from localStorage
  return parseInt(delay || "0", 10);  // Default to 0 if no delay is found
});


    console.log("🚀 Sending with bot delays:", botDelays);

    // Send the broadcast message to the server
    await axios.post("https://render-backend-ksnp.onrender.com/api/auth/message/broadcast", {
      message: broadcastMessage,
      senderId: userId,
      botCount: latestBotCount,
      botDelays,
    });

    toast.success("Broadcast sent successfully");

    setBroadcastMessage("");
    setIsBroadcastModalVisible(false);

  } catch (err) {
    console.error("Broadcast error:", err);
  } finally {
    setSending(false);
  }
};







  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  const handleImportUsers = () => {
    setIsContextMenuVisible(false);
    setIsImportModalVisible(true);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;

      const contacts = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && /^\+?\d{10,}$/.test(line))
      .map((number) => {
        
        const fullName = number; // ✅ Use number as the name
  const randomIndex = Math.floor(Math.random() * 1000) + 1;
  const avatar = `/avatars/${selectedGender}/${randomIndex}.png`;
  return { number, name: fullName, avatar }; // ✅ name is a string
});

    const numberCount = contacts.length;
    console.log("Total valid numbers:", numberCount);

    // Save the numberCount to localStorage
    localStorage.setItem('importedNumberCount', numberCount);

      if (!contacts.length) {
        toast.error("No valid phone numbers found.");
        return;
      }

      setPreviewNumbers(contacts);
      setIsPreviewVisible(true);
    };

    reader.readAsText(file);
  };

const confirmImportNumbers = async () => {
  try {
    const payload = previewNumbers.map(({ number, name, avatar }, index) => ({
      email: `bot${index + 1}@fake.com`,   // ✅ dummy email to satisfy schema
      name,
      phoneNumber: number,                 // ✅ mapped properly
      profilePicture: avatar,
      about: "",                           // optional, or use a default
    }));

    const res = await axios.post("https://render-backend-ksnp.onrender.com/api/auth/add-batch-users", {
      startingId: 3,
      contacts: payload,
    });

    toast.success(res.data.message || "Users imported successfully");
    
await refetchContacts();
    setIsPreviewVisible(false);
    setIsImportModalVisible(false);
    setPreviewNumbers([]);
  } catch (err) {
    console.error("Import error:", err);
    toast.error(err?.response?.data?.message || "Failed to import users");
  }
};



  const handleDeleteAllUsers = async () => {
    try {

      
await refetchContacts();
      setIsContextMenuVisible(false);
      const startId = 3;
      const res = await axios.delete(`https://render-backend-ksnp.onrender.com/api/auth/delete-batch-users/${startId}`);
      toast.success(res.data.message || "Users deleted successfully");
      
await refetchContacts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete users");
    }
  };

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const contextMenuOptions = [
    { name: "Import Contacts", callBack: handleImportUsers },
    { name: "Delete All Contacts", callBack: handleDeleteAllUsers },
    {
      name: "Broadcast to All",
      callBack: () => {
        setBroadcastMessage("");
        setIsBroadcastModalVisible(true);
        setIsContextMenuVisible(false);
      },
    },
    {
      name: "Logout",
      callBack: () => {
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer font-bold text-white">Chats</div>

      <div className="flex gap-6">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New chat"
          onClick={handleAllContactsPage}
        />
        <>
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Menu"
            onClick={showContextMenu}
            id="context-opener"
          />

          {isContextMenuVisible && (
            <ContextMenu
              options={contextMenuOptions}
              cordinates={contextMenuCordinates}
              contextMenu={isContextMenuVisible}
              setContextMenu={setIsContextMenuVisible}
            />
          )}
        </>
      </div>

      {/* Import Modal */}
      {isImportModalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Import Contacts from CSV</h2>

            <label className="block mb-2 font-medium text-sm">Select Gender for Avatars</label>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="file"
              accept=".csv"
              className="w-full border px-3 py-2 rounded mb-4"
              onChange={handleCSVUpload}
            />

            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsImportModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Broadcast Message to All</h2>

            <label className="block mb-1 text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              placeholder="Enter your message here"
              rows="4"
            />

     

            <div className="flex justify-between mt-2">
              <button
                className={`px-4 py-2 rounded text-white ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
                onClick={handleBroadcastToAll}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>

              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsBroadcastModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Preview Numbers to Import</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {previewNumbers.map((user, idx) => (
                <li key={idx} className="border-b pb-2 flex gap-2 items-center">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-600">{user.number}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={confirmImportNumbers}
              >
                Confirm Import
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsPreviewVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
