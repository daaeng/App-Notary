<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        // 1. Cari di Klien (Nama / NIK)
        $clients = Client::where('name', 'like', "%{$query}%")
            ->orWhere('nik_or_npwp', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'name', 'type']);

        // 2. Cari di Order (Nomor Order / Deskripsi)
        $orders = Order::with('client:id,name') // Ambil nama klien juga
            ->where('order_number', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'order_number', 'description', 'status', 'client_id']);

        // 3. Cari di User/Pegawai (Nama)
        $users = User::where('name', 'like', "%{$query}%")
            ->limit(2)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'clients' => $clients,
            'orders' => $orders,
            'users' => $users,
        ]);
    }
}
