import type { Customer } from '@/types'

interface SeedCustomerInput {
  id: string
  name: string
  nikSuffix: string
  dob: string
  maritalStatus: 'Single' | 'Married'
  spouseName?: string
  spouseNikSuffix?: string
  spouseDob?: string
  phone: string
  email: string
  address: string
  occupation: string
  monthlyIncome: number
  createdAt: string
}

const RAW: SeedCustomerInput[] = [
  {
    id: 'cust-1', name: 'Budi Santoso', nikSuffix: '000001', dob: '1988-04-12',
    maritalStatus: 'Married', spouseName: 'Ratna Santoso', spouseNikSuffix: '000002', spouseDob: '1990-07-03',
    phone: '081234500001', email: 'budi.santoso@example.com', address: 'Jl. Melati No. 12, Jakarta',
    occupation: 'Karyawan Swasta', monthlyIncome: 12_000_000, createdAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'cust-2', name: 'Siti Rahma', nikSuffix: '000003', dob: '1993-11-02',
    maritalStatus: 'Single',
    phone: '081234500003', email: 'siti.rahma@example.com', address: 'Jl. Kenanga No. 5, Malang',
    occupation: 'Guru', monthlyIncome: 8_500_000, createdAt: '2026-09-15T08:30:00.000Z',
  },
  {
    id: 'cust-3', name: 'Andi Pratama', nikSuffix: '000004', dob: '1985-02-20',
    maritalStatus: 'Married', spouseName: 'Lina Pratama', spouseNikSuffix: '000005', spouseDob: '1987-09-18',
    phone: '081234500004', email: 'andi.pratama@example.com', address: 'Jl. Sudirman No. 88, Surabaya',
    occupation: 'Wiraswasta', monthlyIncome: 18_000_000, createdAt: '2026-09-14T08:50:00.000Z',
  },
  {
    id: 'cust-4', name: 'Dimas Saputra', nikSuffix: '000006', dob: '1996-06-30',
    maritalStatus: 'Single',
    phone: '081234500006', email: 'dimas.saputra@example.com', address: 'Jl. Diponegoro No. 3, Malang',
    occupation: 'Teknisi', monthlyIncome: 7_000_000, createdAt: '2026-09-15T10:45:00.000Z',
  },
  {
    id: 'cust-5', name: 'Rizky Maulana', nikSuffix: '000007', dob: '1992-01-15',
    maritalStatus: 'Single',
    phone: '081234500007', email: 'rizky.maulana@example.com', address: 'Jl. Gatot Subroto No. 21, Jakarta',
    occupation: 'Konsultan', monthlyIncome: 15_000_000, createdAt: '2026-09-15T07:15:00.000Z',
  },
  {
    id: 'cust-6', name: 'Fajar Nugroho', nikSuffix: '000008', dob: '1984-08-08',
    maritalStatus: 'Married', spouseName: 'Dewi Nugroho', spouseNikSuffix: '000009', spouseDob: '1986-03-25',
    phone: '081234500008', email: 'fajar.nugroho@example.com', address: 'Jl. Ahmad Yani No. 45, Surabaya',
    occupation: 'PNS', monthlyIncome: 10_000_000, createdAt: '2026-09-13T08:45:00.000Z',
  },
  {
    id: 'cust-7', name: 'Nadia Putri', nikSuffix: '000010', dob: '1995-05-05',
    maritalStatus: 'Single',
    phone: '081234500010', email: 'nadia.putri@example.com', address: 'Jl. Cendrawasih No. 9, Malang',
    occupation: 'Desainer Grafis', monthlyIncome: 6_500_000, createdAt: '2026-09-10T08:45:00.000Z',
  },
  {
    id: 'cust-8', name: 'Aldi Wijaya', nikSuffix: '000011', dob: '1989-12-19',
    maritalStatus: 'Married', spouseName: 'Sari Wijaya', spouseNikSuffix: '000012', spouseDob: '1991-10-11',
    phone: '081234500011', email: 'aldi.wijaya@example.com', address: 'Jl. Veteran No. 67, Jakarta',
    occupation: 'Akuntan', monthlyIncome: 14_000_000, createdAt: '2026-09-08T08:45:00.000Z',
  },
  {
    id: 'cust-9', name: 'Rina Maharani', nikSuffix: '000013', dob: '1997-03-27',
    maritalStatus: 'Single',
    phone: '081234500013', email: 'rina.maharani@example.com', address: 'Jl. Panglima Sudirman No. 14, Surabaya',
    occupation: 'Perawat', monthlyIncome: 7_500_000, createdAt: '2026-09-06T08:45:00.000Z',
  },
  {
    id: 'cust-10', name: 'Yoga Prasetyo', nikSuffix: '000014', dob: '1983-09-09',
    maritalStatus: 'Married', spouseName: 'Ayu Prasetyo', spouseNikSuffix: '000015', spouseDob: '1985-01-30',
    phone: '081234500014', email: 'yoga.prasetyo@example.com', address: 'Jl. Hayam Wuruk No. 30, Jakarta',
    occupation: 'Marketing Manager', monthlyIncome: 20_000_000, createdAt: '2026-09-04T08:45:00.000Z',
  },
  {
    id: 'cust-11', name: 'Wulan Setiawati', nikSuffix: '000016', dob: '1994-07-07',
    maritalStatus: 'Single',
    phone: '081234500016', email: 'wulan.setiawati@example.com', address: 'Jl. Basuki Rahmat No. 22, Malang',
    occupation: 'Apoteker', monthlyIncome: 9_000_000, createdAt: '2026-09-01T08:45:00.000Z',
  },
  {
    id: 'cust-12', name: 'Bagus Kurniawan', nikSuffix: '000017', dob: '1990-10-10',
    maritalStatus: 'Married', spouseName: 'Intan Kurniawan', spouseNikSuffix: '000018', spouseDob: '1992-06-14',
    phone: '081234500017', email: 'bagus.kurniawan@example.com', address: 'Jl. Pemuda No. 55, Surabaya',
    occupation: 'Insinyur', monthlyIncome: 13_500_000, createdAt: '2026-09-14T12:45:00.000Z',
  },
  {
    id: 'cust-13', name: 'Melati Anggraini', nikSuffix: '000019', dob: '1998-02-14',
    maritalStatus: 'Single',
    phone: '081234500019', email: 'melati.anggraini@example.com', address: 'Jl. Merdeka No. 8, Jakarta',
    occupation: 'Dokter', monthlyIncome: 22_000_000, createdAt: '2026-09-12T08:45:00.000Z',
  },
  {
    id: 'cust-14', name: 'Eko Wibowo', nikSuffix: '000020', dob: '1986-12-01',
    maritalStatus: 'Married', spouseName: 'Yuni Wibowo', spouseNikSuffix: '000021', spouseDob: '1988-04-22',
    phone: '081234500020', email: 'eko.wibowo@example.com', address: 'Jl. Imam Bonjol No. 17, Malang',
    occupation: 'Arsitek', monthlyIncome: 16_000_000, createdAt: '2026-09-13T08:45:00.000Z',
  },
]

export const SEED_CUSTOMERS: Customer[] = RAW.map((c) => ({
  id: c.id,
  name: c.name,
  nik: `3573${c.dob.replace(/-/g, '').slice(2)}${c.nikSuffix.slice(-2)}`.padEnd(16, '0').slice(0, 16),
  dob: c.dob,
  maritalStatus: c.maritalStatus,
  spouse:
    c.maritalStatus === 'Married' && c.spouseName
      ? {
          name: c.spouseName,
          nik: `3573${(c.spouseDob ?? c.dob).replace(/-/g, '').slice(2)}${(c.spouseNikSuffix ?? '000000').slice(-2)}`
            .padEnd(16, '0')
            .slice(0, 16),
          dob: c.spouseDob ?? c.dob,
        }
      : undefined,
  phone: c.phone,
  email: c.email,
  address: c.address,
  occupation: c.occupation,
  monthlyIncome: c.monthlyIncome,
  createdAt: c.createdAt,
}))
