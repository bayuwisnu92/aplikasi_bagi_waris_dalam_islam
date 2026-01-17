function normalizeInput() {
  return {
    totalHarta: Number(document.getElementById("harta").value),

    suami: Number(document.getElementById("suami").value) === 1 ? 1 : 0,
    istri: Number(document.getElementById("istri").value),

    ayah: Number(document.getElementById("ayah").value) === 1 ? 1 : 0,
    ibu: Number(document.getElementById("ibu").value) === 1 ? 1 : 0,

    anakLaki: Number(document.getElementById("anakLaki").value),
    anakPerempuan: Number(document.getElementById("anakPerempuan").value),
  };
}
function validateInput(d) {
  if (d.totalHarta <= 0) return "Total harta harus lebih dari 0";

  if (d.suami && d.istri > 0)
    return "Tidak boleh ada suami dan istri bersamaan";

  if (![0,1].includes(d.ayah)) return "Ayah hanya boleh 0 atau 1";
  if (![0,1].includes(d.ibu)) return "Ibu hanya boleh 0 atau 1";

  if (d.anakLaki < 0 || d.anakPerempuan < 0)
    return "Jumlah anak tidak valid";

  const total =
    d.suami + d.istri + d.ayah + d.ibu + d.anakLaki + d.anakPerempuan;

  if (total === 0) return "Tidak ada ahli waris";

  return null;
}
function hasChildren(d) {
  return d.anakLaki > 0 || d.anakPerempuan > 0;
}
function calculateSpouse(d, state) {
  if (d.suami) {
    const bagian = d.totalHarta * (hasChildren(d) ? 1/4 : 1/2);
    state.allocate("Suami", bagian);
  }

  if (d.istri > 0) {
    const total = d.totalHarta * (hasChildren(d) ? 1/8 : 1/4);
    state.allocate(`Istri (${d.istri} orang)`, total, d.istri);
  }
}
function calculateParents(d, state) {
  if (d.ibu) {
    const bagian = d.totalHarta * (hasChildren(d) ? 1/6 : 1/3);
    state.allocate("Ibu", bagian);
  }

  if (d.ayah && hasChildren(d)) {
    const bagian = d.totalHarta * (1/6);
    state.allocate("Ayah", bagian);
  }
}
function calculateChildren(d, state) {
  if (!hasChildren(d)) return;

  const totalBagian = (d.anakLaki * 2) + d.anakPerempuan;
  const unit = state.sisa / totalBagian;

  if (d.anakLaki > 0) {
    state.allocate(
      `Anak Laki-laki (${d.anakLaki} orang)`,
      unit * 2 * d.anakLaki
    );
  }

  if (d.anakPerempuan > 0) {
    state.allocate(
      `Anak Perempuan (${d.anakPerempuan} orang)`,
      unit * d.anakPerempuan
    );
  }
}
function createState(totalHarta) {
  return {
    sisa: totalHarta,
    hasil: [],

    allocate(nama, jumlah, pembagi = 1) {
      this.sisa -= jumlah;
      this.hasil.push({
        nama,
        total: jumlah,
        perOrang: jumlah / pembagi,
      });
    },
  };
}
function hitung() {
  const d = normalizeInput();
  const error = validateInput(d);
  if (error) return alert(error);

  const state = createState(d.totalHarta);

  calculateSpouse(d, state);
  calculateParents(d, state);
  calculateChildren(d, state);

  renderResult(state);
}
function renderResult(state) {
  let output = "";

  state.hasil.forEach(h => {
    output += `${h.nama}: Rp ${h.perOrang.toLocaleString()}\n`;
  });

  if (state.sisa > 0) {
    output += `\nSisa harta: Rp ${state.sisa.toLocaleString()}`;
  }
  window.location.href = '#hasilSemua';
  document.getElementById("hasil").value = output;
}



