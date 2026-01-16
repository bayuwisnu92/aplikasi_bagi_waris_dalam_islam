
function hitung() {
  const totalHarta = Number(document.getElementById("harta").value);
  const anakLaki = Number(document.getElementById("anakLaki").value);
  const anakPerempuan = Number(document.getElementById("anakPerempuan").value);

  // Validasi dasar
  if (totalHarta <= 0) {
    alert("Total harta harus diisi");
    return;
  }

  if (anakLaki === 0 && anakPerempuan === 0) {
    alert("Minimal harus ada satu anak");
    return;
  }

  // Total bagian faraidh
  const totalBagian = (anakLaki * 2) + anakPerempuan;
  const nilaiSatuBagian = totalHarta / totalBagian;

  let hasil = "";

  if (anakLaki > 0) {
    hasil += `Anak Laki-laki (${anakLaki} orang): Rp ${(nilaiSatuBagian * 2).toLocaleString()} per orang\n`;
  }

  if (anakPerempuan > 0) {
    hasil += `Anak Perempuan (${anakPerempuan} orang): Rp ${nilaiSatuBagian.toLocaleString()} per orang\n`;
  }

  document.getElementById("hasil").textContent = hasil;
}

