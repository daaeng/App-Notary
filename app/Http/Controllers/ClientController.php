<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ClientController extends Controller
{

    public function index()
    {
        // Kita kirim data klien seperti biasa
        $clients = Client::latest()->paginate(10);

        return Inertia::render('Clients/Index', [
            'clients' => $clients
        ]);
    }

    // HAPUS function create() -> Tidak butuh lagi

    public function store(StoreClientRequest $request)
    {
        Client::create($request->validated());

        // Redirect back agar modal tertutup otomatis & data refresh
        return redirect()->back()->with('message', 'Data klien berhasil disimpan.');
    }

    public function update(StoreClientRequest $request, Client $client)
    {
        $client->update($request->validated());

        return redirect()->back()->with('message', 'Data klien berhasil diperbarui.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->back()->with('message', 'Data klien dihapus.');
    }
}
