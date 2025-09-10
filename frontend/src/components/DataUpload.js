import React, { useState } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const DataUpload = () => {
  const [siteName, setSiteName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState("");
  const [saplings, setSaplings] = useState("");
  const [photo, setPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let photoURL = "";
      if (photo) {
        const storageRef = ref(storage, `photos/${photo.name}`);
        await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "restorationData"), {
        siteName,
        latitude,
        longitude,
        date,
        saplings,
        photoURL,
      });

      alert("Data uploaded successfully!");
      setSiteName(""); setLatitude(""); setLongitude(""); setDate(""); setSaplings(""); setPhoto(null);
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
      <input type="number" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
      <input type="number" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input type="number" placeholder="Number of Saplings" value={saplings} onChange={(e) => setSaplings(e.target.value)} required />
      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      <button type="submit">Upload Data</button>
    </form>
  );
};

export default DataUpload;
