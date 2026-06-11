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
        $company = Company::firstOrFail();
        return Inertia::render('Office/Edit', ['company' => $company]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'notary_name' => 'required|string|max:255',
            'sk_number' => 'nullable|string|max:255', // [BARU] Validasi SK
            'address' => 'required|string',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'staff_data' => 'nullable|array',
        ]);

        $company = Company::firstOrFail();
        $data = $request->except(['logo']);

        if ($request->hasFile('logo')) {
            if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $path = $request->file('logo')->store('company_logo', 'public');
            $data['logo_path'] = $path;
        }

        $company->update($data);
        return back()->with('success', 'Profil kantor berhasil diperbarui!');
    }

    public function destroyLogo()
    {
        $company = Company::firstOrFail();
        if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            Storage::disk('public')->delete($company->logo_path);
            $company->update(['logo_path' => null]);
            return back()->with('success', 'Logo kantor berhasil dihapus.');
        }
        return back()->with('error', 'Tidak ada logo yang dapat dihapus.');
    }
}
