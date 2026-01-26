<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ubah jadi true agar bisa dipakai
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:perorangan,badan_hukum',
            'nik_or_npwp' => 'required|string|max:30|unique:clients,nik_or_npwp',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
        ];
    }

    public function messages()
    {
        return [
            'nik_or_npwp.unique' => 'NIK atau NPWP ini sudah terdaftar.',
            'name.required' => 'Nama klien wajib diisi.',
            'type.required' => 'Tipe klien wajib dipilih.',
        ];
    }
}
