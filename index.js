function validasiInput(data) {
  if (data.suami && data.jumlahIstri > 0) {
    return "Tidak boleh ada suami dan istri bersamaan";
  }

  if (![0,1].includes(data.ayah)) {
    return "Ayah hanya boleh 0 atau 1";
  }

  if (![0,1].includes(data.ibu)) {
    return "Ibu hanya boleh 0 atau 1";
  }

  if (data.anakLaki < 0 || data.anakPerempuan < 0) {
    return "Jumlah anak tidak valid";
  }

  const totalAhliWaris =
    data.suami +
    data.jumlahIstri +
    data.ayah +
    data.ibu +
    data.anakLaki +
    data.anakPerempuan;

  if (totalAhliWaris === 0) {
    return "Tidak ada ahli waris";
  }

  return null;
}


function hitung() {
  const data = {
    totalHarta: Number(document.getElementById("harta").value),
    suami: Number(document.getElementById("suami").value) === 1 ? 1 : 0,
    jumlahIstri: Number(document.getElementById("istri").value),
    ayah: Number(document.getElementById("ayah").value) === 1 ? 1 : 0,
    ibu: Number(document.getElementById("ibu").value) === 1 ? 1 : 0,
    anakLaki: Number(document.getElementById("anakLaki").value),
    anakPerempuan: Number(document.getElementById("anakPerempuan").value),
  };

  if (data.totalHarta <= 0) {
    alert("Total harta harus diisi");
    return;
  }

  const error = validasiInput(data);
  if (error) {
    alert(error);
    return;
  }

  const adaAnak = data.anakLaki > 0 || data.anakPerempuan > 0;
  let sisaHarta = data.totalHarta;
  let hasil = "";

  // ===== PASANGAN =====
  if (data.suami) {
    const bagianSuami = data.totalHarta * (adaAnak ? 1/4 : 1/2);
    sisaHarta -= bagianSuami;
    hasil += `Suami: Rp ${bagianSuami.toLocaleString()}\n`;
  }

  if (data.jumlahIstri > 0) {
    const bagianIstriTotal = data.totalHarta * (adaAnak ? 1/8 : 1/4);
    const bagianPerIstri = bagianIstriTotal / data.jumlahIstri;
    sisaHarta -= bagianIstriTotal;
    hasil += `Istri (${data.jumlahIstri} orang): Rp ${bagianPerIstri.toLocaleString()} per orang\n`;
  }

  // ===== IBU =====
  if (data.ibu) {
    const bagianIbu = data.totalHarta * (adaAnak ? 1/6 : 1/3);
    sisaHarta -= bagianIbu;
    hasil += `Ibu: Rp ${bagianIbu.toLocaleString()}\n`;
  }

  // ===== AYAH =====
  if (data.ayah) {
    if (adaAnak) {
      const bagianAyah = data.totalHarta * (1/6);
      sisaHarta -= bagianAyah;
      hasil += `Ayah: Rp ${bagianAyah.toLocaleString()}\n`;
    } else {
      hasil += `Ayah (Ashabah): Rp ${sisaHarta.toLocaleString()}\n`;
      sisaHarta = 0;
    }
  }

  // ===== ANAK =====
  if (adaAnak) {
    const totalBagianAnak = (data.anakLaki * 2) + data.anakPerempuan;
    const nilaiSatuBagian = sisaHarta / totalBagianAnak;

    if (data.anakLaki > 0) {
      hasil += `Anak Laki-laki (${data.anakLaki} orang): Rp ${(nilaiSatuBagian * 2).toLocaleString()} per orang\n`;
    }

    if (data.anakPerempuan > 0) {
      hasil += `Anak Perempuan (${data.anakPerempuan} orang): Rp ${nilaiSatuBagian.toLocaleString()} per orang\n`;
    }
  }
  window.location.href = '#hasilSemua';
  document.getElementById("hasil").value = hasil;
}

