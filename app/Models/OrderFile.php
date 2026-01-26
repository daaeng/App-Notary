<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderFile extends Model
{
    protected $guarded = [];

    // Relasi balik ke Order (Opsional)
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
