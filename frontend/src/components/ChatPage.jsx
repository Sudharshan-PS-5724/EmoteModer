import { useState } from 'react';
import ChatRoomSelector from './ChatRoomSelector';
import ChatRoom from './ChatRoom';

import roomList from '../../../shared/rooms.json';
const rooms = Object.fromEntries(roomList.map((room) => [room.id, room]));

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const room = selectedRoom ? rooms[selectedRoom] : null;

  return (
    <main className="chat-page">
      <div className="chat-shell">
        <div className="chat-page-heading">
          <p className="eyebrow">A PLACE TO LAND</p>
          <h1>We’re in this <span>together.</span></h1>
          <p>Say what’s on your mind. Listen when someone else needs it.</p>
        </div>

        {!selectedRoom ? (
          <ChatRoomSelector selectedRoom={selectedRoom} onRoomSelect={setSelectedRoom} />
        ) : (
          <section className="active-room">
            <button className="text-button room-back" onClick={() => setSelectedRoom(null)}>← All rooms</button>
            <ChatRoom
              key={selectedRoom}
              roomId={selectedRoom}
              roomName={room.label}
              roomEmoji={room.mark}
            />
          </section>
        )}

        <footer className="workspace-footer">
          <span>Be kind to yourself and each other.</span>
          <span>COMMUNITY MOOD ROOMS</span>
        </footer>
      </div>
    </main>
  );
}
