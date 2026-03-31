<?php

namespace App\Http\Controllers;

use App\Models\Register;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function index(Request $request)
    {
        // Default ke 'akta' jika tidak ada parameter type
        $type = $request->query('type', 'akta');

        $registers = Register::where('type', $type)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Registers/Index', [
            'registers' => $registers,
            'currentType' => $type
        ]);
    }

    public function store(Request $request)
{
    // Validasi Dasar
    $rules = [
        'type' => 'required|in:akta,protes,legalisasi',
        'halaman_buku' => 'required|string',
        'nama_penghadap' => 'required|string',
    ];

    // Validasi Spesifik per Buku
    if ($request->type === 'akta') {
        $rules['nomor_bulanan'] = 'required|string';
        $rules['tanggal_akta'] = 'required|date';
        $rules['sifat_akta'] = 'required|string';
    } elseif ($request->type === 'protes') {
        $rules['nomor_akta'] = 'required|string';
        $rules['tanggal'] = 'required|date';
        $rules['yang_ditagih'] = 'required|string';
        $rules['yang_menagih'] = 'required|string';
        $rules['tanggal_wesel'] = 'required|date';
        $rules['tanggal_jatuh_waktu'] = 'required|date';
    } elseif ($request->type === 'legalisasi') {
        $rules['tanggal_surat'] = 'required|date';
        $rules['tanggal_didaftarkan'] = 'required|date';
        $rules['sifat_surat'] = 'required|string';
    }

    $request->validate($rules);

    $lastNumber = Register::where('type', $request->type)->max('nomor_urut') ?? 0;

    Register::create(array_merge($request->all(), [
        'nomor_urut' => $lastNumber + 1
    ]));

    return back()->with('success', 'Data klampening berhasil dicatat.');
}

    public function destroy(Register $register)
    {
        $register->delete();
        return back()->with('success', 'Data berhasil dihapus.');
    }
}
