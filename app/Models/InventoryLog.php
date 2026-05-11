<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $guarded = [];

    // Relasi balik ke Barang
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }
}
