import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) {
      window.location.href = "/login";
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/user/${email}`);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [email]);

  if (!user) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveUser = async () => {
    try {
      const response = await axios.post(
  "http://192.168.244.73:8000/login",
        user
      );
      setUser(res.data);
      setEdit(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        <h2 style={styles.title}>👤 User Dashboard</h2>

        {/*  UPDATED AVATAR */}
        {user.photo ? (
          <img
            src={`data:image/jpeg;base64,${user.photo}`}
            alt="profile"
            style={styles.image}
          />
        ) : (
          <div style={styles.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={styles.form}>
          <input
            name="name"
            value={user.name}
            disabled={!edit}
            onChange={handleChange}
            style={styles.input}
            placeholder="Name"
          />

          <input
            name="email"
            value={user.email}
            disabled
            style={{ ...styles.input, background: "#eee" }}
          />

          <input
            name="phone"
            value={user.phone}
            disabled={!edit}
            onChange={handleChange}
            style={styles.input}
            placeholder="Phone"
          />

          <input
            name="city"
            value={user.city}
            disabled={!edit}
            onChange={handleChange}
            style={styles.input}
            placeholder="City"
          />
        </div>

        {!edit ? (
          <button style={styles.editBtn} onClick={() => setEdit(true)}>
             Edit Profile
          </button>
        ) : (
          <button style={styles.saveBtn} onClick={saveUser}>
             Save Changes
          </button>
        )}

        <button style={styles.logoutBtn} onClick={logout}>
           Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #56ab2f, #a8e063)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  title: {
    marginBottom: "15px",
    color: "#2e7d32",
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#56ab2f",
    color: "#fff",
    fontSize: "28px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "10px auto 20px",
    fontWeight: "bold",
  },

  image: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "10px auto 20px",
    border: "3px solid #56ab2f"
  },

  form: {
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  editBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#ffa726",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  saveBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#43a047",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  logoutBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#e53935",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};