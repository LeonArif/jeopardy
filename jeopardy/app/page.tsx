'use client'; // WAJIB karena kita pakai SDK Firebase di sisi browser

import { db } from '@/lib/firebase'; 
import { useEffect } from 'react';

export default function TestFirebase() {
  useEffect(() => {
    // Cek di Console Log Browser (F12)
    console.log("Firebase App Name:", db.app.name);
    console.log("Project ID:", db.app.options.projectId);
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Firebase Setup Berhasil! ✅</h1>
      <p>Cek Console Log (F12) untuk melihat detail koneksi.</p>
    </main>
  );
}