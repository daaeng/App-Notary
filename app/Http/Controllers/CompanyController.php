<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    // Tampilkan Halaman Edit
    public function edit()
    {
        $company = Company::firstOrFail();

        // UBAH DARI 'Settings/Edit' MENJADI 'Office/Edit'
        return Inertia::render('Office/Edit', [
            'company' => $company
        ]);
    }

    // Simpan Perubahan
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'notary_name' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
        ]);

        $company = Company::firstOrFail();

        $company->update([
            'name' => $request->name,
            'notary_name' => $request->notary_name,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
        ]);

        return back()->with('success', 'Profil kantor berhasil diperbarui!');
    }
}
