import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import html2canvas from 'html2canvas';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue in webpack/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const busIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/48/bus.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    shadowUrl: undefined,
    shadowSize: [0, 0]
});

const socket = io('http://localhost:3001');

function App() {
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [credentials, setCredentials] = useState({ username: "", password: "", email: "", phone: "" });
  const [newBus, setNewBus] = useState({ busId: '', name: '', origin: '', destination: '', price: 500, lat: 12.97, lng: 77.59 });
  
  const [buses, setBuses] = useState([]);
  const [activeBus, setActiveBus] = useState(null);
  const [location, setLocation] = useState({ lat: 12.97, lng: 77.59 });
  const [showBooking, setShowBooking] = useState(false);
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);

  // Admin state
  const [adminTab, setAdminTab] = useState('buses'); // 'buses' | 'users'
  const [allUsers, setAllUsers] = useState([]);
  const [editBus, setEditBus] = useState(null);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch('http://localhost:3001/api/buses').then(res => res.json()).then(setBuses);
    socket.on('auth_success', (u) => { 
      console.log('✅ Auth success:', u.username);
      setUser(u); 
      setIsAdminView(false); 
    });
    socket.on('auth_error', (msg) => { 
      console.error('❌ Auth error:', msg); 
      setAuthError(msg); 
    });
    socket.on('bus_data_updated', setBuses);
    socket.on('bus_locations_updated', (locations) => {
      setBuses(prevBuses => prevBuses.map(bus => {
        const update = locations.find(loc => loc.busId === bus.busId);
        return update ? { ...bus, lat: update.lat, lng: update.lng } : bus;
      }));
    });
    socket.on('user_tickets_list', setBookingHistory);
    socket.on('initial_seats', (d) => setSeatMap(d.seats));
    socket.on('admin_users_list', (u) => {
      console.log('👥 Received users list, count:', u.length);
      setAllUsers(u);
    });
    return () => socket.off();
  }, []);

  useEffect(() => {
    socket.on('update_seats', (d) => { 
      if(activeBus?.busId === d.busId) setSeatMap(d.updatedMap); 
    });
    return () => { socket.off('update_seats'); };
  }, [activeBus]);

  const handleAuth = () => {
    console.log('handleAuth called, isRegistering:', isRegistering, 'credentials:', credentials);
    setAuthError('');
    socket.emit(isRegistering ? 'register' : 'login', credentials);
  };

  if (!user) {
    return (
      <div className={`login-overlay ${darkMode ? 'dark' : ''}`}>
        <div className={`login-box ${darkMode ? 'dark' : ''}`}>
          <div className="dark-toggle-login">
            <button className="dark-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <h2>{isRegistering ? "Admin/User Signup" : "Login"}</h2>
          <input 
            placeholder="Username" 
            value={credentials.username}
            onChange={e => setCredentials({...credentials, username: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={credentials.password}
            onChange={e => setCredentials({...credentials, password: e.target.value})} 
          />
          {isRegistering && (
            <>
              <input 
                type="email" 
                placeholder="Email" 
                value={credentials.email}
                onChange={e => setCredentials({...credentials, email: e.target.value})} 
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={credentials.phone}
                onChange={e => setCredentials({...credentials, phone: e.target.value})} 
              />
            </>
          )}
          <button className="auth-btn" onClick={handleAuth}>{isRegistering ? "Register" : "Login"}</button>
          {authError && <div className="error-message">⚠️ {authError}</div>}
          <p className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <div className={`sidebar ${darkMode ? 'dark' : ''}`}>
        <div className="user-profile">
            <span>👤 {user.username} {user.isAdmin && "(Admin)"}</span>
            <div className="profile-actions">
              <button className="dark-toggle-btn small" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button className="logout-btn" onClick={() => setUser(null)}>Logout</button>
            </div>
        </div>



        {isAdminView ? (
            <div className="admin-panel">
                <div className="admin-tabs">
                  <button className={`admin-tab ${adminTab === 'buses' ? 'active' : ''}`} onClick={() => setAdminTab('buses')}>🚌 Buses</button>
                  <button className={`admin-tab ${adminTab === 'users' ? 'active' : ''}`} onClick={() => { setAdminTab('users'); socket.emit('admin_get_users'); }}>👥 Users</button>
                </div>

                {adminTab === 'buses' ? (
                  <>
                    <h3>Add New Bus</h3>
                    <input placeholder="Bus Name" onChange={e => setNewBus({...newBus, name: e.target.value})} />
                    <input placeholder="Origin" onChange={e => setNewBus({...newBus, origin: e.target.value})} />
                    <input placeholder="Destination" onChange={e => setNewBus({...newBus, destination: e.target.value})} />
                    <input type="number" placeholder="Price (₹)" onChange={e => setNewBus({...newBus, price: e.target.value})} />
                    <input type="number" placeholder="Latitude" step="0.01" onChange={e => setNewBus({...newBus, lat: parseFloat(e.target.value)})} />
                    <input type="number" placeholder="Longitude" step="0.01" onChange={e => setNewBus({...newBus, lng: parseFloat(e.target.value)})} />
                    <button className="confirm-btn" onClick={() => socket.emit('admin_add_bus', newBus)}>➕ Add Bus</button>
                    <hr />
                    <h3>Manage Buses ({buses.length})</h3>
                    {buses.map(b => (
                        <div key={b.busId} className="admin-item">
                            <div className="admin-item-info">
                              <span className="admin-item-name">{b.name || '(No Name)'}</span>
                              <span className="admin-item-id">{b.busId} • ₹{b.price} • {b.origin || 'N/A'} - {b.destination || 'N/A'}</span>
                            </div>
                            <div className="admin-item-actions">
                              <button className="track-btn small" onClick={() => { setActiveBus(b); setLocation({lat: b.lat, lng: b.lng}) }} title="Track">🛰️</button>
                              <button className="book-btn small" onClick={() => { setActiveBus(b); setShowBooking(true); socket.emit('get_bus_seats', b.busId); }} title="Book">🎫</button>
                              <button className="edit-btn small" onClick={() => setEditBus({busId: b.busId, name: b.name, origin: b.origin, destination: b.destination, price: b.price, lat: b.lat, lng: b.lng})}>✏️</button>
                              <button className="delete-btn small" onClick={() => { if(window.confirm(`Delete bus "${b.name}"?`)) socket.emit('admin_delete_bus', b.busId); }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                  </>
                ) : (
                  <>
                    <h3>All Users ({allUsers.length})</h3>
                    {allUsers.length === 0 ? (
                      <p className="no-data-msg">No users registered yet.</p>
                    ) : allUsers.map(u => (
                      <div key={u.username} className="admin-user-item">
                        <div className="user-info">
                          <span className="user-name">{u.username} {u.isAdmin && <span className="admin-badge">Admin</span>}</span>
                          <span className="user-details">{u.email || 'No email'} • {u.phone || 'No phone'}</span>
                          <span className="user-bookings">{u.bookings?.length || 0} bookings</span>
                        </div>
                        <div className="user-actions">
                          <button className="toggle-admin-btn" onClick={() => socket.emit('admin_toggle_admin', u.username)} title={u.isAdmin ? 'Remove admin' : 'Make admin'}>
                            {u.isAdmin ? '👤' : '⭐'}
                          </button>
                          <button className="delete-btn small" onClick={() => { if(window.confirm(`Delete user "${u.username}"?`)) socket.emit('admin_delete_user', u.username); }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
            </div>
        ) : (
            <>
                <div className="history-section">
                    <h4>My Tickets</h4>
                    {bookingHistory.map((t, i) => (
                        <button key={i} className="manage-btn" onClick={() => setTicketData(t)}>🎫 {t.busName} ({t.seats})</button>
                    ))}
                </div>
                <hr />
                {buses.map(bus => (
                    <div key={bus.busId} className="bus-card">
                        <h4>{bus.name}</h4>
                        <p className="route-info">📍 {bus.origin || 'N/A'} ➡️ {bus.destination || 'N/A'}</p>
                        <p style={{color:'#2ecc71'}}>₹{bus.price}</p>
                        <div className="bus-actions">
                          <button className="track-btn" onClick={() => { setActiveBus(bus); setLocation({lat: bus.lat, lng: bus.lng}) }}>TRACK</button>
                          <button className="book-btn" onClick={() => { setActiveBus(bus); setShowBooking(true); socket.emit('get_bus_seats', bus.busId); }}>BOOK NOW</button>
                        </div>
                    </div>
                ))}
            </>
        )}
      </div>

      <div className="map-area">
        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {buses.map(bus => (
            <Marker key={bus.busId} position={[bus.lat, bus.lng]} icon={busIcon} />
          ))}
          <RecenterMap lat={location.lat} lng={location.lng} />
        </MapContainer>
      </div>

      {showBooking && activeBus && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
            <h3>{activeBus.name} (₹{activeBus.price})</h3>
            <div className="seat-grid">
              {seatMap.map((row, rIdx) => (
                <div key={rIdx} className="row">
                  {row.map((seat, cIdx) => (
                    <div key={cIdx} 
                      onClick={() => seat === 1 && (setSelectedSeats(prev => prev.includes(`${rIdx}-${cIdx}`) ? prev.filter(s => s !== `${rIdx}-${cIdx}`) : [...prev, `${rIdx}-${cIdx}`]))}
                      className={`seat ${seat === 0 ? 'aisle' : seat === 2 ? 'booked' : selectedSeats.includes(`${rIdx}-${cIdx}`) ? 'selected' : 'available'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p>Total: ₹{selectedSeats.length * activeBus.price}</p>
            <button className="confirm-btn" onClick={() => {
                socket.emit('book_seats', { busId: activeBus.busId, busName: activeBus.name, selectedSeats, username: user.username, total: selectedSeats.length * activeBus.price, bookingId: "TXN"+Date.now() });
                setSelectedSeats([]); setShowBooking(false);
            }}>Confirm</button>
            <button className="cancel-btn" onClick={() => setShowBooking(false)}>Close</button>
          </div>
        </div>
      )}

      {ticketData && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
            <h3>🎫 Ticket Details</h3>
            <div className="formal-ticket" id={`ticket-${ticketData.bookingId}`}>
              <p><strong>Bus:</strong> {ticketData.busName}</p>
              <p><strong>Seats:</strong> {ticketData.seats}</p>
              <p><strong>Booking ID:</strong> {ticketData.bookingId}</p>
              <p className="fare-total">Total: ₹{ticketData.total}</p>
              <div className="qr-box">
                <QRCode value={JSON.stringify({ bookingId: ticketData.bookingId, bus: ticketData.busName, seats: ticketData.seats })} size={100} />
              </div>
            </div>
            
            <button className="confirm-btn" style={{marginBottom: '10px'}} onClick={() => {
              const printContent = document.getElementById(`ticket-${ticketData.bookingId}`).innerHTML;
              const originalContent = document.body.innerHTML;
              document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif; text-align: center;">
                <h2>🚌 Smart Transit Ticket</h2>
                ${printContent}
              </div>`;
              window.print();
              document.body.innerHTML = originalContent;
              window.location.reload(); // Reload to restore React state cleanly after print
            }}>🖨️ Print Ticket</button>

            <button className="delete-btn" style={{width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '10px'}} onClick={() => {
              if(window.confirm('Cancel this booking and reset seats?')) {
                const seatsToCancel = ticketData.seats.split(', ').map(s => s.trim());
                socket.emit('cancel_seats', { busId: ticketData.busId, seatsToCancel, username: user.username, bookingId: ticketData.bookingId });
                setTicketData(null);
              }
            }}>🗑️ Cancel & Reset Seats</button>
            <button className="cancel-btn" onClick={() => setTicketData(null)}>Close</button>
          </div>
        </div>
      )}
      {editBus && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
            <h3>✏️ Edit Bus</h3>
            <label className="edit-label">Bus Name</label>
            <input value={editBus.name} onChange={e => setEditBus({...editBus, name: e.target.value})} />
            <label className="edit-label">Origin</label>
            <input value={editBus.origin || ''} onChange={e => setEditBus({...editBus, origin: e.target.value})} />
            <label className="edit-label">Destination</label>
            <input value={editBus.destination || ''} onChange={e => setEditBus({...editBus, destination: e.target.value})} />
            <label className="edit-label">Price (₹)</label>
            <input type="number" value={editBus.price} onChange={e => setEditBus({...editBus, price: e.target.value})} />
            <label className="edit-label">Latitude</label>
            <input type="number" step="0.01" value={editBus.lat} onChange={e => setEditBus({...editBus, lat: e.target.value})} />
            <label className="edit-label">Longitude</label>
            <input type="number" step="0.01" value={editBus.lng} onChange={e => setEditBus({...editBus, lng: e.target.value})} />
            <button className="confirm-btn" onClick={() => {
              socket.emit('admin_update_bus', { busId: editBus.busId, updates: { name: editBus.name, origin: editBus.origin, destination: editBus.destination, price: editBus.price, lat: editBus.lat, lng: editBus.lng } });
              setEditBus(null);
            }}>💾 Save Changes</button>
            <button className="cancel-btn" onClick={() => setEditBus(null)}>Cancel</button>
          </div>
        </div>
      )}
      {user.isAdmin && (
        <button className="admin-toggle-btn" onClick={() => { setIsAdminView(!isAdminView); if(!isAdminView) socket.emit('admin_get_users'); }}>
            {isAdminView ? "🚀 Go to Booking" : "⚙️ Admin Panel"}
        </button>
      )}
    </div>
  );
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { 
    map.setView([lat, lng]); 
  }, [lat, lng, map]);

  useEffect(() => {
    // Force map to recalculate its size after a slight delay to ensure container is fully rendered.
    // This fixes the "gray map tiles" issue when layout changes or initially loads.
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
}
export default App;