// Fungsi untuk mengambil dan menormalisasi input dari form HTML
function normalizeInput() {
  return {
    // Mengambil nilai dari input dengan id "harta" dan mengonversi ke angka
    totalHarta: Number(document.getElementById("harta").value),

    // Mengambil nilai suami (0/1) dan mengonversi ke boolean (1 = ada, 0 = tidak)
    suami: Number(document.getElementById("suami").value) === 1 ? 1 : 0,
    // Mengambil jumlah istri dan mengonversi ke angka
    istri: Number(document.getElementById("istri").value),

    // Mengambil nilai ayah (0/1) dan mengonversi ke boolean
    ayah: Number(document.getElementById("ayah").value) === 1 ? 1 : 0,
    // Mengambil nilai ibu (0/1) dan mengonversi ke boolean
    ibu: Number(document.getElementById("ibu").value) === 1 ? 1 : 0,

    // Mengambil jumlah anak laki-laki dan mengonversi ke angka
    anakLaki: Number(document.getElementById("anakLaki").value),
    // Mengambil jumlah anak perempuan dan mengonversi ke angka
    anakPerempuan: Number(document.getElementById("anakPerempuan").value),

    saudaraLaki: Number(document.getElementById("saudaraLaki").value),
    saudaraPerempuan: Number(document.getElementById("saudaraPerempuan").value),
  };
}

// Fungsi untuk validasi data input
function validateInput(d) {
  if (d.totalHarta <= 0) return "Total harta harus lebih dari 0";

  if (d.suami && d.istri > 0)
    return "Tidak boleh ada suami dan istri bersamaan";

  if (![0,1].includes(d.ayah)) return "Ayah hanya boleh 0 atau 1";
  if (![0,1].includes(d.ibu)) return "Ibu hanya boleh 0 atau 1";

  if (
    d.anakLaki < 0 || d.anakPerempuan < 0 ||
    d.saudaraLaki < 0 || d.saudaraPerempuan < 0
  ) {
    return "Jumlah ahli waris tidak valid";
  }

  const total =
    d.suami + d.istri + d.ayah + d.ibu +
    d.anakLaki + d.anakPerempuan +
    d.saudaraLaki + d.saudaraPerempuan;

  if (total === 0) return "Tidak ada ahli waris";

  return null;
}


// Fungsi untuk mengecek apakah ada anak
function hasChildren(d) {
  // Mengembalikan true jika ada anak laki-laki atau perempuan
  return d.anakLaki > 0 || d.anakPerempuan > 0;
}

// Fungsi untuk menghitung bagian suami/istri
function calculateSpouse(d, state) {
  // Jika ada suami
  if (d.suami) {
    // Hitung bagian suami: 1/4 jika ada anak, 1/2 jika tidak ada anak
    const bagian = d.totalHarta * (hasChildren(d) ? 1/4 : 1/2);
    // Alokasikan ke state
    state.allocate("Suami", bagian);
  }

  // Jika ada istri
  if (d.istri > 0) {
    // Hitung total bagian istri: 1/8 jika ada anak, 1/4 jika tidak ada anak
    const total = d.totalHarta * (hasChildren(d) ? 1/8 : 1/4);
    // Alokasikan ke state dengan pembagian per orang
    state.allocate(`Istri (${d.istri} orang)`, total, d.istri);
  }
}

// Fungsi untuk menghitung bagian orang tua
function calculateParents(d, state) {
  // Jika ada ibu
  if (d.ibu) {
    // Hitung bagian ibu: 1/6 jika ada anak, 1/3 jika tidak ada anak
    const bagian = d.totalHarta * (hasChildren(d) ? 1/6 : 1/3);
    state.allocate("Ibu", bagian);
  }

  // Jika ada ayah DAN ada anak
  if (d.ayah && hasChildren(d)) {
    // Ayah mendapat 1/6 jika ada anak
    const bagian = d.totalHarta * (1/6);
    state.allocate("Ayah", bagian);
  }
}

// Fungsi untuk menghitung bagian anak
function calculateChildren(d, state) {
  // Jika tidak ada anak, keluar dari fungsi
  if (!hasChildren(d)) return;

  // Hitung total bagian: anak laki dapat 2 bagian, anak perempuan 1 bagian
  const totalBagian = (d.anakLaki * 2) + d.anakPerempuan;
  // Hitung nilai per unit bagian
  const unit = state.sisa / totalBagian;

  // Jika ada anak laki-laki
  if (d.anakLaki > 0) {
    // Alokasikan bagian untuk anak laki-laki
    state.allocate(
      `Anak Laki-laki (${d.anakLaki} orang)`,
      unit * 2 * d.anakLaki
    );
  }

  // Jika ada anak perempuan
  if (d.anakPerempuan > 0) {
    // Alokasikan bagian untuk anak perempuan
    state.allocate(
      `Anak Perempuan (${d.anakPerempuan} orang)`,
      unit * d.anakPerempuan
    );
  }
}

function calculateSiblings(d, state) {
  // Hijab total
  if (hasChildren(d) || d.ayah) return;

  const totalSaudara = d.saudaraLaki + d.saudaraPerempuan;
  if (totalSaudara === 0) return;

  // Kasus saudara laki + perempuan → ashabah
  if (d.saudaraLaki > 0) {
    const totalBagian = (d.saudaraLaki * 2) + d.saudaraPerempuan;
    const unit = state.sisa / totalBagian;

    if (d.saudaraLaki > 0) {
      state.allocate(
        `Saudara Kandung Laki-laki (${d.saudaraLaki} orang)`,
        unit * 2 * d.saudaraLaki
      );
    }

    if (d.saudaraPerempuan > 0) {
      state.allocate(
        `Saudara Kandung Perempuan (${d.saudaraPerempuan} orang)`,
        unit * d.saudaraPerempuan
      );
    }

    state.sisa = 0;
    return;
  }

  // Kasus saudara perempuan saja
  if (d.saudaraPerempuan === 1) {
    state.allocate("Saudara Kandung Perempuan", state.sisa * 1/2);
    return;
  }

  if (d.saudaraPerempuan >= 2) {
    state.allocate(
      `Saudara Kandung Perempuan (${d.saudaraPerempuan} orang)`,
      state.sisa * 2/3,
      d.saudaraPerempuan
    );
  }
}

// Factory function untuk membuat state perhitungan
function createState(totalHarta) {
  return {
    // Sisa harta yang belum dibagikan
    sisa: totalHarta,
    // Array untuk menyimpan hasil pembagian
    hasil: [],

    // Method untuk mengalokasikan bagian
    allocate(nama, jumlah, pembagi = 1) {
      // Kurangi sisa harta
      this.sisa -= jumlah;
      // Tambahkan ke array hasil
      this.hasil.push({
        nama,           // Nama ahli waris
        total: jumlah,  // Total bagian
        perOrang: jumlah / pembagi,  // Bagian per orang (jika lebih dari 1)
      });
    },
  };
}

// Fungsi utama untuk menghitung pembagian waris
function hitung() {
  // Ambil dan normalisasi input
  const d = normalizeInput();
  
  // Validasi input, tampilkan alert jika ada error
  const error = validateInput(d);
  if (error) return alert(error);

  // Buat state perhitungan
  const state = createState(d.totalHarta);

  // Hitung bagian suami/istri
  calculateSpouse(d, state);
  // Hitung bagian orang tua
  calculateParents(d, state);
  // Hitung bagian anak
  calculateChildren(d, state);

  calculateSiblings(d, state);


  // Render hasil ke tampilan
  renderResult(state);
}

// Fungsi untuk menampilkan hasil perhitungan
function renderResult(state) {
  let output = "";

  // Loop melalui setiap hasil pembagian
  state.hasil.forEach(h => {
    // Format output dengan nama dan bagian per orang
    output += `${h.nama}: Rp ${h.perOrang.toLocaleString()}\n`;
  });

  // Jika ada sisa harta (karena pembulatan atau kasus khusus)
  if (state.sisa > 0) {
    // Tambahkan informasi sisa harta
    output += `\nSisa harta: Rp ${state.sisa.toLocaleString()}`;
  }
  
  // Scroll ke bagian hasil
  window.location.href = '#hasilSemua';
  
  // Tampilkan output di textarea dengan id "hasil"
  document.getElementById("hasil").value = output;
}