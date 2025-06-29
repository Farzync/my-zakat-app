import { prisma } from "../lib/prisma"

const userId = "cmcbwd3i00000ofdkbz2tvjua"
const img = "x"

enum ZakatType {
  FITRAH = "FITRAH",
  MAL = "MAL",
  INFAK = "INFAK",
  OTHER = "OTHER"
}

enum OnBehalfOfType {
  SELF = "SELF",
  FAMILY = "FAMILY",
  BADAL = "BADAL",
  OTHER = "OTHER"
}

enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  E_WALLET = "E_WALLET",
  OTHER = "OTHER"
}

enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF"
}

interface Transaction {
  id: string
  donorName: string
  recipientName: string
  onBehalfOf: Array<{
    id: string
    type: OnBehalfOfType
    name: string
  }>
  amount: number
  date: Date
  paymentMethod: PaymentMethod
  zakatType: ZakatType
  notes?: string | null
  donorSignature?: string | null
  recipientSignature?: string | null
  userId: string
  user?: {
    id: string
    username: string
    name: string
    role: UserRole
  }
}

// Data pools untuk randomisasi
const donorNames = [
  "Abdul Rahman", "Siti Aminah", "Muhammad Fadli", "Fatimah Zahra", "Ahmad Syahrul",
  "Khadijah Nur", "Umar Faruq", "Aisyah Putri", "Ali Akbar", "Mariam Salsabila",
  "Yusuf Ibrahim", "Zainab Husna", "Khalid Malik", "Ruqayyah Dewi", "Hamza Ridwan",
  "Safiyyah Rani", "Bilal Hakim", "Ummu Kultsum", "Salman Alfarisi", "Hafsa Aulia",
  "Zaid bin Haritsah", "Asma binti Abu Bakar", "Muadz Jabal", "Sakinah Indira",
  "Anas Malik", "Sumayyah Laila", "Thabit Qays", "Ramlah Ummu Habibah", "Sa'ad Waqqas",
  "Juwayriyah Harits", "Abdullah Mas'ud", "Ummu Salamah", "Abu Ubaidah", "Shafiyyah Huyay",
  "Mu'awiyah Sufyan", "Hindun binti Utbah", "Khalid Walid", "Laila Majnun",
  "Hakim Luqman", "Balkis Saba", "Sulaiman Daud", "Maryam Imran", "Zakariya Yahya",
  "Hanna Samuel", "Ishaq Ibrahim", "Sarah Hajar", "Musa Harun", "Asiyah Firaun",
  "Nuh Idris", "Hawwa Adam", "Yaqub Yusuf", "Rahil Lea"
];

const recipientNames = [
  "Ustadz Ahmad Nashir", "Ustadz Muhammad Quraish", "Ustadz Abdul Somad", "Ustadz Khalid Basalamah",
  "Ustadz Yusuf Mansur", "Ustadz Adi Hidayat", "Ustadz Felix Siauw", "Ustadz Hanan Attaki",
  "Ustadz Evie Effendi", "Ustadz Firanda Andirja", "Ustadz Subhan Bawazier", "Ustadzah Halimah Alaydrus",
  "Ustadzah Oki Setiana Dewi", "Ustadzah Mamah Dedeh", "Ustadzah Septi Gumiandari", "Ustadz Zulkifli Ali",
  "Ustadz Cholil Nafis", "Ustadz Syafiq Riza Basalamah", "Ustadz Ammi Nur Baits", "Ustadz Zainal Abidin",
  "Ustadz Erwandi Tarmizi", "Ustadz Farid Nu'man Hasan", "Ustadz Luthfi Assyaukanie", "Ustadz Quraish Shihab",
  "Ustadz Din Syamsuddin", "Ustadz Arifin Ilham", "Ustadz Abdullah Gymnastiar", "Ustadz Zainuddin MZ",
  "Ustadz Jefri Al Buchori", "Ustadz Solmed", "Pengurus Masjid Al-Ikhlas", "Panitia Zakat RT 05",
  "Takmir Masjid Baitul Hikmah", "Amil Zakat Kelurahan", "Ketua RW 03", "Bendahara Masjid",
  "Sekretaris Takmir", "Koordinator Zakat", "Petugas Lapangan", "Relawan Sosial"
];

const zakatNotes = {
  [ZakatType.FITRAH]: [
    "Zakat fitrah keluarga", "Zakat fitrah anak", "Zakat fitrah istri", "Zakat fitrah suami",
    "Zakat fitrah orang tua", "Zakat fitrah kakek nenek", "Zakat fitrah cucu", "Zakat fitrah mertua",
    "Zakat fitrah ART", "Zakat fitrah sopir", "Beras 2.5kg", "Beras 3kg premium",
    "Gandum 2.5kg", "Kurma 2.5kg", "Tepung 2.5kg", "Jagung 2.5kg"
  ],
  [ZakatType.MAL]: [
    "Zakat emas perhiasan", "Zakat perak", "Zakat simpanan bank", "Zakat deposito",
    "Zakat saham", "Zakat obligasi", "Zakat reksadana", "Zakat profesi dokter",
    "Zakat profesi guru", "Zakat profesi PNS", "Zakat profesi karyawan", "Zakat bisnis online",
    "Zakat hasil kebun", "Zakat ternak sapi", "Zakat ternak kambing", "Zakat hasil panen",
    "Zakat properti sewaan", "Zakat investasi", "Zakat bonus THR", "Zakat gaji bulanan"
  ],
  [ZakatType.INFAK]: [
    "Infaq jum'at", "Infaq pembangunan masjid", "Infaq fakir miskin", "Infaq yatim piatu",
    "Infaq bencana alam", "Infaq pendidikan", "Infaq kesehatan", "Infaq ambulan",
    "Infaq panti asuhan", "Infaq lansia", "Infaq palestina", "Infaq rohingya",
    "Infaq buku perpustakaan", "Infaq beasiswa", "Infaq air bersih", "Infaq listrik masjid"
  ],
  [ZakatType.OTHER]: [
    "Sedekah jariyah", "Wakaf tanah", "Wakaf mushaf", "Wakaf perpustakaan",
    "Fidyah puasa", "Kafarat sumpah", "Kafarat zihar", "Dam haji",
    "Dam umroh", "Aqiqah anak", "Kurban sapi", "Kurban kambing",
    "Shadaqah", "Hibah", "Hadiah", "Bantuan sosial"
  ]
};

const familyNames = [
  "Keluarga Besar Haji Abdullah", "Keluarga Pak RT", "Keluarga Bu Lurah", "Keluarga Ustadz",
  "Keluarga Dokter Ahmad", "Keluarga Pak Camat", "Keluarga Bu Guru", "Keluarga Haji Umar",
  "Keluarga Pak Kades", "Keluarga Bu Bidan", "Keluarga Almarhum Kakek", "Keluarga Nenek",
  "Keluarga Pak Kyai", "Keluarga Bu Nyai", "Keluarga Almarhum Ayah", "Keluarga Almarhumah Ibu"
];

const organizationNames = [
  "Majelis Taklim Al-Hidayah", "Pengajian Ibu-ibu", "Remaja Masjid", "Karang Taruna",
  "OSIS SMA Islam", "BEM Universitas", "Komunitas Hafidz", "Forum Guru Ngaji",
  "Ikatan Alumni Pesantren", "Persatuan Pedagang Muslim", "Komunitas Blogger Muslim",
  "Forum Wanita Islam", "Perkumpulan Dai", "Himpunan Mahasiswa Islam", "Ikatan Dokter Muslim",
  "Forum Guru Madrasah", "Persaudaraan Setaman", "Jamaah Tabligh", "Komunitas Tahfidz",
  "Forum Ukhuwah", "Majlis Dzikir", "Komunitas Tilawah", "Forum Syariah"
];

const eWalletNotes = [
  "GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "Jenius Pay", "BRImo",
  "Mandiri e-cash", "BCA mobile", "SeaBank", "Jago", "BluPay", "CIMB Pay"
];

const bankNames = [
  "BRI", "BCA", "Mandiri", "BNI", "CIMB Niaga", "Danamon", "Permata",
  "OCBC NISP", "Maybank", "Panin", "BTPN", "Mega", "Syariah Mandiri",
  "BRI Syariah", "BCA Syariah", "BNI Syariah", "Muamalat", "BRIS"
];

const otherPaymentMethods = [
  "Uang kertas", "Koin", "Cek", "Bilyet giro", "Emas batangan", "Perhiasan emas",
  "Transfer via teller", "Setoran tunai", "Money order", "Voucher", "Pulsa",
  "Barang elektronik", "Sepeda motor", "Tanah", "Rumah"
];

async function createTransaction(data: {
  donorName: string
  recipientName: string
  onBehalfOf: Array<{
    type: OnBehalfOfType
    name: string
  }>
  amount: number
  date: Date
  paymentMethod: PaymentMethod
  zakatType: ZakatType
  notes?: string
  donorSignature?: string
  recipientSignature?: string
  userId: string
}): Promise<Transaction> {
  const transaction = await prisma.transaction.create({
    data: {
      donorName: data.donorName,
      recipientName: data.recipientName,
      amount: data.amount,
      date: data.date,
      paymentMethod: data.paymentMethod,
      zakatType: data.zakatType,
      notes: data.notes,
      donorSignature: data.donorSignature,
      recipientSignature: data.recipientSignature,
      userId: data.userId,
      onBehalfOf: {
        create: data.onBehalfOf.map(behalf => ({
          type: behalf.type,
          name: behalf.name
        }))
      }
    },
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    }
  })

  return {
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }
}

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Updated amount function dengan logic yang lebih masuk akal
function getRandomAmount(zakatType: ZakatType, onBehalfOfCount: number = 1): number {
  // Base ranges yang lebih konservatif
  const baseRanges = {
    [ZakatType.FITRAH]: { min: 25000, max: 50000 },    // Fitrah biasanya nominal tetap
    [ZakatType.MAL]: { min: 50000, max: 500000 },      // Zakat mal bervariasi
    [ZakatType.INFAK]: { min: 10000, max: 200000 },    // Infaq biasanya lebih kecil
    [ZakatType.OTHER]: { min: 25000, max: 300000 }     // Sedekah dll
  };
  
  const baseRange = baseRanges[zakatType];
  let baseAmount = Math.floor(Math.random() * (baseRange.max - baseRange.min + 1)) + baseRange.min;
  
  // Multiplier berdasarkan jumlah orang (untuk keluarga/komunitas)
  let multiplier = 1;
  if (onBehalfOfCount > 1) {
    // Untuk keluarga besar atau komunitas, nominal bisa lebih besar
    multiplier = Math.min(onBehalfOfCount * 0.8, 5); // Max 5x lipat
  }
  
  baseAmount = Math.floor(baseAmount * multiplier);
  
  // Rounding yang lebih realistis
  const roundingChance = Math.random();
  
  if (zakatType === ZakatType.FITRAH) {
    // Fitrah biasanya bulat 25.000, 30.000, 35.000, dst
    baseAmount = Math.round(baseAmount / 5000) * 5000;
  } else if (roundingChance < 0.6) {
    // 60% chance round ke 10.000
    baseAmount = Math.round(baseAmount / 10000) * 10000;
  } else if (roundingChance < 0.8) {
    // 20% chance round ke 5.000
    baseAmount = Math.round(baseAmount / 5000) * 5000;
  } else {
    // 20% chance round ke 25.000 (untuk nominal besar)
    baseAmount = Math.round(baseAmount / 25000) * 25000;
  }
  
  // Ensure minimum amounts
  if (baseAmount < baseRange.min) {
    baseAmount = baseRange.min;
  }
  
  return baseAmount;
}

function getRandomDistributedDate(): Date {
  // Generate dates for the last 3 years (36 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);
  
  // Create evenly distributed months
  const totalMonths = 36;
  const monthIndex = Math.floor(Math.random() * totalMonths);
  
  const targetDate = new Date(startDate);
  targetDate.setMonth(targetDate.getMonth() + monthIndex);
  
  // Random day within that month
  const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  
  targetDate.setDate(randomDay);
  
  // Random time
  targetDate.setHours(Math.floor(Math.random() * 24));
  targetDate.setMinutes(Math.floor(Math.random() * 60));
  targetDate.setSeconds(Math.floor(Math.random() * 60));
  
  return targetDate;
}

// Updated onBehalfOf function dengan logic yang lebih realistis
function generateOnBehalfOf(zakatType: ZakatType): Array<{ type: OnBehalfOfType; name: string }> {
  // Logic berbeda per jenis zakat
  switch (zakatType) {
    case ZakatType.FITRAH:
      // Fitrah biasanya untuk keluarga
      const fitrahChance = Math.random();
      if (fitrahChance < 0.4) {
        // 40% untuk diri sendiri
        return [{ type: OnBehalfOfType.SELF, name: "Diri sendiri" }];
      } else if (fitrahChance < 0.8) {
        // 40% untuk keluarga (2-5 orang)
        const familySize = Math.floor(Math.random() * 4) + 2; // 2-5 orang
        return [{
          type: OnBehalfOfType.FAMILY,
          name: `${getRandomElement(familyNames)} (${familySize} orang)`
        }];
      } else {
        // 20% untuk badal/almarhum
        return [{
          type: OnBehalfOfType.BADAL,
          name: `Almarhum ${getRandomElement(donorNames)}`
        }];
      }
      
    case ZakatType.MAL:
      // Mal biasanya individual atau keluarga inti
      const malChance = Math.random();
      if (malChance < 0.6) {
        return [{ type: OnBehalfOfType.SELF, name: "Diri sendiri" }];
      } else if (malChance < 0.9) {
        return [{
          type: OnBehalfOfType.FAMILY,
          name: `${getRandomElement(familyNames)} (keluarga inti)`
        }];
      } else {
        return [{
          type: OnBehalfOfType.BADAL,
          name: `Almarhum ${getRandomElement(donorNames)}`
        }];
      }
      
    case ZakatType.INFAK:
      // Infaq bisa dari komunitas/organisasi
      const infaqChance = Math.random();
      if (infaqChance < 0.3) {
        return [{ type: OnBehalfOfType.SELF, name: "Diri sendiri" }];
      } else if (infaqChance < 0.5) {
        return [{
          type: OnBehalfOfType.FAMILY,
          name: getRandomElement(familyNames)
        }];
      } else if (infaqChance < 0.8) {
        return [{
          type: OnBehalfOfType.OTHER,
          name: getRandomElement(organizationNames)
        }];
      } else {
        return [{
          type: OnBehalfOfType.BADAL,
          name: `Almarhum ${getRandomElement(donorNames)}`
        }];
      }
      
    case ZakatType.OTHER:
      // Other bisa beragam
      const otherChance = Math.random();
      if (otherChance < 0.4) {
        return [{ type: OnBehalfOfType.SELF, name: "Diri sendiri" }];
      } else if (otherChance < 0.6) {
        return [{
          type: OnBehalfOfType.FAMILY,
          name: getRandomElement(familyNames)
        }];
      } else if (otherChance < 0.8) {
        return [{
          type: OnBehalfOfType.OTHER,
          name: getRandomElement(organizationNames)
        }];
      } else {
        return [{
          type: OnBehalfOfType.BADAL,
          name: `Almarhum ${getRandomElement(donorNames)}`
        }];
      }
  }
}

function generatePaymentNote(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.E_WALLET:
      return getRandomElement(eWalletNotes);
    case PaymentMethod.BANK_TRANSFER:
      return `Transfer ${getRandomElement(bankNames)}`;
    case PaymentMethod.OTHER:
      return getRandomElement(otherPaymentMethods);
    case PaymentMethod.CASH:
    default:
      return "Tunai";
  }
}

async function seedRandomTransactions(count: number = 100) {
  console.log(`🚀 Starting to generate ${count} random zakat transactions with equal distribution...`);
  console.log(`📅 Date range: ${new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toDateString()} to ${new Date().toDateString()}`);
  console.log('');
  
  const startTime = Date.now();
  const dummyData = [];
  
  // Ensure equal distribution (25% each)
  const zakatTypes = Object.values(ZakatType);
  const itemsPerType = Math.floor(count / 4);
  const remainder = count % 4;
  
  // Create distribution array
  const distributedTypes: ZakatType[] = [];
  zakatTypes.forEach((type, index) => {
    const itemCount = itemsPerType + (index < remainder ? 1 : 0);
    for (let i = 0; i < itemCount; i++) {
      distributedTypes.push(type);
    }
  });
  
  // Shuffle untuk randomisasi urutan
  const shuffledTypes = shuffleArray(distributedTypes);
  const shuffledDonors = shuffleArray(donorNames);
  const shuffledRecipients = shuffleArray(recipientNames);
  const shuffledPaymentMethods = shuffleArray(Object.values(PaymentMethod));
  
  console.log(`📊 Target distribution: ${itemsPerType} transactions per type (remainder: ${remainder})`);
  console.log('');
  
  for (let i = 0; i < count; i++) {
    const progress = Math.floor((i / count) * 100);
    
    const zakatType = shuffledTypes[i];
    const paymentMethod = shuffledPaymentMethods[i % shuffledPaymentMethods.length];
    const donorName = shuffledDonors[i % shuffledDonors.length];
    const recipientName = shuffledRecipients[i % shuffledRecipients.length];
    
    const onBehalfOf = generateOnBehalfOf(zakatType);
    const onBehalfOfCount = onBehalfOf.length > 0 && onBehalfOf[0].name.includes('orang') ? 
      parseInt(onBehalfOf[0].name.match(/\((\d+) orang\)/)?.[1] || '1') : 1;
    
    const amount = getRandomAmount(zakatType, onBehalfOfCount);
    
    // Combine zakat notes with payment notes
    const zakatNote = getRandomElement(zakatNotes[zakatType]);
    const paymentNote = generatePaymentNote(paymentMethod);
    const combinedNotes = paymentMethod === PaymentMethod.CASH ? 
      zakatNote : 
      `${zakatNote} - ${paymentNote}`;
    
    const transaction = {
      donorName,
      recipientName,
      amount,
      date: getRandomDistributedDate(),
      paymentMethod,
      zakatType,
      notes: combinedNotes,
      donorSignature: img,
      recipientSignature: img,
      userId,
      onBehalfOf
    };
    
    dummyData.push(transaction);
    
    // Log progress every 10% or every 50 transactions (whichever is smaller)
    const logInterval = Math.min(Math.ceil(count / 10), 50);
    if ((i + 1) % logInterval === 0 || i === count - 1) {
      console.log(`📝 Generated ${i + 1}/${count} transactions (${progress}%)`);
    }
  }
  
  console.log('');
  console.log('🔄 Sorting transactions by date...');
  
  // Sort by date for better organization
  dummyData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log('💾 Inserting transactions to database...');
  console.log('');
  
  // Insert all transactions with individual logging
  for (let i = 0; i < dummyData.length; i++) {
    const data = dummyData[i];
    
    try {
      const transaction = await createTransaction(data);
      
      const onBehalfText = data.onBehalfOf.length > 0 ? ` (${data.onBehalfOf[0].name})` : '';
      const logMessage = `✅ [${i + 1}/${count}] ${data.donorName} → ${data.recipientName} | ${data.zakatType} | Rp ${data.amount.toLocaleString('id-ID')}${onBehalfText} | ${data.date.toLocaleDateString('id-ID')}`;
      console.log(logMessage);
      
    } catch (error) {
      console.error(`❌ [${i + 1}/${count}] Failed to create transaction:`, error);
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('');
  console.log(`🎉 ${count} random transactions inserted successfully in ${duration}s!`);
  
  // Calculate and print detailed statistics
  const stats = {
    fitrah: dummyData.filter(t => t.zakatType === ZakatType.FITRAH).length,
    mal: dummyData.filter(t => t.zakatType === ZakatType.MAL).length,
    infaq: dummyData.filter(t => t.zakatType === ZakatType.INFAK).length,
    other: dummyData.filter(t => t.zakatType === ZakatType.OTHER).length,
  };
  
  const paymentStats = {
    cash: dummyData.filter(t => t.paymentMethod === PaymentMethod.CASH).length,
    bankTransfer: dummyData.filter(t => t.paymentMethod === PaymentMethod.BANK_TRANSFER).length,
    eWallet: dummyData.filter(t => t.paymentMethod === PaymentMethod.E_WALLET).length,
    other: dummyData.filter(t => t.paymentMethod === PaymentMethod.OTHER).length,
  };
  
  const totalAmount = dummyData.reduce((sum, t) => sum + t.amount, 0);
  
  // Amount stats per zakat type
  const amountStats = {
    fitrah: dummyData.filter(t => t.zakatType === ZakatType.FITRAH).reduce((sum, t) => sum + t.amount, 0),
    mal: dummyData.filter(t => t.zakatType === ZakatType.MAL).reduce((sum, t) => sum + t.amount, 0),
    infaq: dummyData.filter(t => t.zakatType === ZakatType.INFAK).reduce((sum, t) => sum + t.amount, 0),
    other: dummyData.filter(t => t.zakatType === ZakatType.OTHER).reduce((sum, t) => sum + t.amount, 0),
  };
  
  console.log('');
  console.log('📊 TRANSACTION STATISTICS:');
  console.log('═══════════════════════════');
  console.log('🔢 Zakat Types Distribution (Target: 25% each):');
  console.log(`   • Fitrah: ${stats.fitrah} transactions (${((stats.fitrah/count)*100).toFixed(1)}%) - Avg: Rp ${stats.fitrah > 0 ? Math.round(amountStats.fitrah/stats.fitrah).toLocaleString('id-ID') : '0'}`);
  console.log(`   • Mal: ${stats.mal} transactions (${((stats.mal/count)*100).toFixed(1)}%) - Avg: Rp ${stats.mal > 0 ? Math.round(amountStats.mal/stats.mal).toLocaleString('id-ID') : '0'}`);
  console.log(`   • Infaq: ${stats.infaq} transactions (${((stats.infaq/count)*100).toFixed(1)}%) - Avg: Rp ${stats.infaq > 0 ? Math.round(amountStats.infaq/stats.infaq).toLocaleString('id-ID') : '0'}`);
  console.log(`   • Other: ${stats.other} transactions (${((stats.other/count)*100).toFixed(1)}%) - Avg: Rp ${stats.other > 0 ? Math.round(amountStats.other/stats.other).toLocaleString('id-ID') : '0'}`);
  console.log('');
  console.log('💳 Payment Methods:');
  console.log(`   • Cash: ${paymentStats.cash} transactions (${((paymentStats.cash/count)*100).toFixed(1)}%)`);
  console.log(`   • Bank Transfer: ${paymentStats.bankTransfer} transactions (${((paymentStats.bankTransfer/count)*100).toFixed(1)}%)`);
  console.log(`   • E-Wallet: ${paymentStats.eWallet} transactions (${((paymentStats.eWallet/count)*100).toFixed(1)}%)`);
  console.log(`   • Other: ${paymentStats.other} transactions (${((paymentStats.other/count)*100).toFixed(1)}%)`);
  console.log('');
  console.log('💰 Financial Summary:');
  console.log(`   • Total Amount: Rp ${totalAmount.toLocaleString('id-ID')}`);
  console.log(`   • Overall Average: Rp ${Math.round(totalAmount / count).toLocaleString('id-ID')}`);
  console.log(`   • Total Transactions: ${dummyData.length}`);
  console.log(`   • Average: Rp ${Math.round(totalAmount / count).toLocaleString('id-ID')}`);
  console.log(`   • Min Amount: Rp ${Math.min(...dummyData.map(t => t.amount)).toLocaleString('id-ID')}`);
  console.log(`   • Max Amount: Rp ${Math.max(...dummyData.map(t => t.amount)).toLocaleString('id-ID')}`);
  console.log('');
  console.log('📅 Date Distribution (last 12 months):');
  console.log('');
  console.log('⚡ Performance:');
  console.log(`   • Processing time: ${duration}s`);
  console.log(`   • Average: ${(duration/count*1000).toFixed(2)}ms per transaction`);
}

// Usage examples with different counts:
seedRandomTransactions(434);    // Generate 50 transactions