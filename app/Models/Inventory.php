<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $guarded = [];

    // Relasi: 1 Barang punya banyak Log Riwayat
    public function logs()
    {
        return $this->hasMany(InventoryLog::class)->latest();
    }
}
