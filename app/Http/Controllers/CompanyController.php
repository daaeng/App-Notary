<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit()
    {
        // Ambil data perusahaan pertama, jika tidak ada error 404
        // Pastikan sudah menjalankan seeder minimal sekali
        $company = Company::firstOrFail();

        return Inertia::render('Office/Edit', [
            'company' => $company
        ]);
    }

    public function update(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'notary_name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email',
            'bank_account' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        $company = Company::firstOrFail();
        $data = $request->except(['logo']); // Ambil semua data form kecuali file logo

        // LOGIC UPLOAD LOGO
        if ($request->hasFile('logo')) {
            // 1. Hapus logo lama jika ada di database DAN filenya ada di storage
            if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                Storage::disk('public')->delete($company->logo_path);
            }

            // 2. Simpan logo baru ke folder 'public/company_logo'
            // Hasilnya path seperti: "company_logo/namafileacak.jpg"
            $path = $request->file('logo')->store('company_logo', 'public');
            $data['logo_path'] = $path;
        }

        // Update database dengan data baru
        $company->update($data);

        // Kembali ke halaman sebelumnya dengan pesan sukses
        return back()->with('success', 'Profil kantor berhasil diperbarui!');
    }

    // [BARU] FUNGSI HAPUS LOGO
    public function destroyLogo()
    {
        $company = Company::firstOrFail();

        // Cek apakah ada logo untuk dihapus
        if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            // Hapus file fisik
            Storage::disk('public')->delete($company->logo_path);
            // Set kolom di database jadi null
            $company->update(['logo_path' => null]);

            return back()->with('success', 'Logo kantor berhasil dihapus.');
        }

        return back()->with('error', 'Tidak ada logo yang dapat dihapus.');
    }
}
